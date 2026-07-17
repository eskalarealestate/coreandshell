'use client'

import type { DayLabel } from '@/lib/constants'
import type { DayProgramDTO, SlotStateDTO } from '@/lib/types-app'
import type { ReductionSuggestion } from './TrainingApp'
import { SlotCard } from './SlotCard'

export function TodayScreen({
  days,
  currentDay,
  onSelectDay,
  program,
  loading,
  layoffVisible,
  onDismissLayoff,
  weightOverrides,
  reductionSuggestions,
  onLogSet,
  onAcceptReduction,
  onDismissReduction,
  onFinish,
  finishing,
}: {
  days: readonly DayLabel[]
  currentDay: DayLabel
  onSelectDay: (d: DayLabel) => void
  program: DayProgramDTO
  loading: boolean
  layoffVisible: boolean
  onDismissLayoff: () => void
  weightOverrides: Record<string, number>
  reductionSuggestions: Record<string, ReductionSuggestion | 'accepted' | undefined>
  onLogSet: (slot: SlotStateDTO, weight: number | null, reps: number, rir: number | null) => Promise<void>
  onAcceptReduction: (slotId: string) => void
  onDismissReduction: (slotId: string) => void
  onFinish: () => void
  finishing: boolean
}) {
  const pct = program.totalSets ? Math.round((program.doneSets / program.totalSets) * 100) : 0

  return (
    <div className="flex h-full min-h-screen flex-col">
      <div className="flex-shrink-0 px-5 pt-8 pb-2.5">
        <div className="mb-3.5 flex gap-1.5">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => onSelectDay(d)}
              className={`flex-1 rounded-2xl border px-3 py-2.5 text-[12.5px] font-bold transition-colors ${
                d === currentDay
                  ? 'border-ink bg-ink text-white'
                  : 'border-hairline bg-white text-ink/55'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="text-[30px] font-extrabold tracking-tight">{currentDay}</div>
        <div className="mt-2.5 flex items-center gap-2.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-hairline">
            <div className="h-full rounded-full bg-ink transition-[width] duration-300" style={{ width: `${pct}%` }} />
          </div>
          <div className="whitespace-nowrap text-[13px] font-semibold text-ink/55">
            {program.doneSets}/{program.totalSets} sets
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 pt-3.5 pb-4">
        {layoffVisible && (
          <div className="mb-3.5 rounded-2xl border-l-[3px] border-accent-blue bg-white p-4">
            <div className="mb-1 text-[16px] font-bold">Semana 1 · modificador por layoff activo</div>
            <div className="mb-3.5 text-[13.5px] leading-snug text-black/60">
              Volumen a 65–70% y RIR objetivo en 3 esta semana. Desde la Semana 2 vuelve a números completos.
            </div>
            <div className="flex gap-2">
              <button
                onClick={onDismissLayoff}
                className="flex-1 rounded-xl border border-ink bg-ink px-3 py-2.5 text-[14px] font-bold text-white"
              >
                Entendido
              </button>
              <button
                onClick={onDismissLayoff}
                className="flex-1 rounded-xl border-[1.5px] border-ink bg-transparent px-3 py-2.5 text-[14px] font-bold text-ink"
              >
                Más tarde
              </button>
            </div>
          </div>
        )}

        <div className={loading ? 'pointer-events-none opacity-50 transition-opacity' : 'transition-opacity'}>
          {program.slots.map((slot) => (
            <SlotCard
              key={slot.slotId}
              slot={slot}
              weightOverride={weightOverrides[slot.slotId]}
              reductionSuggestion={reductionSuggestions[slot.slotId]}
              onLogSet={onLogSet}
              onAcceptReduction={() => onAcceptReduction(slot.slotId)}
              onDismissReduction={() => onDismissReduction(slot.slotId)}
            />
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 px-5 pt-2.5 pb-3.5">
        <button
          onClick={onFinish}
          disabled={finishing}
          className="w-full rounded-2xl bg-ink py-[15px] text-[15px] font-bold text-white disabled:opacity-60"
        >
          Terminar sesión
        </button>
      </div>
    </div>
  )
}
