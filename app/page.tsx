'use client'

import { useMemo, useState } from 'react'
import { Topbar } from '@/components/dashboard/topbar'
import { Sidebar } from '@/components/dashboard/sidebar'
import { FloorProfileChart } from '@/components/dashboard/floor-profile-chart'
import { KpiRow } from '@/components/dashboard/kpi-row'
import { RatioRow } from '@/components/dashboard/ratio-row'
import { generateFloors, DEFAULT_LEVELS, type LevelCounts } from '@/lib/building-data'

export default function Page() {
  const [tab, setTab]               = useState<'parqueos' | 'presupuesto'>('parqueos')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [levels, setLevels]         = useState<LevelCounts>(DEFAULT_LEVELS)

  const floors = useMemo(() => generateFloors(levels), [levels])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Topbar tab={tab} onTabChange={setTab} onMenuClick={() => setSidebarOpen(true)} />

      <div className="mx-auto flex w-full max-w-[1600px]">
        <Sidebar
          levels={levels}
          onLevelsChange={setLevels}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 px-4 py-6 md:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            <FloorProfileChart floors={floors} />
            <KpiRow floors={floors} counts={levels} />
            <RatioRow floors={floors} counts={levels} />
          </div>
        </main>
      </div>
    </div>
  )
}
