// Single fixed user, no login. Must match the id seeded in
// supabase/migrations/0002_seed.sql.
export const APP_USER_ID = '00000000-0000-0000-0000-000000000001'

export const WEIGHT_UNIT = 'lb'

export const DAY_LABELS = ['Lower A', 'Lower B', 'Upper A', 'Upper B'] as const
export type DayLabel = (typeof DAY_LABELS)[number]

export const STOP_REASONS = [
  { key: 'out_of_time', label: 'Se me acabó el tiempo' },
  { key: 'pain', label: 'Dolor o molestia' },
  { key: 'fatigue', label: 'Fatiga, no me sentía bien' },
  { key: 'other', label: 'Otro' },
] as const
export type StopReasonKey = (typeof STOP_REASONS)[number]['key']
