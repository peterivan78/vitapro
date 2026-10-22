import { requireAdminPage } from '@/lib/auth'
import Link from 'next/link'
import { AdminTitle } from '@/components/admin/ui'
import { ProductForm } from '../ProductForm'

export const metadata = { title: 'Nový produkt' }

export default async function NewProductPage() {
  await requireAdminPage()
  return (
    <>
      <Link href="/admin/produkty" className="text-sm text-ink-mute hover:text-ink">
        ← Produkty
      </Link>
      <AdminTitle title="Nový produkt" />
      <ProductForm />
    </>
  )
}
