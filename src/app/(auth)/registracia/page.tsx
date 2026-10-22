import type { Metadata } from 'next'
import { PageShell } from '@/components/PageShell'
import { Turnstile } from '@/components/form/Turnstile'
import { RegistrationForm } from './RegistrationForm'

export const metadata: Metadata = { title: 'Registrácia' }

export default function RegistrationPage() {
  return (
    <PageShell
      eyebrow="Pre obchodných partnerov"
      title="Registrácia firmy"
      intro={
        <p>
          Objednávať môžu klienti spoločnosti AQUA PRO EUROPE, a.s. Po registrácii potvrďte svoj email – obchodné
          oddelenie následne overí vaše údaje a účet schváli. O schválení vás budeme informovať emailom.
        </p>
      }
    >
      <RegistrationForm turnstile={<Turnstile />} />
    </PageShell>
  )
}
