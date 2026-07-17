-- Personal fixed Goal Profile + Week 1 (layoff-modified) program.
-- Numbers below come directly from the user's decided Week 1 plan
-- (sets already reduced ~65-70% for the layoff modifier, Section 11/12;
-- RIR target loosened to 3). Fixed UUIDs make this idempotent-ish and easy
-- to reference elsewhere (see lib/constants.ts for APP_USER_ID).

insert into users (id, training_age) values
  ('00000000-0000-0000-0000-000000000001', 'intermediate');

insert into goal_profiles (id, user_id, goal_type, priority_tiebreak, days_per_week, session_time_budget_minutes, equipment_context, injury_flags, layoff_bucket) values
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'deficit', 'fat_loss', 4, 60, 'full_gym', '[]', '1-3wk');

insert into challenges (id, user_id, goal_profile_id, start_date, planned_duration_days, status) values
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000002', current_date, 90, 'active');

insert into mesocycles (id, challenge_id, sequence_number, phase_emphasis, start_date, planned_duration_weeks, volume_compression_factor, is_layoff_week) values
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003',
   1, 'cut', current_date, 6, 0.675, true);

insert into session_templates (id, mesocycle_id, day_label, order_index) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000004', 'Lower A', 0),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000004', 'Lower B', 1),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000004', 'Upper A', 2),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000004', 'Upper B', 3);

-- Exercises (V1 library: exactly the ~22 used in Week 1, same full tag schema Section 7 asks for)
insert into exercises (id, name, muscle_groups, movement_pattern, equipment_required, technical_demand, sfr_tier, load_type) values
  ('00000000-0000-0000-0000-000000000100', 'Sentadilla con barra', '{quads,glutes}', 'squat', '{barbell}', 'high', 'high', 'external'),
  ('00000000-0000-0000-0000-000000000101', 'Peso muerto rumano (RDL)', '{hamstrings,glutes}', 'hinge', '{barbell}', 'med', 'high', 'external'),
  ('00000000-0000-0000-0000-000000000102', 'Prensa de piernas', '{quads,glutes}', 'squat', '{machine}', 'low', 'high', 'external'),
  ('00000000-0000-0000-0000-000000000103', 'Curl femoral sentado', '{hamstrings}', 'knee_flexion', '{machine}', 'low', 'med', 'external'),
  ('00000000-0000-0000-0000-000000000104', 'Elevación de talones de pie', '{calves}', 'calf_raise', '{machine}', 'low', 'med', 'external'),

  ('00000000-0000-0000-0000-000000000105', 'Peso muerto convencional', '{hamstrings,glutes,back}', 'hinge', '{barbell}', 'high', 'high', 'external'),
  ('00000000-0000-0000-0000-000000000106', 'Sentadilla frontal/goblet', '{quads,glutes}', 'squat', '{barbell,dumbbell}', 'med', 'high', 'external'),
  ('00000000-0000-0000-0000-000000000107', 'Extensión de cuádriceps', '{quads}', 'knee_extension', '{machine}', 'low', 'med', 'external'),
  ('00000000-0000-0000-0000-000000000108', 'Hiperextensión', '{hamstrings,glutes}', 'hip_extension', '{bodyweight}', 'low', 'med', 'bodyweight'),
  ('00000000-0000-0000-0000-000000000109', 'Elevación de talones sentado', '{calves}', 'calf_raise', '{machine}', 'low', 'med', 'external'),

  ('00000000-0000-0000-0000-000000000110', 'Press banca con mancuernas', '{chest,triceps}', 'horizontal_press', '{dumbbell}', 'med', 'high', 'external'),
  ('00000000-0000-0000-0000-000000000111', 'Remo con barra', '{back}', 'horizontal_pull', '{barbell}', 'med', 'high', 'external'),
  ('00000000-0000-0000-0000-000000000112', 'Jalón al pecho', '{back}', 'vertical_pull', '{cable}', 'low', 'high', 'external'),
  ('00000000-0000-0000-0000-000000000113', 'Press inclinado con mancuernas', '{chest,shoulders}', 'horizontal_press', '{dumbbell}', 'med', 'med', 'external'),
  ('00000000-0000-0000-0000-000000000114', 'Extensión de tríceps en polea', '{triceps}', 'elbow_extension', '{cable}', 'low', 'med', 'external'),
  ('00000000-0000-0000-0000-000000000115', 'Face pull', '{shoulders,back}', 'horizontal_pull', '{cable}', 'low', 'med', 'external'),

  ('00000000-0000-0000-0000-000000000116', 'Press militar con barra', '{shoulders,triceps}', 'vertical_press', '{barbell}', 'high', 'high', 'external'),
  ('00000000-0000-0000-0000-000000000117', 'Dominadas', '{back,biceps}', 'vertical_pull', '{bodyweight}', 'med', 'high', 'bodyweight_assisted'),
  ('00000000-0000-0000-0000-000000000118', 'Press inclinado con barra', '{chest,shoulders}', 'horizontal_press', '{barbell}', 'med', 'med', 'external'),
  ('00000000-0000-0000-0000-000000000119', 'Remo sentado en polea', '{back}', 'horizontal_pull', '{cable}', 'low', 'high', 'external'),
  ('00000000-0000-0000-0000-000000000120', 'Elevaciones laterales', '{shoulders}', 'shoulder_isolation', '{dumbbell}', 'low', 'med', 'external'),
  ('00000000-0000-0000-0000-000000000121', 'Curl con barra', '{biceps}', 'elbow_flexion', '{barbell}', 'low', 'med', 'external');

-- Slots: Lower A (order = technical demand descending, per Section 10)
insert into slots (id, session_template_id, movement_pattern, muscle_group, intensity_zone, current_exercise_id, order_index, target_sets, rep_range_min, rep_range_max, rir_target, starting_weight, starting_weight_note, is_auto_calibrate, weight_display_suffix) values
  ('00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000000010', 'squat', 'quads', 'strength', '00000000-0000-0000-0000-000000000100', 0, 3, 4, 8, 3, 120, null, false, null),
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000010', 'hinge', 'hamstrings', 'hypertrophy', '00000000-0000-0000-0000-000000000101', 1, 2, 8, 15, 3, 60, null, true, null),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000010', 'squat', 'quads', 'hypertrophy', '00000000-0000-0000-0000-000000000102', 2, 2, 8, 15, 3, 450, null, false, null),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000010', 'knee_flexion', 'hamstrings', 'hypertrophy', '00000000-0000-0000-0000-000000000103', 3, 2, 8, 15, 3, 50, null, true, null),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000010', 'calf_raise', 'calves', 'hypertrophy', '00000000-0000-0000-0000-000000000104', 4, 2, 8, 15, 3, 90, null, true, null);

-- Slots: Lower B
insert into slots (id, session_template_id, movement_pattern, muscle_group, intensity_zone, current_exercise_id, order_index, target_sets, rep_range_min, rep_range_max, rir_target, starting_weight, starting_weight_note, is_auto_calibrate, weight_display_suffix) values
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000011', 'hinge', 'hamstrings', 'strength', '00000000-0000-0000-0000-000000000105', 0, 2, 4, 8, 3, 122, 'sesión de calibración', false, null),
  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000011', 'squat', 'quads', 'hypertrophy', '00000000-0000-0000-0000-000000000106', 1, 2, 8, 15, 3, 65, null, true, null),
  ('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000011', 'knee_extension', 'quads', 'hypertrophy', '00000000-0000-0000-0000-000000000107', 2, 2, 8, 15, 3, 70, null, true, null),
  ('00000000-0000-0000-0000-000000000208', '00000000-0000-0000-0000-000000000011', 'hip_extension', 'hamstrings', 'hypertrophy', '00000000-0000-0000-0000-000000000108', 3, 2, 8, 15, 3, null, null, true, null),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000011', 'calf_raise', 'calves', 'hypertrophy', '00000000-0000-0000-0000-000000000109', 4, 2, 8, 15, 3, 80, null, true, null);

-- Slots: Upper A
insert into slots (id, session_template_id, movement_pattern, muscle_group, intensity_zone, current_exercise_id, order_index, target_sets, rep_range_min, rep_range_max, rir_target, starting_weight, starting_weight_note, is_auto_calibrate, weight_display_suffix) values
  ('00000000-0000-0000-0000-000000000210', '00000000-0000-0000-0000-000000000012', 'horizontal_press', 'chest', 'strength', '00000000-0000-0000-0000-000000000110', 0, 3, 4, 8, 3, 45, null, false, 'lb c/u'),
  ('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000012', 'horizontal_pull', 'back', 'hypertrophy', '00000000-0000-0000-0000-000000000111', 1, 2, 8, 15, 3, 65, null, true, null),
  ('00000000-0000-0000-0000-000000000212', '00000000-0000-0000-0000-000000000012', 'vertical_pull', 'back', 'hypertrophy', '00000000-0000-0000-0000-000000000112', 2, 2, 8, 15, 3, 90, null, true, null),
  ('00000000-0000-0000-0000-000000000213', '00000000-0000-0000-0000-000000000012', 'horizontal_press', 'chest', 'hypertrophy', '00000000-0000-0000-0000-000000000113', 3, 2, 8, 15, 3, 35, null, true, null),
  ('00000000-0000-0000-0000-000000000214', '00000000-0000-0000-0000-000000000012', 'elbow_extension', 'triceps', 'hypertrophy', '00000000-0000-0000-0000-000000000114', 4, 2, 8, 15, 3, 40, null, true, null),
  ('00000000-0000-0000-0000-000000000215', '00000000-0000-0000-0000-000000000012', 'horizontal_pull', 'shoulders', 'hypertrophy', '00000000-0000-0000-0000-000000000115', 5, 2, 8, 15, 3, 45, null, true, null);

-- Slots: Upper B
insert into slots (id, session_template_id, movement_pattern, muscle_group, intensity_zone, current_exercise_id, order_index, target_sets, rep_range_min, rep_range_max, rir_target, starting_weight, starting_weight_note, is_auto_calibrate, weight_display_suffix) values
  ('00000000-0000-0000-0000-000000000216', '00000000-0000-0000-0000-000000000013', 'vertical_press', 'shoulders', 'strength', '00000000-0000-0000-0000-000000000116', 0, 3, 4, 8, 3, 90, null, false, null),
  ('00000000-0000-0000-0000-000000000217', '00000000-0000-0000-0000-000000000013', 'vertical_pull', 'back', 'hypertrophy', '00000000-0000-0000-0000-000000000117', 1, 2, 6, 12, 3, null, null, true, null),
  ('00000000-0000-0000-0000-000000000218', '00000000-0000-0000-0000-000000000013', 'horizontal_press', 'chest', 'hypertrophy', '00000000-0000-0000-0000-000000000118', 2, 2, 8, 15, 3, 70, null, true, null),
  ('00000000-0000-0000-0000-000000000219', '00000000-0000-0000-0000-000000000013', 'horizontal_pull', 'back', 'hypertrophy', '00000000-0000-0000-0000-000000000119', 3, 2, 8, 15, 3, 80, null, true, null),
  ('00000000-0000-0000-0000-000000000220', '00000000-0000-0000-0000-000000000013', 'shoulder_isolation', 'shoulders', 'hypertrophy', '00000000-0000-0000-0000-000000000120', 4, 2, 8, 15, 3, 15, null, true, null),
  ('00000000-0000-0000-0000-000000000221', '00000000-0000-0000-0000-000000000013', 'elbow_flexion', 'biceps', 'hypertrophy', '00000000-0000-0000-0000-000000000121', 5, 2, 8, 15, 3, 40, null, true, null);
