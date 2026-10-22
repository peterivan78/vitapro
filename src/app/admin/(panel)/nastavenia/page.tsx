import { requireAdminPage } from '@/lib/auth'
import { AdminTitle } from '@/components/admin/ui'
import { getSettings } from '@/lib/settings'
import { SettingsForm } from './SettingsForm'

export const metadata = { title: 'Nastavenia' }

export default async function AdminSettingsPage() {
  await requireAdminPage()
  const settings = await getSettings()
  return (
    <>
      <AdminTitle title="Nastavenia" />
      <SettingsForm settings={settings} />
    </>
  )
}
