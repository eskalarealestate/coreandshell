import { getDayProgram } from './actions'
import { DAY_LABELS } from '@/lib/constants'
import { TrainingApp } from '@/components/training/TrainingApp'

// Every value on this page comes from live Set/log history (Section 2) —
// never prerender/freeze it at build time.
export const dynamic = 'force-dynamic'

export default async function Page() {
  const initialDay = DAY_LABELS[0]

  try {
    const initialProgram = await getDayProgram(initialDay)
    return <TrainingApp initialDay={initialDay} initialProgram={initialProgram} />
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col justify-center gap-3 px-6">
        <div className="text-[20px] font-bold">No se pudo conectar a Supabase</div>
        <div className="rounded-2xl border border-card-border bg-white p-4 text-[13.5px] leading-relaxed text-black/60">
          {message}
        </div>
        <div className="text-[13px] leading-relaxed text-black/50">
          Revisa <code className="rounded bg-chip px-1 py-0.5">.env.local</code> (SUPABASE_URL /
          SUPABASE_ANON_KEY) y confirma que las migraciones en{' '}
          <code className="rounded bg-chip px-1 py-0.5">supabase/migrations</code> ya corrieron en tu proyecto.
        </div>
      </div>
    )
  }
}
