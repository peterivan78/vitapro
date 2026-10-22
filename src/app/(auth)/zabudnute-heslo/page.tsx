import type { Metadata } from 'next'
import { PageShell } from '@/components/PageShell'
import { Turnstile } from '@/components/form/Turnstile'
import { ForgotForm } from './ForgotForm'

export const metadata: Metadata = { title: 'Zabudnuté heslo' }

export default function ForgotPasswordPage() {
  return (
    <PageShell eyebrow="Účet" title="Zabudnuté heslo" intro={<p>Pošleme vám odkaz na nastavenie nového hesla.</p>}>
      <ForgotForm turnstile={<Turnstile />} />
    </PageShell>
  )
}
