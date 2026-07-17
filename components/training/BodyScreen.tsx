'use client'

import { useEffect, useState } from 'react'
import { saveBodyweight, saveWaist } from '@/app/actions'
import type { BodyDataDTO } from '@/lib/types-app'

const DEFAULT_WEIGHT = 170
const DEFAULT_WAIST = 34

export function BodyScreen({
  data,
  loading,
  onSaved,
}: {
  data: BodyDataDTO | null
  loading: boolean
  onSaved: () => void
}) {
  const [bw, setBw] = useState(DEFAULT_WEIGHT)
  const [waist, setWaist] = useState(DEFAULT_WAIST)
  const [savingBw, setSavingBw] = useState(false)
  const [savingWaist, setSavingWaist] = useState(false)

  useEffect(() => {
    if (!data) return
    setBw(data.todayWeight ?? data.lastWeight ?? DEFAULT_WEIGHT)
    setWaist(data.todayWaist ?? data.lastWaist ?? DEFAULT_WAIST)
  }, [data])

  async function handleSaveBw() {
    setSavingBw(true)
    try {
      await saveBodyweight(Math.round(bw * 10) / 10)
      onSaved()
    } finally {
      setSavingBw(false)
    }
  }

  async function handleSaveWaist() {
    setSavingWaist(true)
    try {
      await saveWaist(Math.round(waist * 100) / 100)
      onSaved()
    } finally {
      setSavingWaist(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-shrink-0 px-5 pt-[60px] pb-2.5">
        <div className="text-[28px] font-extrabold tracking-tight">Cuerpo</div>
        <div className="mt-0.5 text-[13px] text-black/50">Peso diario · cintura cada ~4 semanas</div>
      </div>

      <div className="flex-1 overflow-auto px-5 pt-1.5 pb-4">
        <div className="mb-3.5 rounded-2xl border border-card-border bg-white p-[18px]">
          <div className="mb-2.5 text-[12px] font-bold uppercase tracking-wide text-black/45">Peso de hoy (lb)</div>
          <div className="mb-3.5 flex items-center gap-3.5">
            <button
              onClick={() => setBw((v) => Math.round((v - 0.2) * 10) / 10)}
              className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-chip text-[19px] font-semibold text-ink"
            >
              –
            </button>
            <div className="min-w-[80px] text-center text-[26px] font-bold">{loading ? '···' : bw}</div>
            <button
              onClick={() => setBw((v) => Math.round((v + 0.2) * 10) / 10)}
              className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-chip text-[19px] font-semibold text-ink"
            >
              +
            </button>
          </div>
          <button
            onClick={handleSaveBw}
            disabled={savingBw || loading}
            className="w-full rounded-xl bg-ink py-3 text-[14px] font-bold text-white disabled:opacity-50"
          >
            Guardar peso de hoy
          </button>
          <div className="mt-2.5 text-[12px] leading-snug text-black/45">
            {data?.rollingAvg7 ? `Promedio 7 días: ${data.rollingAvg7} lb` : 'El promedio de 7 días aparecerá con más registros.'}
          </div>
          {data?.bwSavedToday && <div className="mt-1.5 text-[12px] font-semibold text-accent-green">✓ Guardado hoy</div>}
        </div>

        <div className="rounded-2xl border border-card-border bg-white p-[18px]">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="text-[12px] font-bold uppercase tracking-wide text-black/45">Cintura (opcional)</div>
            <div className="text-[11px] text-black/40">{data?.waistDueLabel ?? ''}</div>
          </div>
          <div className="mb-3.5 flex items-center gap-3.5">
            <button
              onClick={() => setWaist((v) => Math.round((v - 0.25) * 100) / 100)}
              className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-chip text-[19px] font-semibold text-ink"
            >
              –
            </button>
            <div className="min-w-[80px] text-center text-[26px] font-bold">{loading ? '···' : waist}</div>
            <button
              onClick={() => setWaist((v) => Math.round((v + 0.25) * 100) / 100)}
              className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-chip text-[19px] font-semibold text-ink"
            >
              +
            </button>
          </div>
          <button
            onClick={handleSaveWaist}
            disabled={savingWaist || loading}
            className="w-full rounded-xl bg-chip py-3 text-[14px] font-bold text-ink disabled:opacity-50"
          >
            Guardar medición
          </button>
          <div className="mt-2.5 text-[12px] leading-snug text-black/45">
            Mismo punto anatómico, en ayunas, cinta ajustada sin apretar. Promedio de 2 medidas.
          </div>
          {data?.waistSavedToday && <div className="mt-1.5 text-[12px] font-semibold text-accent-green">✓ Guardado hoy</div>}
        </div>
      </div>
    </div>
  )
}
