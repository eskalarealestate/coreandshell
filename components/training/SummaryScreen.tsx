'use client'

import { SLOT_OUTCOME_LABEL } from '@/lib/engine'
import type { SessionSummaryDTO } from '@/lib/types-app'

const PILL_CLASS: Record<string, string> = {
  progresó: 'bg-accent-green',
  se_mantuvo: 'bg-accent-cyan',
  marcado_revisar: 'bg-accent-yellow',
  parcial: 'bg-accent-yellow',
  no_registrado: 'bg-black/50',
}

const PILL_LABEL: Record<string, string> = {
  ...SLOT_OUTCOME_LABEL,
  parcial: 'Registrado parcialmente',
  no_registrado: 'No registrado',
}

export function SummaryScreen({ summary, onDone }: { summary: SessionSummaryDTO; onDone: () => void }) {
  return (
    <div className="flex min-h-screen flex-col px-5 pt-[60px] pb-5">
      <div className="mb-1 text-[24px] font-bold">{summary.isFullyComplete ? 'Sesión completa' : 'Sesión parcial'}</div>
      <div className="mb-[18px] text-[14px] text-black/50">
        {summary.dayLabel} · {summary.doneSets}/{summary.totalSets} series registradas
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-auto">
        {summary.rows.map((row) => (
          <div
            key={row.slotId}
            className="flex items-center justify-between gap-2 rounded-2xl border border-card-border bg-white px-4 py-3.5"
          >
            <div className="min-w-0">
              <div className="truncate-name text-[15px] font-semibold">{row.exerciseName}</div>
              <div className="mt-0.5 text-[12px] text-black/45">
                {row.loggedCount}/{row.targetSets} series
              </div>
            </div>
            <div
              className={`no-wrap-badge rounded-lg px-2.5 py-[5px] text-[11px] font-bold text-white ${PILL_CLASS[row.status]}`}
            >
              {PILL_LABEL[row.status]}
            </div>
          </div>
        ))}
      </div>
      <button onClick={onDone} className="mt-4 w-full flex-shrink-0 rounded-2xl bg-ink py-[15px] text-[15px] font-bold text-white">
        Listo
      </button>
    </div>
  )
}
