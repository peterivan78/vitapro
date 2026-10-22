import Link from 'next/link'

export function AdminTitle({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-display text-3xl">{title}</h1>
      {actions}
    </div>
  )
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'ok' | 'warn' | 'danger' | 'info'; children: React.ReactNode }) {
  const tones = {
    neutral: 'bg-paper-deep text-ink-soft',
    ok: 'bg-ok/10 text-ok',
    warn: 'bg-amber-100 text-amber-900',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-brand/10 text-[#00679a]',
  }
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>
}

export function FilterTabs({ current, options, basePath, param }: { current: string; options: [string, string, number?][]; basePath: string; param: string }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 text-sm">
      {options.map(([value, label, count]) => (
        <Link
          key={value}
          href={value ? `${basePath}?${param}=${value}` : basePath}
          className={`rounded-full border px-3 py-1.5 ${current === value ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink/40'}`}
        >
          {label}
          {count !== undefined && <span className="ml-1.5 opacity-60">{count}</span>}
        </Link>
      ))}
    </div>
  )
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-ink-mute">{children}</p>
}
