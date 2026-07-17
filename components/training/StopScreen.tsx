'use client'

import { STOP_REASONS, type StopReasonKey } from '@/lib/constants'

const STOP_NOTES: Record<StopReasonKey, string> = {
  out_of_time:
    'Sin problema — el resto queda para la próxima. Si pasa 2 veces más este mesociclo, vale la pena ajustar tu presupuesto de tiempo.',
  pain: 'Este ejercicio queda marcado: no se le subirá peso hasta que confirmes que ya no molesta.',
  fatigue: 'Registrado. Nada más que hacer por ahora — solo información para el sistema.',
  other: 'Registrado.',
}

export function StopScreen({
  stopReason,
  onPick,
  onContinue,
}: {
  stopReason: StopReasonKey | null
  onPick: (r: StopReasonKey) => void
  onContinue: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col px-6 pt-[70px] pb-6">
      <div className="mb-1.5 text-[22px] font-bold">¿Por qué terminaste antes?</div>
      <div className="mb-[22px] text-[14px] leading-snug text-black/55">
        Ayuda a ajustar el plan. No hay respuesta incorrecta.
      </div>
      <div className="flex flex-1 flex-col gap-2.5">
        {STOP_REASONS.map((r) => {
          const selected = stopReason === r.key
          return (
            <button
              key={r.key}
              onClick={() => onPick(r.key)}
              className={`rounded-2xl border px-4 py-3.5 text-left text-[15px] font-semibold ${
                selected ? 'border-ink bg-ink text-white' : 'border-card-border bg-white text-ink'
              }`}
            >
              {r.label}
            </button>
          )
        })}
      </div>

      {stopReason && (
        <div className="mb-3.5 rounded-2xl border border-card-border bg-white px-4 py-3.5 text-[13px] leading-snug text-black/60">
          {STOP_NOTES[stopReason]}
        </div>
      )}

      <button
        onClick={onContinue}
        disabled={!stopReason}
        className={`w-full rounded-2xl py-[15px] text-[15px] font-bold ${
          stopReason ? 'bg-ink text-white' : 'bg-hairline text-black/40'
        }`}
      >
        Ver resumen
      </button>
    </div>
  )
}
