import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = { title: 'Obchodné podmienky' }

export default function TermsPage() {
  return <LegalPage title="Obchodné podmienky" />
}
