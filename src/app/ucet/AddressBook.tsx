'use client'

import { useState } from 'react'
import type { Address } from '@/lib/types'
import { AddressForm } from './AddressForm'
import { archiveAddressAction, setDefaultAddressAction } from './actions'

export function AddressBook({ addresses }: { addresses: Address[] }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(addresses.length === 0)

  return (
    <div className="space-y-4">
      {addresses.map((a) =>
        editing === a.id ? (
          <div key={a.id} className="rounded-xl border border-ink/30 bg-white p-6">
            <AddressForm address={a} onDone={() => setEditing(null)} />
          </div>
        ) : (
          <div key={a.id} className="flex flex-col gap-4 rounded-xl border border-line bg-white p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="text-sm leading-relaxed">
              <p className="font-medium">
                {a.label || a.company || a.street}
                {a.is_default && <span className="ml-2 rounded-full bg-paper-deep px-2 py-0.5 text-xs font-normal text-ink-soft">predvolená</span>}
              </p>
              <p className="text-ink-soft">
                {[a.company, a.street, `${a.zip} ${a.city}`, a.country].filter(Boolean).join(', ')}
              </p>
              {(a.contact_name || a.contact_phone) && (
                <p className="text-ink-mute">{[a.contact_name, a.contact_phone].filter(Boolean).join(', ')}</p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-3 text-sm">
              <button type="button" onClick={() => setEditing(a.id)} className="underline underline-offset-4">
                Upraviť
              </button>
              {!a.is_default && (
                <form action={setDefaultAddressAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="text-ink-soft underline underline-offset-4">Nastaviť ako predvolenú</button>
                </form>
              )}
              <form
                action={archiveAddressAction}
                onSubmit={(e) => {
                  if (!confirm('Odstrániť túto adresu?')) e.preventDefault()
                }}
              >
                <input type="hidden" name="id" value={a.id} />
                <button className="text-danger underline underline-offset-4">Odstrániť</button>
              </form>
            </div>
          </div>
        ),
      )}

      {adding ? (
        <div className="rounded-xl border border-ink/30 bg-white p-6">
          <p className="mb-5 font-medium">Nová dodacia adresa</p>
          <AddressForm onDone={addresses.length ? () => setAdding(false) : undefined} />
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="btn btn-ghost">
          + Pridať dodaciu adresu
        </button>
      )}
    </div>
  )
}
