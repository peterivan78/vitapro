import type { Metadata } from 'next'
import { PageShell } from '@/components/PageShell'
import { requireViewer } from '@/lib/auth'
import { NewPasswordForm } from './NewPasswordForm'

export const metadata: Metadata = { title: 'Nové heslo' }

export default async function NewPasswordPage() {
  await requireViewer('/nove-heslo')
  return (
    <PageShell eyebrow="Účet" title="Nastavte si nové heslo">
      <NewPasswordForm />
    </PageShell>
  )
}
