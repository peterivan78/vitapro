import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = { title: 'Ochrana osobných údajov' }

export default function PrivacyPage() {
  return <LegalPage title="Ochrana osobných údajov" />
}
