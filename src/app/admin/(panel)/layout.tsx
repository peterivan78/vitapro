import type { Metadata } from 'next'
import { AdminNav } from '@/components/admin/AdminNav'
import { requireAdminPage } from '@/lib/auth'

export const metadata: Metadata = { title: { default: 'Administrácia', template: '%s | Admin VITAPRO' }, robots: { index: false } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage()
  return (
    <div className="bg-white">
      <div className="border-b border-line bg-paper">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <AdminNav />
        </div>
      </div>
      <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  )
}
