import type { Metadata } from 'next'
import { ConfirmButton } from '@/components/form/ConfirmButton'
import { FormNotice } from '@/components/form/Field'
import { requireViewer } from '@/lib/auth'
import { cratesLabel } from '@/lib/crates'
import { formatDateSk, formatDateTimeSk } from '@/lib/email/templates'
import { createServiceClient } from '@/lib/supabase/server'
import { ORDER_STATUS_LABEL, PROFILE_STATUS_LABEL, type Address, type OrderItemRow, type OrderRow } from '@/lib/types'
import { AddressBook } from './AddressBook'
import { cancelOwnOrderAction } from './actions'
import { isWithinCancelWindow } from '@/lib/orders/cancelWindow'
import { getSettings } from '@/lib/settings'
import { ProfileForm } from './ProfileForm'
import { ReorderButton } from './ReorderButton'

export const metadata: Metadata = { title: 'Môj účet', robots: { index: false } }

export default async function AccountPage({ searchParams }: PageProps<'/ucet'>) {
  const viewer = await requireViewer('/ucet')
  const params = await searchParams
  const profile = viewer.profile
  if (!profile) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20">
        <p>Profil sa nenašiel. Kontaktujte obchodné oddelenie.</p>
      </main>
    )
  }

  const db = createServiceClient()
  const settings = await getSettings()
  const [{ data: addresses }, { data: orders }] = await Promise.all([
    db.from('addresses').select('*').eq('profile_id', profile.id).eq('archived', false).order('is_default', { ascending: false }).order('created_at'),
    db.from('orders').select('*, order_items(*)').eq('profile_id', profile.id).order('created_at', { ascending: false }).limit(50),
  ])

  const statusTone =
    profile.status === 'approved' ? 'bg-ok/10 text-ok' : profile.status === 'blocked' ? 'bg-danger/10 text-danger' : 'bg-amber-100 text-amber-900'

  return (
    <main className="paper-grain">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <p className="eyebrow text-ink-mute">Môj účet</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <h1 className="font-display text-4xl">{profile.company_name || 'Môj účet'}</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone}`}>{PROFILE_STATUS_LABEL[profile.status]}</span>
        </div>
        <p className="mt-2 text-sm text-ink-mute">{viewer.email}</p>

        <div className="mt-6 space-y-3">
          {params.heslo === 'zmenene' && <FormNotice>Heslo bolo zmenené.</FormNotice>}
          {profile.status === 'pending' && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Účet čaká na schválenie obchodným oddelením. Medzitým si môžete doplniť dodacie adresy.
            </p>
          )}
        </div>

        <section className="mt-14" aria-labelledby="h-orders">
          <h2 id="h-orders" className="font-display text-2xl">Objednávky</h2>
          {(orders ?? []).length === 0 ? (
            <p className="mt-4 text-sm text-ink-mute">Zatiaľ žiadne objednávky.</p>
          ) : (
            <ul className="mt-6 divide-y divide-line rounded-xl border border-line bg-white">
              {(orders as (OrderRow & { order_items: OrderItemRow[] })[]).map((o) => (
                <li key={o.id} className="p-5">
                  <details>
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                      <span className="font-medium">{o.order_number}</span>
                      <span className="text-sm text-ink-soft">{formatDateTimeSk(o.created_at)}</span>
                      <span className="text-sm">
                        {o.total_units} ks · {cratesLabel(o.crates)}
                      </span>
                      <span className="rounded-full bg-paper-deep px-2.5 py-0.5 text-xs">{ORDER_STATUS_LABEL[o.status]}</span>
                    </summary>
                    <div className="mt-4 grid gap-6 text-sm sm:grid-cols-2">
                      <ul className="space-y-1">
                        {o.order_items
                          .sort((a, b) => a.line_no - b.line_no)
                          .map((i) => (
                            <li key={i.id} className="flex justify-between gap-4">
                              <span>{i.name}</span>
                              <span className="tabular-nums">{i.quantity} ks</span>
                            </li>
                          ))}
                      </ul>
                      <div className="space-y-1 text-ink-soft">
                        <p>
                          {o.delivery_address.street}, {o.delivery_address.zip} {o.delivery_address.city}
                        </p>
                        <p>Požadovaný termín: {formatDateSk(o.requested_delivery_date)}</p>
                        {o.note && <p>Poznámka: {o.note}</p>}
                        <div className="flex flex-wrap gap-5 pt-2">
                          <ReorderButton items={o.order_items} />
                          {o.status === 'new' && isWithinCancelWindow(o.created_at, settings.cancel_window_minutes) && (
                            <form action={cancelOwnOrderAction}>
                              <input type="hidden" name="id" value={o.id} />
                              <ConfirmButton message={`Naozaj zrušiť objednávku ${o.order_number}?`} className="text-sm text-danger underline underline-offset-4">
                                Zrušiť objednávku
                              </ConfirmButton>
                            </form>
                          )}
                        </div>
                      </div>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-14" aria-labelledby="h-addresses">
          <h2 id="h-addresses" className="font-display text-2xl">Dodacie adresy</h2>
          <div className="mt-6">
            <AddressBook addresses={(addresses ?? []) as Address[]} />
          </div>
        </section>

        <section className="mt-14 max-w-2xl" aria-labelledby="h-profile">
          <h2 id="h-profile" className="font-display text-2xl">Fakturačné údaje</h2>
          <div className="mt-6">
            <ProfileForm profile={profile} />
          </div>
        </section>
      </div>
    </main>
  )
}
