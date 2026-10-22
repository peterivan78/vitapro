'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useActionState, useMemo, useState } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import { CrateFill } from '@/components/cart/CrateFill'
import { FormError } from '@/components/form/Field'
import { SubmitButton } from '@/components/form/SubmitButton'
import { cratesLabel, currentCrateSlots, summarizeCrates, unitsLabel } from '@/lib/crates'
import type { Address, Product } from '@/lib/types'
import { submitOrderAction, type OrderFormState } from './actions'

export function CheckoutForm({
  products,
  addresses,
  crateSize,
  minDate,
}: {
  products: Product[]
  addresses: Address[]
  crateSize: number
  minDate: string
}) {
  const { cart, setQuantity, hydrated } = useCart()
  const [state, action] = useActionState<OrderFormState, FormData>(submitOrderAction, {})
  const [addressId, setAddressId] = useState(addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id ?? '')

  const lines = useMemo(
    () =>
      products
        .filter((p) => (cart[p.id] ?? 0) > 0)
        .map((p) => ({ product: p, quantity: cart[p.id] })),
    [products, cart],
  )
  const units = lines.reduce((s, l) => s + l.quantity, 0)
  const summary = summarizeCrates(units, crateSize)
  const crate = currentCrateSlots(
    lines.map((l) => ({ key: l.product.id, color: l.product.accent_color, quantity: l.quantity })),
    crateSize,
  )
  const blocked = lines.some((l) => l.product.status !== 'active')
  const unknownInCart = hydrated && Object.keys(cart).some((id) => !products.some((p) => p.id === id))

  if (!hydrated) return <p className="text-ink-mute">Načítavam objednávku…</p>

  if (lines.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-white p-8 text-center">
        <p>Objednávka je prázdna.</p>
        <Link href="/#stavy" className="btn btn-primary mt-6">
          Vybrať šťavy
        </Link>
      </div>
    )
  }

  const items = JSON.stringify(lines.map((l) => ({ product_id: l.product.id, quantity: l.quantity })))

  return (
    <form action={action} className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-10">
        <section aria-labelledby="h-items">
          <div className="flex items-baseline justify-between">
            <h2 id="h-items" className="font-display text-2xl">Položky</h2>
            <Link href="/#stavy" className="text-sm underline underline-offset-4">
              Upraviť výber
            </Link>
          </div>
          <ul className="mt-5 divide-y divide-line rounded-xl border border-line bg-white">
            {lines.map(({ product: p, quantity }) => (
              <li key={p.id} className="flex items-center gap-4 p-4">
                <div className="relative h-14 w-20 shrink-0">
                  {(p.photo_url || p.illustration_url) && (
                    <Image src={(p.photo_url || p.illustration_url)!} alt="" fill sizes="80px" className="object-contain" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg italic">{p.name}</p>
                  <p className="text-xs text-ink-mute">
                    {p.sku} · {p.volume}
                  </p>
                  {p.status !== 'active' && <p className="mt-1 text-xs font-medium text-danger">Momentálne nedostupné – odstráňte</p>}
                </div>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  aria-label={`Počet kusov – ${p.name}`}
                  value={quantity}
                  onChange={(e) => setQuantity(p.id, Number(e.target.value))}
                  className="field !w-20 text-center tabular-nums"
                />
                <button type="button" onClick={() => setQuantity(p.id, 0)} aria-label={`Odstrániť ${p.name}`} className="px-1 text-xl text-ink-mute hover:text-danger">
                  ×
                </button>
              </li>
            ))}
          </ul>
          {unknownInCart && (
            <p className="mt-3 text-sm text-ink-mute">Niektoré položky z košíka už nie sú v ponuke a boli vynechané.</p>
          )}
        </section>

        <section aria-labelledby="h-address">
          <div className="flex items-baseline justify-between">
            <h2 id="h-address" className="font-display text-2xl">Dodacia adresa</h2>
            <Link href="/ucet#h-addresses" className="text-sm underline underline-offset-4">
              Spravovať adresy
            </Link>
          </div>
          {addresses.length === 0 ? (
            <p className="mt-5 rounded-xl border border-line bg-white p-5 text-sm">
              Nemáte uloženú dodaciu adresu.{' '}
              <Link href="/ucet#h-addresses" className="underline underline-offset-4">
                Pridajte ju v účte.
              </Link>
            </p>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={`cursor-pointer rounded-xl border bg-white p-4 text-sm transition ${
                    addressId === a.id ? 'border-ink ring-1 ring-ink' : 'border-line hover:border-ink/40'
                  }`}
                >
                  <input type="radio" name="address_id" value={a.id} checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="sr-only" />
                  <span className="block font-medium">{a.label || a.company || a.street}</span>
                  <span className="mt-1 block leading-relaxed text-ink-soft">
                    {[a.company, a.street, `${a.zip} ${a.city}`].filter(Boolean).join(', ')}
                  </span>
                </label>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="h-details" className="grid gap-5 sm:grid-cols-2">
          <h2 id="h-details" className="sr-only">Doplňujúce údaje</h2>
          <div>
            <label htmlFor="requested_date" className="mb-1.5 block text-sm font-medium">
              Požadovaný termín dodania
            </label>
            <input id="requested_date" name="requested_date" type="date" min={minDate} className="field" />
            <p className="mt-1.5 text-xs text-ink-mute">Nepovinné. Termín potvrdí obchodné oddelenie.</p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="note" className="mb-1.5 block text-sm font-medium">
              Poznámka
            </label>
            <textarea id="note" name="note" rows={3} maxLength={1000} className="field" placeholder="napr. číslo vašej objednávky, požiadavky na doručenie" />
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-line bg-white p-7">
          <p className="eyebrow text-ink-mute">Súhrn</p>
          <CrateFill
            slots={crate.slots}
            className="mx-auto mt-4 w-full max-w-xs"
            label={`Prepravka: ${crate.slots.length} z ${crateSize} fliaš`}
          />
          <div className="mt-4 text-center">
            <p className="text-2xl font-medium">{unitsLabel(units)}</p>
            <p className="text-sm text-ink-mute">
              {cratesLabel(summary.fullCrates)} po {crateSize} ks
              {crate.completedCrates > 0 && summary.remainder > 0 && ' + rozpracovaná'}
            </p>
          </div>
          {!summary.isValid && (
            <p className="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Doplňte ešte {unitsLabel(summary.missing)}, aby boli prepravky plné.
            </p>
          )}
          <input type="hidden" name="items" value={items} />
          <div className="mt-6 space-y-4">
            <FormError message={state.error} />
            <SubmitButton
              className="btn btn-primary w-full"
              pendingText="Odosielam objednávku…"
              disabled={!summary.isValid || blocked || !addressId}
            >
              Odoslať objednávku
            </SubmitButton>
            <p className="text-xs leading-relaxed text-ink-mute">
              Odoslaním potvrdzujete objednávku podľa{' '}
              <Link href="/obchodne-podmienky" className="underline">
                obchodných podmienok
              </Link>
              . Ceny a fakturácia podľa vašej zmluvy s AQUA PRO EUROPE, a.s.
            </p>
          </div>
        </div>
      </aside>
    </form>
  )
}
