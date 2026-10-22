import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = { title: 'Používanie cookies' }

export default function CookiesPage() {
  return <LegalPage title="Používanie cookies" />
}
