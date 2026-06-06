'use client'

import { Minus, Plus, X } from 'lucide-react'
import type { LevelCounts } from '@/lib/building-data'
import { REAL } from '@/lib/building-data'
import { cn } from '@/lib/utils'

type LevelKey = keyof LevelCounts

const levelFields: { key: LevelKey; label: string; sub: (l: LevelCounts) => string; min: number; max: number }[] = [
  {
    key: 'officeLevels',
    label: 'Pisos de oficinas',
    sub: (l) => `${(l.officeLevels * REAL.M2_OFICINA_NETO + REAL.M2_CROWN_NETO).toLocaleString('es-DO')} m² rentables`,
    min: 0, max: 14,
  },
  {
    key: 'structuredParkingLevels',
    label: 'Parqueo rasante',
    sub: (l) => `${l.structuredParkingLevels * REAL.PLAZAS_RASANTE} plazas · ${(l.structuredParkingLevels * REAL.M2_RASANTE).toLocaleString('es-DO')} m²`,
    min: 0, max: 10,
  },
  {
    key: 'undergroundParkingLevels',
    label: 'Parqueo soterrado',
    sub: (l) => `${l.undergroundParkingLevels * REAL.PLAZAS_SOTANO} plazas · ${(l.undergroundParkingLevels * REAL.M2_SOTANO).toLocaleString('es-DO')} m²`,
    min: 0, max: 8,
  },
]

function Stepper({ label, sub, value, min, max, onChange }: {
  label: string; sub: string; value: number; min: number; max: number; onChange: (n: number) => void
}) {
  const set = (n: number) => onChange(Math.max(min, Math.min(max, n)))
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-[13px] font-medium text-foreground">{label}</label>
        <div className="flex items-center gap-1.5">
          <button
            type="button" onClick={() => set(value - 1)} disabled={value <= min}
            aria-label={`Reducir ${label}`}
            className="grid size-8 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-8 text-center font-mono text-[16px] font-bold tabular-nums text-primary">{value}</span>
          <button
            type="button" onClick={() => set(value + 1)} disabled={value >= max}
            aria-label={`Aumentar ${label}`}
            className="grid size-8 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>
      <p className="font-mono text-[11px] text-muted-foreground/70">{sub}</p>
    </div>
  )
}

function SidebarBody({ levels, onLevelsChange }: {
  levels: LevelCounts; onLevelsChange: (l: LevelCounts) => void
}) {
  const totalSpaces =
    levels.structuredParkingLevels * REAL.PLAZAS_RASANTE +
    levels.undergroundParkingLevels * REAL.PLAZAS_SOTANO
  const commercial = Math.max(0, totalSpaces - REAL.RESTITUTION)
  const rentable   = levels.officeLevels * REAL.M2_OFICINA_NETO + REAL.M2_CROWN_NETO

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          Configuración de niveles
        </h2>
        <p className="mt-1 text-[12px] text-muted-foreground/70">
          Ajusta la cantidad de pisos por tipo de uso.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {levelFields.map((lf) => (
          <Stepper
            key={lf.key}
            label={lf.label}
            sub={lf.sub(levels)}
            value={levels[lf.key]}
            min={lf.min}
            max={lf.max}
            onChange={(n) => onLevelsChange({ ...levels, [lf.key]: n })}
          />
        ))}
      </div>

      <div className="h-px bg-border" />

      {/* Live summary */}
      <div className="rounded-lg border border-border bg-card-elevated p-3 flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Resumen</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <div>
            <p className="text-[10px] text-muted-foreground/60">Área rentable</p>
            <p className="font-mono text-[14px] font-bold text-foreground">{rentable.toLocaleString('es-DO')} m²</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground/60">Total plazas</p>
            <p className="font-mono text-[14px] font-bold text-foreground">{totalSpaces}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground/60">Restitución</p>
            <p className="font-mono text-[14px] font-bold text-destructive">−{REAL.RESTITUTION}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground/60">Comercializables</p>
            <p className="font-mono text-[14px] font-bold text-positive">{commercial}</p>
          </div>
        </div>
        <div className="mt-1 rounded-md bg-border/30 px-2.5 py-1.5">
          <p className="font-mono text-[11px] text-muted-foreground">
            {totalSpaces} − {REAL.RESTITUTION} rest. = <span className="text-positive font-semibold">{commercial} comerc.</span>
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card-elevated p-3">
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Cada cambio actualiza el perfil, KPIs y ratios en tiempo real.
        </p>
      </div>
    </div>
  )
}

export function Sidebar({ levels, onLevelsChange, open, onClose }: {
  levels: LevelCounts; onLevelsChange: (l: LevelCounts) => void; open: boolean; onClose: () => void
}) {
  return (
    <>
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[260px] shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar px-5 py-6 lg:block">
        <SidebarBody levels={levels} onLevelsChange={onLevelsChange} />
      </aside>

      <div className={cn('fixed inset-0 z-40 lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!open}>
        <div className={cn('absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity', open ? 'opacity-100' : 'opacity-0')} onClick={onClose} />
        <aside className={cn('absolute left-0 top-0 h-full w-[280px] max-w-[85vw] overflow-y-auto border-r border-sidebar-border bg-sidebar px-5 py-5 shadow-2xl transition-transform duration-300', open ? 'translate-x-0' : '-translate-x-full')} role="dialog" aria-label="Parámetros">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Parámetros</span>
            <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground" aria-label="Cerrar">
              <X className="size-4" />
            </button>
          </div>
          <SidebarBody levels={levels} onLevelsChange={onLevelsChange} />
        </aside>
      </div>
    </>
  )
}
