'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/components/cart/CartProvider'
import { CrateFill } from '@/components/cart/CrateFill'
import { cratesLabel, currentCrateSlots, summarizeCrates, unitsLabel } from '@/lib/crates'

export type BarProduct = { id: string; color: string }

export function OrderBar({ crateSize, products }: { crateSize: number; products: BarProduct[] }) {
  const { enabled, units, hydrated, clear, cart } = useCart()
  const pathname = usePathname()
  if (!enabled || !hydrated || units === 0 || pathname.startsWith('/objednavka')) return null
  const s = summarizeCrates(units, crateSize)
  const { slots, completedCrates } = currentCrateSlots(
    products.map((p) => ({ key: p.id, color: p.color, quantity: cart[p.id] ?? 0 })),
    crateSize,
  )

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4">
      <div
        role="status"
        aria-live="polite"
        className="mx-auto grid max-w-3xl grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-2xl shadow-black/15 backdrop-blur sm:flex sm:gap-x-5 sm:px-5"
      >
        <div className="relative">
          <CrateFill slots={slots} size="sm" className="w-24 sm:w-28" label={`Prepravka: ${slots.length} z ${crateSize} fliaš`} />
          {completedCrates > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-ink px-1.5 py-0.5 text-[0.65rem] font-medium text-white">
              +{completedCrates}
            </span>
          )}
        </div>
        <div className="min-w-0 text-sm sm:flex-1">
          <p className="font-medium">
            {unitsLabel(units)}
            {s.fullCrates > 0 && <span className="text-ink-mute"> · {cratesLabel(s.fullCrates)}</span>}
          </p>
          <p className={s.isValid ? 'text-ink-mute' : 'text-warn'}>
            {s.isValid ? (
              'Celé prepravky – môžete objednať.'
            ) : (
              <>
                Doplňte ešte {unitsLabel(s.missing)} do plnej prepravky
                <span className="hidden sm:inline"> ({crateSize} ks, môže byť mix)</span>.
              </>
            )}
          </p>
        </div>
        <div className="col-span-2 flex items-center justify-between gap-2 sm:col-span-1 sm:justify-end">
          <button type="button" onClick={clear} className="px-2 text-xs text-ink-mute hover:text-ink">
            Vyprázdniť
          </button>
          {s.isValid ? (
            <Link href="/objednavka" className="btn btn-primary">
              Pokračovať
            </Link>
          ) : (
            <button type="button" disabled className="btn btn-primary">
              Pokračovať
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
