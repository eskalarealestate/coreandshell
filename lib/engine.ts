// Read-time computations (spec Section 2 / 17 footer): current working
// weight, progression classification, 7-day rolling averages, and the
// mid-session weight-reduction suggestion are all derived here from Set /
// log history — nothing here is ever written back as a stored value.

import type { LoadType } from './supabase/types'

export type SlotOutcome = 'progresó' | 'se_mantuvo' | 'marcado_revisar'

export interface ClassifyInput {
  reps: number
  rir: number | null
  repRangeMin: number
  repRangeMax: number
  rirTarget: number
}

/**
 * Section 5 progression table, combining reps-vs-range with RIR — never RIR
 * alone. Mirrors the validated reference behavior:
 *  - below range, or RIR far above target (>=2 over) -> flag for review
 *  - hit top of range at/below target RIR -> progressed
 *  - otherwise -> held
 */
export function classifySlotOutcome({ reps, rir, repRangeMin, repRangeMax, rirTarget }: ClassifyInput): SlotOutcome {
  const rirValue = rir ?? rirTarget
  if (reps < repRangeMin || rirValue - rirTarget >= 2) return 'marcado_revisar'
  if (reps >= repRangeMax && rirValue <= rirTarget) return 'progresó'
  return 'se_mantuvo'
}

export const SLOT_OUTCOME_LABEL: Record<SlotOutcome, string> = {
  progresó: 'Progresó',
  se_mantuvo: 'Se mantuvo',
  marcado_revisar: 'Marcado para revisar',
}

/** A set that fell short of the prescribed rep range mid-exercise. */
export function isBelowRange(reps: number, repRangeMin: number): boolean {
  return reps < repRangeMin
}

function roundingIncrement(weight: number): number {
  return weight <= 50 ? 2.5 : 5
}

/** Step size for the weight +/- stepper in the set-logging UI. */
export function weightStepIncrement(weight: number | null): number {
  if (weight === null) return 2.5
  return roundingIncrement(weight)
}

/**
 * Suggests a ~5-10% load cut for the remaining sets of an exercise after a
 * below-range set. Never applied automatically — the caller must show the
 * one-line reason and require a tap to accept (Section 2/5).
 */
export function suggestWeightReduction(currentWeight: number): { suggestedWeight: number; reason: string } {
  const increment = roundingIncrement(currentWeight)
  const raw = currentWeight * 0.925 // ~7.5% cut, midpoint of the 5-10% band
  const suggestedWeight = Math.max(increment, Math.round(raw / increment) * increment)
  return {
    suggestedWeight,
    reason: `Serie por debajo del rango — sugerencia: bajar a ${suggestedWeight} lb (~5-10%) para las series restantes.`,
  }
}

/** Current working weight for a slot: last logged Set if any, else the seeded starting weight. */
export function resolveCurrentWeight(lastLoggedWeight: number | null | undefined, startingWeight: number | null): number | null {
  if (lastLoggedWeight !== null && lastLoggedWeight !== undefined) return lastLoggedWeight
  return startingWeight
}

export function formatWeightLabel(opts: {
  weight: number | null
  unit: string
  suffix: string | null
  loadType: LoadType
  note: string | null
  isAutoCalibrate: boolean
}): string {
  const { weight, unit, suffix, loadType, note, isAutoCalibrate } = opts
  if (loadType === 'bodyweight') return 'Peso corporal'
  if (loadType === 'bodyweight_assisted') return 'Peso corporal / asistido'
  if (weight === null) return 'Auto-calibra'
  const unitLabel = suffix ?? unit
  const prefix = isAutoCalibrate ? '~' : '~'
  const base = `${prefix}${weight} ${unitLabel}`
  return note ? `${base} (${note})` : base
}

export interface RollingAverageEntry {
  date: string // YYYY-MM-DD
  value: number
}

/** 7-day rolling average over a calendar window ending today, computed at read time. */
export function rollingAverage(entries: RollingAverageEntry[], today: Date, windowDays = 7): number | null {
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() - (windowDays - 1))
  const cutoffStr = cutoff.toISOString().slice(0, 10)
  const inWindow = entries.filter((e) => e.date >= cutoffStr && e.date <= today.toISOString().slice(0, 10))
  if (inWindow.length === 0) return null
  const sum = inWindow.reduce((a, e) => a + e.value, 0)
  return Math.round((sum / inWindow.length) * 10) / 10
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}
