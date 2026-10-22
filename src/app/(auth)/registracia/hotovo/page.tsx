import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'

export const metadata: Metadata = { title: 'Registrácia odoslaná' }

export default function RegistrationDonePage() {
  return (
    <PageShell eyebrow="Registrácia" title="Skontrolujte si email">
      <ol className="space-y-6">
        {[
          ['Potvrďte email', 'Poslali sme vám odkaz na potvrdenie emailovej adresy. Ak ho nevidíte, pozrite aj priečinok so spamom.'],
          ['Počkajte na schválenie', 'Obchodné oddelenie overí, že ste klientom AQUA PRO EUROPE, a.s., a účet aktivuje.'],
          ['Objednávajte', 'Po schválení vám pošleme email a môžete začať objednávať.'],
        ].map(([title, text], i) => (
          <li key={title} className="flex gap-5">
            <span className="font-display text-2xl italic text-ink-mute">{i + 1}</span>
            <div>
              <p className="font-medium">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{text}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link href="/" className="btn btn-ghost mt-10">
        Späť na úvod
      </Link>
    </PageShell>
  )
}
