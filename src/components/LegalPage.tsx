import { PageShell } from '@/components/PageShell'

// Kostra právnej stránky. Finálne znenie dodá klient (AQUA PRO EUROPE, a.s.).
export function LegalPage({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <PageShell eyebrow="Právne informácie" title={title} width="wide">
      <div className="max-w-3xl space-y-4 leading-relaxed text-ink-soft">
        {children ?? (
          <p className="rounded-lg border border-dashed border-line bg-white p-6">
            Text pripravujeme. Znenie dodá AQUA PRO EUROPE, a.s. pred spustením webu.
          </p>
        )}
      </div>
    </PageShell>
  )
}
