import { summarizeCrates } from '@/lib/crates'

// Vizuál prepravky: 12 políčok, vyplnené podľa kusov v poslednej prepravke.
export function CrateMeter({ units, crateSize, tone = 'dark' }: { units: number; crateSize: number; tone?: 'dark' | 'light' }) {
  const s = summarizeCrates(units, crateSize)
  const filled = s.remainder === 0 && units > 0 ? crateSize : s.remainder
  const on = tone === 'dark' ? 'bg-white' : 'bg-ink'
  const off = tone === 'dark' ? 'bg-white/20' : 'bg-ink/12'
  return (
    <div aria-hidden className="grid grid-cols-6 gap-[3px]">
      {Array.from({ length: crateSize }, (_, i) => (
        <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < filled ? on : off}`} />
      ))}
    </div>
  )
}
