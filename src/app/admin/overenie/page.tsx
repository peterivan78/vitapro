import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageShell } from '@/components/PageShell'
import { checkAdmin } from '@/lib/auth'
import { createSessionClient } from '@/lib/supabase/server'
import { MfaForm } from './MfaForm'

export const metadata: Metadata = { title: 'Overenie administrátora', robots: { index: false } }

export default async function AdminMfaPage() {
  const check = await checkAdmin()
  if (check.ok) redirect('/admin')
  if (check.reason === 'anonymous') redirect('/prihlasenie?next=/admin')
  if (check.reason === 'forbidden') redirect('/')

  const supabase = await createSessionClient()
  const { data } = await supabase.auth.mfa.listFactors()
  const verified = data?.totp.find((f) => f.status === 'verified')

  return (
    <PageShell eyebrow="Administrácia" title={verified ? 'Zadajte overovací kód' : 'Nastavenie dvojstupňového overenia'}>
      <MfaForm factorId={verified?.id ?? null} />
    </PageShell>
  )
}
