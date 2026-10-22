import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageShell } from '@/components/PageShell'
import { Turnstile } from '@/components/form/Turnstile'
import { getViewer } from '@/lib/auth'
import { safeNext } from '@/lib/site'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Prihlásenie' }

export default async function LoginPage({ searchParams }: PageProps<'/prihlasenie'>) {
  const params = await searchParams
  const next = safeNext(params.next)
  if (await getViewer()) redirect(next)
  const notice = params.chyba === 'odkaz' ? 'Odkaz je neplatný alebo vypršal. Prihláste sa, prípadne si vyžiadajte nový.' : undefined
  return (
    <PageShell eyebrow="Účet" title="Prihlásenie">
      <LoginForm next={next} turnstile={<Turnstile />} notice={notice} />
    </PageShell>
  )
}
