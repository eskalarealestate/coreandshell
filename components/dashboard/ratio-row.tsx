'use client'

import { useMemo } from 'react'
import type { Floor } from '@/lib/building-data'
import { calcTotals } from '@/lib/building-data'
import type { LevelCounts } from '@/lib/building-data'
import { cn } from '@/lib/utils'

function RatioCard({
  label, actual, actualLabel, target, targetLabel, barPct, status, note,
}: {
  label: string; actual: string; actualLabel?: string
  target: string; targetLabel: string
  barPct: number; status: 'positive' | 'warning' | 'danger'; note?: string
}) {
  const barColor = status === 'positive' ? 'bg-positive' : status === 'warning' ? 'bg-warning' : 'bg-destructive'
  const badgeClass = status === 'positive' ? 'bg-positive/10 text-positive' : status === 'warning' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
  const badgeText = status === 'positive' ? 'En meta' : 'Bajo meta'

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-foreground">{label}</span>
        <span className={cn('rounded-md px-1.5 py-0.5 text-[12px] font-medium', badgeClass)}>{badgeText}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
          {actual}
        </span>
        {actualLabel && <span className="text-[13px] text-muted-foreground">{actualLabel}</span>}
      </div>
      <div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border-strong">
          <div className={cn('h-full rounded-full transition-[width] duration-500', barColor)} style={{ width: `${Math.min(barPct, 100)}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground/60">
          <span>0</span>
          <span>meta: {target}</span>
        </div>
      </div>
      {note && <p className="text-[11px] text-muted-foreground/70">{note}</p>}
    </div>
  )
}

export function RatioRow({ floors, counts }: { floors: Floor[]; counts: LevelCounts }) {
  const t = useMemo(() => calcTotals(floors, counts), [floors, counts])

  // Ratio position: MIVED=25, competencia=40-50
  // Lower ratio = better (more parking per m²)
  const ratioStatus = t.ratio <= 25 ? 'positive' : t.ratio <= 40 ? 'warning' : 'danger'
  const ratioPct = Math.max(0, 100 - ((t.ratio - 20) / 30) * 100) // 20=100%, 50=0%

  const effStatus = t.efficiency >= 82 ? 'positive' : t.efficiency >= 75 ? 'warning' : 'danger'
  const effPct    = (t.efficiency / 90) * 100

  const commStatus = t.commercializable >= 200 ? 'positive' : t.commercializable >= 100 ? 'warning' : 'danger'
  const commPct    = (t.commercializable / 300) * 100

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Comparación de ratios">
      <RatioCard
        label="Ratio de parqueo"
        actual={`1 × ${t.ratio}`}
        actualLabel="m² / plz"
        target="1 × 25 m² (MIVED)"
        targetLabel="1 × 25 m²"
        barPct={ratioPct}
        status={ratioStatus}
        note={`Competencia SD: 1 × 40–50 m² · Este proyecto supera ambos`}
      />
      <RatioCard
        label="Eficiencia por piso de oficinas"
        actual={`${t.efficiency.toFixed(1)}%`}
        target="82%"
        targetLabel="82%"
        barPct={effPct}
        status={effStatus}
        note={`${t.rentable.toLocaleString('es-DO')} m² netos de ${t.gross.toLocaleString('es-DO')} m² brutos`}
      />
      <RatioCard
        label="Plazas comercializables"
        actual={t.commercializable.toString()}
        actualLabel={`de ${t.totalSpaces} totales`}
        target="258 objetivo"
        targetLabel="258"
        barPct={commPct}
        status={commStatus}
        note={`${t.totalSpaces} totales − ${t.restitution} restitución = ${t.commercializable} comercializables`}
      />
    </section>
  )
}
