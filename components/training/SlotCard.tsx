'use client'

import { useEffect, useState } from 'react'
import { weightStepIncrement } from '@/lib/engine'
import type { SlotStateDTO } from '@/lib/types-app'
import type { ReductionSuggestion } from './TrainingApp'

const RIR_OPTIONS = ['0', '1', '2', '3', '4+'] as const

function StepperButton({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-chip text-[18px] font-semibold text-ink disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export function SlotCard({
  slot,
  weightOverride,
  reductionSuggestion,
  onLogSet,
  onAcceptReduction,
  onDismissReduction,
}: {
  slot: SlotStateDTO
  weightOverride: number | undefined
  reductionSuggestion: ReductionSuggestion | 'accepted' | undefined
  onLogSet: (slot: SlotStateDTO, weight: number | null, reps: number, rir: number | null) => Promise<void>
  onAcceptReduction: () => void
  onDismissReduction: () => void
}) {
  const isBodyweight = slot.loadType !== 'external'
  const activeIndex = slot.loggedSets.length
  const isLastSet = activeIndex === slot.targetSets - 1
  const fallbackWeight = slot.currentWeight ?? 20

  const [draftWeight, setDraftWeight] = useState(weightOverride ?? fallbackWeight)
  const [draftReps, setDraftReps] = useState(slot.repRangeMax)
  const [draftRir, setDraftRir] = useState<number | null>(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    setDraftWeight(weightOverride ?? fallbackWeight)
    setDraftReps(slot.repRangeMax)
    setDraftRir(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, weightOverride])

  if (slot.isComplete) {
    return (
      <div className="mb-2.5 flex items-center justify-between gap-2 rounded-2xl border border-card-border bg-card px-4 py-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="truncate-name text-[15px] font-bold">{slot.exerciseName}</div>
          <div className="no-wrap-badge rounded-lg bg-black/[0.06] px-2 py-[3px] text-[10px] font-bold tracking-wide text-black/60">
            {slot.badgeLabel}
          </div>
        </div>
        <div className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-ink text-[12px] text-white">
          ✓
        </div>
      </div>
    )
  }

  const step = weightStepIncrement(draftWeight)

  async function handleConfirm() {
    setConfirming(true)
    try {
      await onLogSet(slot, isBodyweight ? null : draftWeight, draftReps, isLastSet ? draftRir : null)
    } finally {
      setConfirming(false)
    }
  }

  const canConfirm = !isLastSet || draftRir !== null

  return (
    <div className="mb-3 rounded-2xl border border-card-border bg-card p-4">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="truncate-name text-[17px] font-bold">{slot.exerciseName}</div>
          <div className="no-wrap-badge rounded-lg bg-black/[0.06] px-2 py-[3px] text-[10px] font-bold tracking-wide text-black/60">
            {slot.badgeLabel}
          </div>
        </div>
        <div className="flex-shrink-0 whitespace-nowrap text-[13px] font-bold text-black/45">
          {slot.loggedSets.length}/{slot.targetSets}
        </div>
      </div>
      <div className="mb-3 text-[13px] text-black/50">
        {slot.weightLabel} · {slot.repRangeMin}–{slot.repRangeMax} reps · RIR {slot.rirTarget}
        {slot.painFlagged && <span className="ml-1.5 font-semibold text-accent-orange">· marcado por dolor</span>}
      </div>

      {reductionSuggestion && reductionSuggestion !== 'accepted' && (
        <div className="mb-3 rounded-2xl border-l-[3px] border-accent-orange bg-white p-3.5">
          <div className="mb-1 text-[13.5px] font-bold">Ajuste sugerido</div>
          <div className="mb-2.5 text-[13px] leading-snug text-black/60">{reductionSuggestion.reason}</div>
          <div className="flex gap-2">
            <button
              onClick={onAcceptReduction}
              className="flex-1 rounded-lg border border-ink bg-ink px-3 py-2 text-[13px] font-bold text-white"
            >
              Aceptar
            </button>
            <button
              onClick={onDismissReduction}
              className="flex-1 rounded-lg border-[1.5px] border-ink bg-transparent px-3 py-2 text-[13px] font-bold text-ink"
            >
              Descartar
            </button>
          </div>
        </div>
      )}
      {reductionSuggestion === 'accepted' && (
        <div className="mb-3 rounded-xl border border-card-border bg-white px-3.5 py-2.5 text-[12.5px] text-black/60">
          ✓ Aplicado — próximas series a {weightOverride} lb.
        </div>
      )}

      {Array.from({ length: slot.targetSets }, (_, i) => {
        if (i < slot.loggedSets.length) {
          const set = slot.loggedSets[i]
          const weightPart = isBodyweight ? '' : `${set.weight} lb × `
          const rirPart = set.rir !== null ? ` · RIR ${set.rir}` : ''
          return (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <div className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-ink text-[13px] text-white">
                ✓
              </div>
              <div className="flex-1 text-[15px] text-ink">
                Set {i + 1} · {weightPart}
                {set.reps}
                {rirPart}
              </div>
            </div>
          )
        }
        if (i === slot.loggedSets.length) {
          return (
            <div key={i} className="my-1 rounded-xl bg-chip/70 px-3 py-3">
              <div className="mb-2 text-[13px] font-semibold text-ink/70">Set {i + 1}</div>
              <div className="flex items-center justify-between gap-3">
                {!isBodyweight ? (
                  <div className="flex items-center gap-2">
                    <StepperButton onClick={() => setDraftWeight((w) => Math.max(0, w - step))}>–</StepperButton>
                    <div className="min-w-[68px] text-center text-[17px] font-bold">
                      {draftWeight} {slot.weightUnitSuffix}
                    </div>
                    <StepperButton onClick={() => setDraftWeight((w) => w + step)}>+</StepperButton>
                  </div>
                ) : (
                  <div className="text-[14px] font-semibold text-ink/60">
                    {slot.loadType === 'bodyweight' ? 'Peso corporal' : 'Peso corporal / asistido'}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <StepperButton onClick={() => setDraftReps((r) => Math.max(1, r - 1))}>–</StepperButton>
                  <div className="min-w-[32px] text-center text-[17px] font-bold">{draftReps}</div>
                  <StepperButton onClick={() => setDraftReps((r) => r + 1)}>+</StepperButton>
                </div>
              </div>

              {isLastSet && (
                <div className="mt-3">
                  <div className="mb-1.5 text-[12px] font-semibold text-ink/50">RIR (última serie)</div>
                  <div className="flex gap-1.5">
                    {RIR_OPTIONS.map((r) => {
                      const val = r === '4+' ? 4 : Number(r)
                      const selected = draftRir === val
                      const isTarget = val === slot.rirTarget
                      return (
                        <button
                          key={r}
                          onClick={() => setDraftRir(val)}
                          className={`h-[26px] w-[26px] rounded-full text-[11px] font-bold ${
                            selected
                              ? 'border-[1.5px] border-ink bg-hairline text-ink'
                              : isTarget
                                ? 'border-none bg-chip text-ink'
                                : 'border-none bg-chip text-ink/70'
                          }`}
                        >
                          {r}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={handleConfirm}
                disabled={!canConfirm || confirming}
                className="mt-3 w-full rounded-xl bg-ink py-2.5 text-[13.5px] font-bold text-white disabled:opacity-40"
              >
                Confirmar set
              </button>
            </div>
          )
        }
        return (
          <div key={i} className="flex items-center gap-3 py-2.5 opacity-40">
            <div className="h-[26px] w-[26px] flex-shrink-0 rounded-full border-2 border-hairline" />
            <div className="flex-1 text-[15px] text-ink/50">Set {i + 1}</div>
          </div>
        )
      })}
    </div>
  )
}
