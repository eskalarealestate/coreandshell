'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/server'
import { APP_USER_ID, WEIGHT_UNIT } from '@/lib/constants'
import {
  classifySlotOutcome,
  formatWeightLabel,
  resolveCurrentWeight,
  rollingAverage,
  todayDateString,
} from '@/lib/engine'
import type { EarlyStopReason } from '@/lib/supabase/types'
import type {
  BodyDataDTO,
  DayProgramDTO,
  SessionSummaryDTO,
  SlotStateDTO,
  SummaryRowDTO,
} from '@/lib/types-app'

async function getActiveMesocycle() {
  const sb = supabaseAdmin()
  const { data: challenge, error: challengeError } = await sb
    .from('challenges')
    .select('id')
    .eq('user_id', APP_USER_ID)
    .eq('status', 'active')
    .single()
  if (challengeError || !challenge) throw new Error('No active challenge found. Did you run the seed SQL?')

  const { data: mesocycle, error: mesoError } = await sb
    .from('mesocycles')
    .select('*')
    .eq('challenge_id', challenge.id)
    .order('sequence_number', { ascending: false })
    .limit(1)
    .single()
  if (mesoError || !mesocycle) throw new Error('No mesocycle found for the active challenge.')

  return mesocycle
}

async function getTemplateByDay(dayLabel: string, mesocycleId: string) {
  const sb = supabaseAdmin()
  const { data: template, error } = await sb
    .from('session_templates')
    .select('*')
    .eq('mesocycle_id', mesocycleId)
    .eq('day_label', dayLabel)
    .single()
  if (error || !template) throw new Error(`No session template found for ${dayLabel}`)
  return template
}

async function getTodaySession(templateId: string) {
  const sb = supabaseAdmin()
  const { data } = await sb
    .from('sessions')
    .select('*')
    .eq('session_template_id', templateId)
    .eq('scheduled_date', todayDateString())
    .maybeSingle()
  return data ?? null
}

export async function getDayProgram(dayLabel: string): Promise<DayProgramDTO> {
  const sb = supabaseAdmin()
  const mesocycle = await getActiveMesocycle()
  const template = await getTemplateByDay(dayLabel, mesocycle.id)

  const { data: slots, error: slotsError } = await sb
    .from('slots')
    .select('*, exercise:exercises(*)')
    .eq('session_template_id', template.id)
    .order('order_index')
  if (slotsError || !slots) throw new Error(slotsError?.message ?? 'Failed to load slots')

  const session = await getTodaySession(template.id)

  const setsBySlot = new Map<string, { set_number: number; weight: number | null; reps: number; rir: number | null }[]>()
  if (session) {
    const { data: sets } = await sb
      .from('sets')
      .select('slot_id, set_number, weight, reps, rir')
      .eq('session_id', session.id)
      .order('set_number')
    for (const row of sets ?? []) {
      const arr = setsBySlot.get(row.slot_id) ?? []
      arr.push(row)
      setsBySlot.set(row.slot_id, arr)
    }
  }

  const slotIds = slots.map((s) => s.id)
  const { data: lastEverSets } = await sb
    .from('sets')
    .select('slot_id, weight, created_at')
    .in('slot_id', slotIds)
    .order('created_at', { ascending: false })
  const lastWeightBySlot = new Map<string, number | null>()
  for (const row of lastEverSets ?? []) {
    if (!lastWeightBySlot.has(row.slot_id)) lastWeightBySlot.set(row.slot_id, row.weight)
  }

  const { data: painRows } = await sb
    .from('pain_flags')
    .select('exercise_id')
    .eq('user_id', APP_USER_ID)
    .eq('status', 'active')
  const painExerciseIds = new Set((painRows ?? []).map((r) => r.exercise_id))

  const slotStates: SlotStateDTO[] = slots.map((slot: any) => {
    const exercise = slot.exercise
    const loggedSets = setsBySlot.get(slot.id) ?? []
    const hasLoggedSet = lastWeightBySlot.has(slot.id)
    const currentWeight = resolveCurrentWeight(hasLoggedSet, lastWeightBySlot.get(slot.id) ?? null, slot.starting_weight)
    const weightLabel = formatWeightLabel({
      weight: currentWeight,
      unit: WEIGHT_UNIT,
      suffix: slot.weight_display_suffix,
      loadType: exercise.load_type,
      note: slot.starting_weight_note,
      isAutoCalibrate: slot.is_auto_calibrate,
    })
    return {
      slotId: slot.id,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      loadType: exercise.load_type,
      badgeLabel: slot.intensity_zone === 'strength' ? 'HEAVY COMPOUND' : 'ACCESSORY',
      repRangeMin: slot.rep_range_min,
      repRangeMax: slot.rep_range_max,
      rirTarget: slot.rir_target,
      targetSets: slot.target_sets,
      currentWeight,
      weightLabel,
      weightUnitSuffix: slot.weight_display_suffix ?? WEIGHT_UNIT,
      isAutoCalibrate: slot.is_auto_calibrate,
      loggedSets: loggedSets.map((s) => ({ setNumber: s.set_number, weight: s.weight, reps: s.reps, rir: s.rir })),
      isComplete: loggedSets.length >= slot.target_sets,
      painFlagged: painExerciseIds.has(exercise.id),
    }
  })

  const totalSets = slotStates.reduce((a, s) => a + s.targetSets, 0)
  const doneSets = slotStates.reduce((a, s) => a + s.loggedSets.length, 0)

  return {
    dayLabel,
    mesocycleId: mesocycle.id,
    isLayoffWeek: mesocycle.is_layoff_week,
    sessionId: session?.id ?? null,
    sessionStatus: session?.status ?? null,
    totalSets,
    doneSets,
    slots: slotStates,
  }
}

export async function logSet(input: {
  dayLabel: string
  slotId: string
  exerciseId: string
  weight: number | null
  reps: number
  rir: number | null
}) {
  const sb = supabaseAdmin()
  const mesocycle = await getActiveMesocycle()
  const template = await getTemplateByDay(input.dayLabel, mesocycle.id)

  let session = await getTodaySession(template.id)
  if (!session) {
    const { data: created, error } = await sb
      .from('sessions')
      .insert({
        user_id: APP_USER_ID,
        session_template_id: template.id,
        scheduled_date: todayDateString(),
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error || !created) throw new Error(error?.message ?? 'Failed to create session')
    session = created
  }

  const { count } = await sb
    .from('sets')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', session.id)
    .eq('slot_id', input.slotId)
  const setNumber = (count ?? 0) + 1

  const { error: insertError } = await sb.from('sets').insert({
    session_id: session.id,
    slot_id: input.slotId,
    exercise_id: input.exerciseId,
    set_number: setNumber,
    weight: input.weight,
    reps: input.reps,
    rir: input.rir,
  })
  if (insertError) throw new Error(insertError.message)

  revalidatePath('/')
}

export async function completeSession(dayLabel: string, reason: EarlyStopReason | null) {
  const sb = supabaseAdmin()
  const mesocycle = await getActiveMesocycle()
  const template = await getTemplateByDay(dayLabel, mesocycle.id)
  const session = await getTodaySession(template.id)
  if (!session) return

  const { error } = await sb
    .from('sessions')
    .update({
      status: reason ? 'completed_partial' : 'completed_full',
      early_stop_reason: reason,
      completed_at: new Date().toISOString(),
    })
    .eq('id', session.id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
}

export async function flagPain(exerciseId: string) {
  const sb = supabaseAdmin()
  const { data: existing } = await sb
    .from('pain_flags')
    .select('id')
    .eq('user_id', APP_USER_ID)
    .eq('exercise_id', exerciseId)
    .eq('status', 'active')
    .maybeSingle()
  if (existing) return

  const { error } = await sb.from('pain_flags').insert({
    user_id: APP_USER_ID,
    exercise_id: exerciseId,
    flagged_at: todayDateString(),
    status: 'active',
  })
  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function getSessionSummary(dayLabel: string): Promise<SessionSummaryDTO> {
  const program = await getDayProgram(dayLabel)

  const rows: SummaryRowDTO[] = program.slots.map((slot) => {
    if (slot.loggedSets.length === 0) {
      return { slotId: slot.slotId, exerciseName: slot.exerciseName, loggedCount: 0, targetSets: slot.targetSets, status: 'no_registrado' }
    }
    if (slot.loggedSets.length < slot.targetSets) {
      return {
        slotId: slot.slotId,
        exerciseName: slot.exerciseName,
        loggedCount: slot.loggedSets.length,
        targetSets: slot.targetSets,
        status: 'parcial',
      }
    }
    const last = slot.loggedSets[slot.loggedSets.length - 1]
    const outcome = classifySlotOutcome({
      reps: last.reps,
      rir: last.rir,
      repRangeMin: slot.repRangeMin,
      repRangeMax: slot.repRangeMax,
      rirTarget: slot.rirTarget,
    })
    return { slotId: slot.slotId, exerciseName: slot.exerciseName, loggedCount: slot.loggedSets.length, targetSets: slot.targetSets, status: outcome }
  })

  return {
    dayLabel,
    isFullyComplete: program.doneSets >= program.totalSets,
    doneSets: program.doneSets,
    totalSets: program.totalSets,
    earlyStopReason: null,
    rows,
  }
}

function computeWaistDueLabel(lastWaistDate: string | null): string {
  if (!lastWaistDate) return 'Primera medición cuando quieras'
  const last = new Date(lastWaistDate)
  const now = new Date()
  const daysSince = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
  const weeksSince = Math.floor(daysSince / 7)
  if (weeksSince >= 4) return 'Ya toca'
  return `Próxima en ~${4 - weeksSince} semana${4 - weeksSince === 1 ? '' : 's'}`
}

export async function getBodyData(): Promise<BodyDataDTO> {
  const sb = supabaseAdmin()
  const today = todayDateString()

  const { data: bwLogs } = await sb
    .from('bodyweight_logs')
    .select('date, weight')
    .eq('user_id', APP_USER_ID)
    .order('date', { ascending: false })
    .limit(60)
  const { data: waistLogs } = await sb
    .from('waist_circumference_logs')
    .select('date, circumference')
    .eq('user_id', APP_USER_ID)
    .order('date', { ascending: false })
    .limit(20)

  const bw = bwLogs ?? []
  const waist = waistLogs ?? []

  const rollingAvg7 = rollingAverage(bw.map((r) => ({ date: r.date, value: r.weight })), new Date())
  const todayBw = bw.find((r) => r.date === today) ?? null
  const todayWaistRow = waist.find((r) => r.date === today) ?? null

  return {
    todayWeight: todayBw?.weight ?? null,
    lastWeight: bw[0]?.weight ?? null,
    rollingAvg7,
    bwSavedToday: !!todayBw,
    todayWaist: todayWaistRow?.circumference ?? null,
    lastWaist: waist[0]?.circumference ?? null,
    waistSavedToday: !!todayWaistRow,
    waistDueLabel: computeWaistDueLabel(waist[0]?.date ?? null),
  }
}

export async function saveBodyweight(weight: number) {
  const sb = supabaseAdmin()
  const { error } = await sb
    .from('bodyweight_logs')
    .upsert({ user_id: APP_USER_ID, date: todayDateString(), weight }, { onConflict: 'user_id,date' })
  if (error) throw new Error(error.message)
  revalidatePath('/body')
}

export async function saveWaist(circumference: number) {
  const sb = supabaseAdmin()
  const { error } = await sb
    .from('waist_circumference_logs')
    .upsert({ user_id: APP_USER_ID, date: todayDateString(), circumference }, { onConflict: 'user_id,date' })
  if (error) throw new Error(error.message)
  revalidatePath('/body')
}
