-- Adaptive Training App — V1 schema
-- Mirrors spec Section 17 near-directly. Single-user app: no Supabase Auth,
-- no RLS policies — all access goes through server-only code using the
-- service role key (see lib/supabase/server.ts). A fixed user row is seeded
-- in 0002_seed.sql and referenced by id everywhere.
--
-- Columns marked "program decision, stored" are deliberately NOT derived —
-- they are outputs a human (or, later, the generation pipeline) decided on,
-- same category as mesocycles.volume_compression_factor in the spec.
-- Everything else computable (current working weight, 7-day averages,
-- progression/stagnation decisions) is computed at read time in lib/engine.ts
-- and must never be added as a column here (spec Section 2 / Section 17 footer).

create extension if not exists "pgcrypto";

create type training_age as enum ('beginner', 'intermediate', 'advanced');
create type goal_type as enum ('deficit', 'maintenance', 'surplus');
create type priority_tiebreak as enum ('fat_loss', 'strength');
create type equipment_context as enum ('full_gym', 'home', 'minimal');
create type layoff_bucket as enum ('none', '1-3wk', '3-8wk', '8wk+');
create type challenge_status as enum ('active', 'completed', 'abandoned');
create type phase_emphasis as enum ('build', 'cut', 'maintain');
create type movement_pattern as enum (
  'squat', 'hinge', 'horizontal_press', 'vertical_press',
  'horizontal_pull', 'vertical_pull', 'knee_extension', 'knee_flexion',
  'hip_extension', 'shoulder_isolation', 'elbow_flexion', 'elbow_extension',
  'calf_raise', 'carry', 'other'
);
create type muscle_group as enum (
  'quads', 'hamstrings', 'glutes', 'calves', 'chest', 'back',
  'shoulders', 'triceps', 'biceps', 'core'
);
create type technical_demand as enum ('low', 'med', 'high');
create type sfr_tier as enum ('low', 'med', 'high');
create type load_type as enum ('external', 'bodyweight', 'bodyweight_assisted');
create type intensity_zone as enum ('strength', 'hypertrophy');
create type session_status as enum ('planned', 'in_progress', 'completed_full', 'completed_partial', 'missed');
create type early_stop_reason as enum ('out_of_time', 'pain', 'fatigue', 'other');
create type pain_flag_status as enum ('active', 'cleared');

create table users (
  id uuid primary key default gen_random_uuid(),
  email text,
  training_age training_age not null default 'intermediate',
  created_at timestamptz not null default now()
);

create table goal_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  goal_type goal_type not null,
  priority_tiebreak priority_tiebreak not null,
  days_per_week int not null,
  session_time_budget_minutes int not null,
  equipment_context equipment_context not null,
  injury_flags jsonb not null default '[]',
  layoff_bucket layoff_bucket not null default 'none',
  created_at timestamptz not null default now()
);

create table challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  goal_profile_id uuid not null references goal_profiles(id),
  previous_challenge_id uuid references challenges(id),
  start_date date not null,
  planned_duration_days int not null,
  status challenge_status not null default 'active'
);

create table mesocycles (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  sequence_number int not null,
  phase_emphasis phase_emphasis not null,
  start_date date not null,
  planned_duration_weeks int not null,
  volume_compression_factor numeric not null default 1.0, -- program decision, stored
  is_layoff_week boolean not null default false            -- program decision, stored (Section 11 ramp-in)
);

create table session_templates ( -- the stable skeleton (Section 2)
  id uuid primary key default gen_random_uuid(),
  mesocycle_id uuid not null references mesocycles(id) on delete cascade,
  day_label text not null,       -- "Lower A", "Upper B"
  order_index int not null
);

create table exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  muscle_groups muscle_group[] not null,
  movement_pattern movement_pattern not null,
  equipment_required text[] not null default '{}',
  technical_demand technical_demand not null,
  sfr_tier sfr_tier not null,
  load_type load_type not null default 'external'
);

create table slots ( -- training intent, currently filled by one exercise
  id uuid primary key default gen_random_uuid(),
  session_template_id uuid not null references session_templates(id) on delete cascade,
  movement_pattern movement_pattern not null,
  muscle_group muscle_group not null,
  intensity_zone intensity_zone not null,
  current_exercise_id uuid not null references exercises(id),
  order_index int not null,       -- drives exercise ordering (Section 10: technical demand first)
  -- Program decisions for this mesocycle, stored (same category as volume_compression_factor):
  target_sets int not null,       -- already reduced for layoff where applicable
  rep_range_min int not null,
  rep_range_max int not null,
  rir_target int not null,
  starting_weight numeric,        -- seed for the first time this slot is trained; null = pure auto-calibrate
  starting_weight_note text,      -- e.g. "sesión de calibración"; null for ordinary auto-calibrate
  is_auto_calibrate boolean not null default false,
  weight_display_suffix text      -- e.g. "lb c/u" for per-dumbbell weights; null = plain unit
);

create table sessions ( -- actual instances, not the template
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  session_template_id uuid not null references session_templates(id),
  scheduled_date date not null,
  status session_status not null default 'planned',
  early_stop_reason early_stop_reason,
  started_at timestamptz,
  completed_at timestamptz,
  unique (session_template_id, scheduled_date)
);

create table sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  slot_id uuid not null references slots(id),
  exercise_id uuid not null references exercises(id), -- may differ from slot.current_exercise_id if substituted ad hoc
  set_number int not null,
  weight numeric,       -- null only for pure-bodyweight movements
  reps int not null,
  rir numeric,           -- required by app logic on the last working set only, not a DB constraint
  created_at timestamptz not null default now()
);

create table bodyweight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  weight numeric not null,
  unique (user_id, date)
);

create table waist_circumference_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  circumference numeric not null,
  unique (user_id, date)
);

create table pain_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  flagged_at date not null,
  status pain_flag_status not null default 'active' -- never auto-cleared by the system (Section 8)
);

create index on sets (slot_id, created_at desc);
create index on sets (session_id);
create index on bodyweight_logs (user_id, date desc);
create index on waist_circumference_logs (user_id, date desc);
create index on pain_flags (exercise_id, status);
