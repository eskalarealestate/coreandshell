import type { EarlyStopReason, LoadType, SessionStatus } from './supabase/types'
import type { SlotOutcome } from './engine'

export interface LoggedSetDTO {
  setNumber: number
  weight: number | null
  reps: number
  rir: number | null
}

export interface SlotStateDTO {
  slotId: string
  exerciseId: string
  exerciseName: string
  loadType: LoadType
  badgeLabel: 'HEAVY COMPOUND' | 'ACCESSORY'
  repRangeMin: number
  repRangeMax: number
  rirTarget: number
  targetSets: number
  currentWeight: number | null
  weightLabel: string
  weightUnitSuffix: string
  isAutoCalibrate: boolean
  loggedSets: LoggedSetDTO[]
  isComplete: boolean
  painFlagged: boolean
}

export interface DayProgramDTO {
  dayLabel: string
  mesocycleId: string
  isLayoffWeek: boolean
  sessionId: string | null
  sessionStatus: SessionStatus | null
  totalSets: number
  doneSets: number
  slots: SlotStateDTO[]
}

export interface SummaryRowDTO {
  slotId: string
  exerciseName: string
  loggedCount: number
  targetSets: number
  status: 'no_registrado' | 'parcial' | SlotOutcome
}

export interface SessionSummaryDTO {
  dayLabel: string
  isFullyComplete: boolean
  doneSets: number
  totalSets: number
  earlyStopReason: EarlyStopReason | null
  rows: SummaryRowDTO[]
}

export interface BodyDataDTO {
  todayWeight: number | null
  lastWeight: number | null
  rollingAvg7: number | null
  bwSavedToday: boolean
  todayWaist: number | null
  lastWaist: number | null
  waistSavedToday: boolean
  waistDueLabel: string
}
