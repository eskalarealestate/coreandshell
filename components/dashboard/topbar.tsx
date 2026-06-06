'use client'

import { Menu, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'parqueos' | 'presupuesto'

export function Topbar({
  tab,
  onTabChange,
  onMenuClick,
}: {
  tab: Tab
  onTabChange: (t: Tab) => void
  onMenuClick: () => void
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'parqueos', label: 'Parqueos' },
    { id: 'presupuesto', label: 'Presupuesto' },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-3 px-4 md:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          aria-label="Abrir parámetros"
        >
          <Menu className="size-[18px]" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
            <Building2 className="size-[18px]" />
          </span>
          <div className="min-w-0 leading-tight">
            <h1 className="truncate text-[15px] font-semibold tracking-tight">
              Torre Corporativa
            </h1>
            <p className="truncate text-[13px] text-muted-foreground">
              Santo Domingo · Análisis de viabilidad
            </p>
          </div>
        </div>

        <nav
          className="ml-auto flex items-center gap-1 rounded-lg border border-border bg-card p-1"
          aria-label="Vistas del proyecto"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              aria-pressed={tab === t.id}
              className={cn(
                'rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors',
                tab === t.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
