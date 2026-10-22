import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { canOrder, requireViewer } from '@/lib/auth'
import { getVisibleProducts } from '@/lib/catalog/getProducts'
import { tomorrowInBratislava } from '@/lib/dates'
import { getSettings } from '@/lib/settings'
import { createServiceClient } from '@/lib/supabase/server'
import type { Address } from '@/lib/types'
import { CheckoutForm } from './CheckoutForm'

export const metadata: Metadata = { title: 'Objednávka', robots: { index: false } }

export default async function CheckoutPage() {
  const viewer = await requireViewer('/objednavka')
  if (!canOrder(viewer)) {
    return (
      <PageShell eyebrow="Objednávka" title="Účet ešte nie je schválený">
        <p className="text-ink-soft">Objednávať môžete po schválení účtu obchodným oddelením. Pošleme vám email.</p>
        <Link href="/ucet" className="btn btn-ghost mt-8">
          Môj účet
        </Link>
      </PageShell>
    )
  }

  const [products, settings, { data: addresses }] = await Promise.all([
    getVisibleProducts(),
    getSettings(),
    createServiceClient()
      .from('addresses')
      .select('*')
      .eq('profile_id', viewer.userId)
      .eq('archived', false)
      .order('is_default', { ascending: false })
      .order('created_at'),
  ])

  return (
    <PageShell eyebrow="Objednávka" title="Dokončenie objednávky" width="wide">
      <CheckoutForm products={products} addresses={(addresses ?? []) as Address[]} crateSize={settings.crate_size} minDate={tomorrowInBratislava()} />
    </PageShell>
  )
}
