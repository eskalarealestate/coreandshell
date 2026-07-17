// Hand-written types matching supabase/migrations/0001_init.sql.
// Narrower than a full generated Database type — only the shapes this app
// actually reads/writes — which is fine since there's no codegen step
// wired up against a live project yet.

export type TechnicalDemand = 'low' | 'med' | 'high'
export type SfrTier = 'low' | 'med' | 'high'
export type LoadType = 'external' | 'bodyweight' | 'bodyweight_assisted'
export type IntensityZone = 'strength' | 'hypertrophy'
export type SessionStatus = 'planned' | 'in_progress' | 'completed_full' | 'completed_partial' | 'missed'
export type EarlyStopReason = 'out_of_time' | 'pain' | 'fatigue' | 'other'
export type PainFlagStatus = 'active' | 'cleared'

export interface ExerciseRow {
  id: string
  name: string
  muscle_groups: string[]
  movement_pattern: string
  equipment_required: string[]
  technical_demand: TechnicalDemand
  sfr_tier: SfrTier
  load_type: LoadType
}

export interface SlotRow {
  id: string
  session_template_id: string
  movement_pattern: string
  muscle_group: string
  intensity_zone: IntensityZone
  current_exercise_id: string
  order_index: number
  target_sets: number
  rep_range_min: number
  rep_range_max: number
  rir_target: number
  starting_weight: number | null
  starting_weight_note: string | null
  is_auto_calibrate: boolean
  weight_display_suffix: string | null
}

export interface SessionTemplateRow {
  id: string
  mesocycle_id: string
  day_label: string
  order_index: number
}

export interface MesocycleRow {
  id: string
  challenge_id: string
  sequence_number: number
  phase_emphasis: string
  start_date: string
  planned_duration_weeks: number
  volume_compression_factor: number
  is_layoff_week: boolean
}

export interface SessionRow {
  id: string
  user_id: string
  session_template_id: string
  scheduled_date: string
  status: SessionStatus
  early_stop_reason: EarlyStopReason | null
  started_at: string | null
  completed_at: string | null
}

export interface SetRow {
  id: string
  session_id: string
  slot_id: string
  exercise_id: string
  set_number: number
  weight: number | null
  reps: number
  rir: number | null
  created_at: string
}

export interface BodyweightLogRow {
  id: string
  user_id: string
  date: string
  weight: number
}

export interface WaistLogRow {
  id: string
  user_id: string
  date: string
  circumference: number
}

export interface PainFlagRow {
  id: string
  user_id: string
  exercise_id: string
  flagged_at: string
  status: PainFlagStatus
}

// Minimal Database shape so supabase-js generics type-check.
export interface Database {
  public: {
    Tables: {
      exercises: { Row: ExerciseRow; Insert: Partial<ExerciseRow>; Update: Partial<ExerciseRow> }
      slots: { Row: SlotRow; Insert: Partial<SlotRow>; Update: Partial<SlotRow> }
      session_templates: { Row: SessionTemplateRow; Insert: Partial<SessionTemplateRow>; Update: Partial<SessionTemplateRow> }
      mesocycles: { Row: MesocycleRow; Insert: Partial<MesocycleRow>; Update: Partial<MesocycleRow> }
      sessions: { Row: SessionRow; Insert: Partial<SessionRow>; Update: Partial<SessionRow> }
      sets: { Row: SetRow; Insert: Partial<SetRow>; Update: Partial<SetRow> }
      bodyweight_logs: { Row: BodyweightLogRow; Insert: Partial<BodyweightLogRow>; Update: Partial<BodyweightLogRow> }
      waist_circumference_logs: { Row: WaistLogRow; Insert: Partial<WaistLogRow>; Update: Partial<WaistLogRow> }
      pain_flags: { Row: PainFlagRow; Insert: Partial<PainFlagRow>; Update: Partial<PainFlagRow> }
    }
  }
}
