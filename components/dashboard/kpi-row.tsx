'use client'

import { useMemo } from 'react'
import { Car, Building2, Layers, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Floor } from '@/lib/building-data'
import { calcTotals } from '@/lib/building-data'
import type { LevelCounts } from '@/lib/building-data'
import { cn } from '@/lib/utils'

function HeroCard({
  label, value, unit, sub, tone = 'default',
}: {
  label: string; value: string; unit?: string
  sub?: { text: string; positive: boolean }; tone?: 'default' | 'positive' | 'warning' | 'danger'
}) {
  const vc = tone === 'positive' ? 'text-positive' : tone === 'warning' ? 'text-warning' : tone === 'danger' ? 'text-destructive' : 'text-foreground'
  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5">
      <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
      <div className="mt-3 flex items-end gap-2">
        <span className={cn('font-mono font-semibold leading-none tabular-nums', vc)} style={{ fontSize: '38px' }}>
          {value}
        </span>
        {unit && <span className="mb-1 text-[13px] text-muted-foreground">{unit}</span>}
      </div>
      {sub && (
        <div className={cn('mt-3 inline-flex w-fit items-center gap-1 rounded-md px-1.5 py-0.5 text-[13px] font-medium', sub.positive ? 'bg-positive/10 text-positive' : 'bg-warning/10 text-warning')}>
          {sub.positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {sub.text}
        </div>
      )}
    </div>
  )
}

function SmallCard({ icon: Icon, label, value, unit, tone }: {
  icon: LucideIcon; label: string; value: string; unit?: string; tone?: 'positive' | 'warning' | 'danger'
}) {
  const vc = tone === 'positive' ? 'text-positive' : tone === 'warning' ? 'text-warning' : tone === 'danger' ? 'text-destructive' : 'text-foreground'
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <span className="grid size-7 place-items-center rounded-md bg-secondary text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="mt-1">
        <div className="flex items-baseline gap-1">
          <span className={cn('font-mono font-semibold tabular-nums', vc)} style={{ fontSize: '28px', lineHeight: 1 }}>
            {value}
          </span>
          {unit && <span className="text-[13px] text-muted-foreground">{unit}</span>}
        </div>
        <span className="mt-1.5 block text-[13px] text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

export function KpiRow({ floors, counts }: { floors: Floor[]; counts: LevelCounts }) {
  const t = useMemo(() => calcTotals(floors, counts), [floors, counts])

  const ratioTag = t.ratio <= 25
    ? { text: 'Superior a norma MIVED', positive: true }
    : t.ratio <= 40
      ? { text: 'Sobre competencia SD', positive: true }
      : { text: 'Bajo ratio de mercado', positive: false }

  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7" aria-label="Indicadores clave">
      {/* Hero 1 — Área rentable */}
      <div className="col-span-2 lg:col-span-2">
        <HeroCard
          label="Área rentable total"
          value={`${(t.rentable / 1000).toFixed(2)}K`}
          unit="m²"
          tone="positive"
          sub={{ text: `eficiencia ${t.efficiency.toFixed(0)}% bruto/neto`, positive: t.efficiency >= 80 }}
        />
      </div>

      {/* Hero 2 — Comercializables */}
      <div className="col-span-2 lg:col-span-2">
        <HeroCard
          label="Plazas comercializables"
          value={t.commercializable.toString()}
          unit="plazas"
          tone={t.ratio <= 40 ? 'positive' : 'warning'}
          sub={ratioTag}
        />
      </div>

      {/* Small cards */}
      <SmallCard icon={Car} label="Total plazas" value={t.totalSpaces.toString()} />
      <SmallCard
        icon={Car}
        label={`Restitución (fija)`}
        value={`−${t.restitution}`}
        tone="danger"
      />
      <SmallCard
        icon={Layers}
        label={`1 plz × ${t.ratio} m² rent.`}
        value={`1×${t.ratio}`}
        unit="m²"
        tone={t.ratio <= 25 ? 'positive' : t.ratio <= 40 ? undefined : 'warning'}
      />
      <SmallCard icon={Building2} label="Visitas en PB" value={`~${t.visitSpaces}`} unit="plz" />
    </section>
  )
}
