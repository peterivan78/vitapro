export function PageShell({
  eyebrow,
  title,
  intro,
  children,
  width = 'narrow',
}: {
  eyebrow?: string
  title: string
  intro?: React.ReactNode
  children: React.ReactNode
  width?: 'narrow' | 'wide'
}) {
  return (
    <main className="paper-grain min-h-[70vh]">
      <div className={`mx-auto px-4 py-16 sm:px-6 sm:py-20 ${width === 'narrow' ? 'max-w-xl' : 'max-w-5xl'}`}>
        {eyebrow && <p className="eyebrow text-ink-mute">{eyebrow}</p>}
        <h1 className="mt-3 font-display text-4xl leading-tight">{title}</h1>
        {intro && <div className="mt-4 leading-relaxed text-ink-soft">{intro}</div>}
        <div className="mt-10">{children}</div>
      </div>
    </main>
  )
}
