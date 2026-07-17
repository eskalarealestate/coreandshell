'use client'

import { useEffect, useState } from 'react'
import { completeSession, flagPain, getBodyData, getDayProgram, getSessionSummary, logSet } from '@/app/actions'
import { isBelowRange, suggestWeightReduction } from '@/lib/engine'
import { DAY_LABELS, type DayLabel, type StopReasonKey } from '@/lib/constants'
import type { BodyDataDTO, DayProgramDTO, SessionSummaryDTO, SlotStateDTO } from '@/lib/types-app'
import { TodayScreen } from './TodayScreen'
import { StopScreen } from './StopScreen'
import { SummaryScreen } from './SummaryScreen'
import { BodyScreen } from './BodyScreen'
import { BottomTabs } from './BottomTabs'

export type Screen = 'today' | 'stop' | 'summary' | 'body'

export interface ReductionSuggestion {
  suggestedWeight: number
  reason: string
}

export function TrainingApp({ initialDay, initialProgram }: { initialDay: DayLabel; initialProgram: DayProgramDTO }) {
  const [day, setDay] = useState<DayLabel>(initialDay)
  const [program, setProgram] = useState<DayProgramDTO>(initialProgram)
  const [screen, setScreen] = useState<Screen>('today')
  const [programLoading, setProgramLoading] = useState(false)

  const [layoffDismissed, setLayoffDismissed] = useState(true) // avoid flash before hydration reads localStorage
  useEffect(() => {
    const key = `layoff-dismissed-${program.mesocycleId}`
    setLayoffDismissed(localStorage.getItem(key) === '1')
  }, [program.mesocycleId])
  function dismissLayoff() {
    localStorage.setItem(`layoff-dismissed-${program.mesocycleId}`, '1')
    setLayoffDismissed(true)
  }

  const [weightOverrides, setWeightOverrides] = useState<Record<string, number>>({})
  const [reductionSuggestions, setReductionSuggestions] = useState<Record<string, ReductionSuggestion | 'accepted' | undefined>>({})

  const [stopReason, setStopReason] = useState<StopReasonKey | null>(null)
  const [painCandidateExerciseId, setPainCandidateExerciseId] = useState<string | null>(null)
  const [finishing, setFinishing] = useState(false)

  const [summary, setSummary] = useState<SessionSummaryDTO | null>(null)

  const [bodyData, setBodyData] = useState<BodyDataDTO | null>(null)
  const [bodyLoading, setBodyLoading] = useState(false)

  async function refetchProgram(d: DayLabel = day) {
    setProgramLoading(true)
    try {
      const p = await getDayProgram(d)
      setProgram(p)
    } finally {
      setProgramLoading(false)
    }
  }

  async function handleSelectDay(d: DayLabel) {
    setDay(d)
    setWeightOverrides({})
    setReductionSuggestions({})
    setProgramLoading(true)
    try {
      const p = await getDayProgram(d)
      setProgram(p)
    } finally {
      setProgramLoading(false)
    }
  }

  async function handleLogSet(slot: SlotStateDTO, weight: number | null, reps: number, rir: number | null) {
    await logSet({ dayLabel: day, slotId: slot.slotId, exerciseId: slot.exerciseId, weight, reps, rir })
    if (slot.loadType === 'external' && weight !== null && isBelowRange(reps, slot.repRangeMin)) {
      const suggestion = suggestWeightReduction(weight)
      setReductionSuggestions((prev) => ({ ...prev, [slot.slotId]: suggestion }))
    }
    await refetchProgram()
  }

  function acceptReduction(slotId: string) {
    const s = reductionSuggestions[slotId]
    if (s && typeof s !== 'string') {
      setWeightOverrides((prev) => ({ ...prev, [slotId]: s.suggestedWeight }))
      setReductionSuggestions((prev) => ({ ...prev, [slotId]: 'accepted' }))
    }
  }
  function dismissReduction(slotId: string) {
    setReductionSuggestions((prev) => ({ ...prev, [slotId]: undefined }))
  }

  async function handleFinish() {
    if (finishing) return
    setFinishing(true)
    try {
      if (program.doneSets >= program.totalSets && program.totalSets > 0) {
        await completeSession(day, null)
        const s = await getSessionSummary(day)
        setSummary(s)
        setScreen('summary')
      } else {
        const firstIncomplete = program.slots.find((s) => !s.isComplete)
        setPainCandidateExerciseId(firstIncomplete?.exerciseId ?? null)
        setStopReason(null)
        setScreen('stop')
      }
    } finally {
      setFinishing(false)
    }
  }

  async function handleConfirmStop() {
    if (!stopReason) return
    if (stopReason === 'pain' && painCandidateExerciseId) {
      await flagPain(painCandidateExerciseId)
    }
    await completeSession(day, stopReason)
    const s = await getSessionSummary(day)
    setSummary(s)
    setScreen('summary')
  }

  async function handleBackToToday() {
    setScreen('today')
    setWeightOverrides({})
    setReductionSuggestions({})
    await refetchProgram()
  }

  async function goBody() {
    setScreen('body')
    setBodyLoading(true)
    try {
      const d = await getBodyData()
      setBodyData(d)
    } finally {
      setBodyLoading(false)
    }
  }

  function goTrain() {
    setScreen('today')
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-app-bg">
      <div className="flex-1">
        {screen === 'today' && (
          <TodayScreen
            days={DAY_LABELS}
            currentDay={day}
            onSelectDay={handleSelectDay}
            program={program}
            loading={programLoading}
            layoffVisible={program.isLayoffWeek && !layoffDismissed}
            onDismissLayoff={dismissLayoff}
            weightOverrides={weightOverrides}
            reductionSuggestions={reductionSuggestions}
            onLogSet={handleLogSet}
            onAcceptReduction={acceptReduction}
            onDismissReduction={dismissReduction}
            onFinish={handleFinish}
            finishing={finishing}
          />
        )}
        {screen === 'stop' && (
          <StopScreen stopReason={stopReason} onPick={setStopReason} onContinue={handleConfirmStop} />
        )}
        {screen === 'summary' && summary && <SummaryScreen summary={summary} onDone={handleBackToToday} />}
        {screen === 'body' && <BodyScreen data={bodyData} loading={bodyLoading} onSaved={goBody} />}
      </div>
      {(screen === 'today' || screen === 'body') && (
        <BottomTabs active={screen === 'today' ? 'train' : 'body'} onTrain={goTrain} onBody={goBody} />
      )}
    </div>
  )
}
