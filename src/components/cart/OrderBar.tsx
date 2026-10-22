'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/components/cart/CartProvider'
import { CrateMeter } from '@/components/cart/CrateMeter'
import { cratesLabel, summarizeCrates, unitsLabel } from '@/lib/crates'

export function OrderBar({ crateSize }: { crateSize: number }) {
  const { enabled, units, hydrated, clear } = useCart()
  const pathname = usePathname()
  if (!enabled || !hydrated || units === 0 || pathname.startsWith('/objednavka')) return null
  const s = summarizeCrates(units, crateSize)

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4">
      <div
        role="status"
        aria-live="polite"
        className="mx-auto grid max-w-3xl grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 rounded-2xl bg-night px-5 py-4 text-white shadow-2xl shadow-black/30 sm:flex sm:gap-x-5"
      >
        <CrateMeter units={units} crateSize={crateSize} />
        <div className="min-w-0 text-sm sm:flex-1">
          <p className="font-medium">
            {unitsLabel(units)}
            {s.fullCrates > 0 && <span className="text-white/60"> · {cratesLabel(s.fullCrates)}</span>}
          </p>
          <p className={s.isValid ? 'text-white/60' : 'text-amber-300'}>
            {s.isValid
              ? 'Celé prepravky – môžete objednať.'
              : (
                <>
                  Doplňte ešte {unitsLabel(s.missing)} do plnej prepravky
                  <span className="hidden sm:inline"> ({crateSize} ks, môže byť mix)</span>.
                </>
              )}
          </p>
        </div>
        <div className="col-span-2 flex items-center justify-between gap-2 sm:col-span-1 sm:justify-end">
          <button type="button" onClick={clear} className="px-2 text-xs text-white/50 hover:text-white">
            Vyprázdniť
          </button>
          {s.isValid ? (
            <Link href="/objednavka" className="btn btn-light">
              Pokračovať
            </Link>
          ) : (
            <button type="button" disabled className="btn btn-light">
              Pokračovať
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
