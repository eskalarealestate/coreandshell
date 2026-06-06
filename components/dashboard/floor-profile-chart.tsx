'use client'

import { useMemo } from 'react'
import type { Floor } from '@/lib/building-data'
import { isParking } from '@/lib/building-data'

const USE_COLORS: Record<Floor['use'], { bar: string; inner: string; text: string }> = {
  'Oficinas':              { bar: '#1E3A6E', inner: '#3B72D9', text: '#ffffff' },
  'Crown / Eventos':       { bar: '#2B1D6E', inner: '#6B5FD9', text: '#ffffff' },
  'Parqueo estructurado':  { bar: '#1A3A1A', inner: '#3A7A3A', text: '#ffffff' },
  'Parqueo subterráneo':   { bar: '#142A14', inner: '#2D5C2D', text: '#bfffbf' },
  'Lobby + Visitas':       { bar: '#2A2A3A', inner: '#50566A', text: '#e0e4f0' },
}

const USE_LABEL: Record<Floor['use'], string> = {
  'Oficinas':             'Oficinas',
  'Crown / Eventos':      'Crown N13',
  'Parqueo estructurado': 'Parqueo rasante',
  'Parqueo subterráneo':  'Parqueo soterrado',
  'Lobby + Visitas':      'Lobby + Visitas',
}

function barLabel(f: Floor): string {
  if (isParking(f.use)) return `${f.spaces ?? 0} plz`
  if (f.use === 'Lobby + Visitas') return `~${f.spaces} visita · ${f.grossArea.toLocaleString('es-DO')} m²`
  if (f.netArea > 0) return `${f.netArea.toLocaleString('es-DO')} m² neto`
  return `${f.grossArea.toLocaleString('es-DO')} m²`
}

export function FloorProfileChart({ floors }: { floors: Floor[] }) {
  const maxGross = useMemo(
    () => Math.max(...floors.map((f) => f.grossArea)),
    [floors],
  )

  const uses = Array.from(new Set(floors.map((f) => f.use)))
  const groundIdx = floors.findIndex((f) => f.isGroundLevel)

  return (
    <section className="rounded-xl border border-border bg-card p-4 md:p-5">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight">Perfil del edificio</h2>
          <p className="text-[13px] text-muted-foreground">
            Barra exterior = área bruta · interior = área neta rentable · parqueos = plazas
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px]">
          {uses.map((u) => (
            <span key={u} className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-[3px]"
                style={{ background: USE_COLORS[u].inner }}
              />
              <span className="text-muted-foreground">{USE_LABEL[u]}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="mt-5 flex flex-col gap-[3px]">
        {floors.map((f, idx) => {
          const grossPct  = (f.grossArea / maxGross) * 100
          const parking   = isParking(f.use)
          const isLobby   = f.use === 'Lobby + Visitas'
          // Inner bar: for offices = net/gross ratio; for parking = full; lobby = partial
          const innerPct  = parking
            ? 100
            : isLobby
              ? 60
              : f.grossArea > 0
                ? (f.netArea / f.grossArea) * 100
                : 0

          const c = USE_COLORS[f.use]
          const isGround  = f.isGroundLevel
          const isBelow   = f.isBelowGrade

          return (
            <div key={f.id}>
              {/* Grade line separator */}
              {isGround && (
                <div className="my-1 flex items-center gap-2">
                  <div className="h-px flex-1 border-t border-dashed border-border-strong/60" />
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground/60">
                    N.P.T. ±0.00
                  </span>
                  <div className="h-px flex-1 border-t border-dashed border-border-strong/60" />
                </div>
              )}

              <div className="flex items-center gap-3">
                {/* Level label */}
                <span
                  className="w-12 shrink-0 text-right font-mono text-[12px] tabular-nums"
                  style={{ color: isBelow ? '#6A8A6A' : '#8a96a8' }}
                >
                  {f.label}
                </span>

                {/* Bar */}
                <div
                  className="relative h-7 flex-1 overflow-hidden rounded-[5px] transition-[width] duration-500"
                  style={{
                    width: `${grossPct}%`,
                    background: c.bar,
                    opacity: isBelow ? 0.8 : 1,
                  }}
                >
                  {/* Inner (net/parking) bar */}
                  <div
                    className="absolute inset-y-0 left-0 flex items-center overflow-hidden rounded-[5px] px-2 transition-[width] duration-500"
                    style={{ width: `${innerPct}%`, background: c.inner }}
                  >
                    <span
                      className="whitespace-nowrap font-mono text-[12px] font-semibold tabular-nums"
                      style={{ color: c.text }}
                    >
                      {barLabel(f)}
                    </span>
                  </div>

                  {/* Gross area label on right of outer bar (non-parking) */}
                  {!parking && !isLobby && (
                    <span className="absolute inset-y-0 right-2 flex items-center font-mono text-[11px] tabular-nums text-foreground/50">
                      {f.grossArea.toLocaleString('es-DO')} bruto
                    </span>
                  )}
                </div>

                {/* Right side label */}
                <span className="hidden w-28 shrink-0 font-mono text-[12px] tabular-nums text-muted-foreground sm:block">
                  {parking
                    ? `${f.spaces} plz / nivel`
                    : isLobby
                      ? `${f.grossArea.toLocaleString('es-DO')} m²`
                      : f.netArea > 0
                        ? `${f.netArea.toLocaleString('es-DO')} m² neto`
                        : '—'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* X-axis gridlines hint */}
      <div className="mt-3 flex justify-between font-mono text-[10px] text-muted-foreground/40">
        <span>0 m²</span>
        <span>1,000</span>
        <span>1,500</span>
        <span>2,000</span>
        <span>{maxGross.toLocaleString('es-DO')} m²</span>
      </div>
    </section>
  )
}
