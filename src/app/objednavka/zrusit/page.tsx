import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { SubmitButton } from '@/components/form/SubmitButton'
import { cratesLabel } from '@/lib/crates'
import { formatDateTimeSk } from '@/lib/email/templates'
import { hashCancelToken, isWellFormedCancelToken } from '@/lib/orders/cancelToken'
import { getSettings } from '@/lib/settings'
import { createServiceClient } from '@/lib/supabase/server'
import type { OrderRow } from '@/lib/types'
import { cancelByTokenAction } from './actions'

export const metadata: Metadata = { title: 'Zrušenie objednávky', robots: { index: false } }

// Otvorenie odkazu (GET) objednávku NEZRUŠÍ – firemné emailové filtre odkazy
// automaticky otvárajú. Zrušenie spraví až tlačidlo (POST).
export default async function CancelOrderPage({ searchParams }: PageProps<'/objednavka/zrusit'>) {
  const { t, stav, c } = await searchParams
  const settings = await getSettings()
  const contact = (
    <p className="mt-6 text-sm text-ink-soft">
      Obchodné oddelenie:{' '}
      <a href={`mailto:${settings.sales_email}`} className="underline underline-offset-4">
        {settings.sales_email}
      </a>
      {settings.sales_phone && `, ${settings.sales_phone}`}
    </p>
  )

  if (stav === 'zrusena') {
    return (
      <PageShell eyebrow="Objednávka" title="Objednávka je zrušená">
        <p className="leading-relaxed text-ink-soft">
          Objednávka {typeof c === 'string' ? <strong className="text-ink">{c}</strong> : ''} nebude spracovaná. Poslali sme
          vám potvrdenie emailom a informovali obchodné oddelenie.
        </p>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Ak ste objednávku nezadali vy, <Link href="/zabudnute-heslo" className="underline underline-offset-4">zmeňte si heslo</Link>.
        </p>
        {contact}
      </PageShell>
    )
  }
  if (stav === 'spracuva-sa') {
    return (
      <PageShell eyebrow="Objednávka" title="Objednávka sa už spracúva">
        <p className="leading-relaxed text-ink-soft">Obchodné oddelenie ju už začalo vybavovať, preto ju nejde zrušiť online. Ozvite sa nám prosím.</p>
        {contact}
      </PageShell>
    )
  }

  const order = isWellFormedCancelToken(t)
    ? (
        await createServiceClient()
          .from('orders')
          .select('*')
          .eq('cancel_token_hash', hashCancelToken(t))
          .maybeSingle<OrderRow>()
      ).data
    : null

  if (!order || stav === 'neplatny') {
    return (
      <PageShell eyebrow="Objednávka" title="Odkaz už neplatí">
        <p className="leading-relaxed text-ink-soft">
          Objednávka už bola zrušená alebo odkaz nie je platný. Ak potrebujete objednávku zrušiť, kontaktujte nás.
        </p>
        {contact}
      </PageShell>
    )
  }

  if (order.status !== 'new') {
    return (
      <PageShell eyebrow="Objednávka" title="Objednávka sa už spracúva">
        <p className="leading-relaxed text-ink-soft">
          Objednávku {order.order_number} už obchodné oddelenie vybavuje, preto ju nejde zrušiť online. Ozvite sa nám prosím.
        </p>
        {contact}
      </PageShell>
    )
  }

  return (
    <PageShell eyebrow="Objednávka" title={`Zrušiť objednávku ${order.order_number}?`}>
      <dl className="grid grid-cols-[8rem_1fr] gap-y-2 rounded-xl border border-line bg-white p-6 text-sm">
        <dt className="text-ink-mute">Odberateľ</dt>
        <dd>{order.customer.company_name}</dd>
        <dt className="text-ink-mute">Vytvorená</dt>
        <dd>{formatDateTimeSk(order.created_at)}</dd>
        <dt className="text-ink-mute">Množstvo</dt>
        <dd>
          {order.total_units} ks · {cratesLabel(order.crates)}
        </dd>
      </dl>
      <form action={cancelByTokenAction} className="mt-8 flex flex-wrap items-center gap-4">
        <input type="hidden" name="t" value={t as string} />
        <SubmitButton className="btn bg-danger text-white hover:bg-danger/90" pendingText="Ruším…">
          Áno, zrušiť objednávku
        </SubmitButton>
        <Link href="/" className="text-sm text-ink-mute underline underline-offset-4">
          Nie, ponechať
        </Link>
      </form>
    </PageShell>
  )
}
