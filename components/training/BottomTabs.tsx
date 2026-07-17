'use client'

export function BottomTabs({
  active,
  onTrain,
  onBody,
}: {
  active: 'train' | 'body'
  onTrain: () => void
  onBody: () => void
}) {
  return (
    <div className="flex flex-shrink-0 border-t border-hairline bg-app-bg">
      <button
        onClick={onTrain}
        className={`flex-1 py-3.5 text-[13px] font-bold ${active === 'train' ? 'text-ink' : 'text-ink/35'}`}
      >
        Hoy
      </button>
      <button
        onClick={onBody}
        className={`flex-1 py-3.5 text-[13px] font-bold ${active === 'body' ? 'text-ink' : 'text-ink/35'}`}
      >
        Cuerpo
      </button>
    </div>
  )
}
