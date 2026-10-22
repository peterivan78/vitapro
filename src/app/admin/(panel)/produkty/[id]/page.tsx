import { requireAdminPage } from '@/lib/auth'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminTitle } from '@/components/admin/ui'
import { createServiceClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'
import { ProductForm } from '../ProductForm'

export const metadata = { title: 'Úprava produktu' }

export default async function EditProductPage({ params }: PageProps<'/admin/produkty/[id]'>) {
  await requireAdminPage()
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound()
  const { data: product } = await createServiceClient().from('products').select('*').eq('id', id).maybeSingle<Product>()
  if (!product) notFound()
  return (
    <>
      <Link href="/admin/produkty" className="text-sm text-ink-mute hover:text-ink">
        ← Produkty
      </Link>
      <AdminTitle title={product.name} />
      <ProductForm product={product} />
    </>
  )
}
