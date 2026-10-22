import { requireAdminPage } from '@/lib/auth'
import Image from 'next/image'
import Link from 'next/link'
import { setProductStatusAction } from '@/app/admin/actions'
import { AdminTitle, Badge } from '@/components/admin/ui'
import { FormNotice } from '@/components/form/Field'
import { getAllProducts } from '@/lib/catalog/getProducts'
import { PRODUCT_STATUS_LABEL, type ProductStatus } from '@/lib/types'

export const metadata = { title: 'Produkty' }

const TONE: Record<ProductStatus, 'ok' | 'warn' | 'neutral'> = { active: 'ok', unavailable: 'warn', archived: 'neutral' }

export default async function AdminProductsPage({ searchParams }: PageProps<'/admin/produkty'>) {
  await requireAdminPage()
  const { ulozene } = await searchParams
  const products = await getAllProducts()

  return (
    <>
      <AdminTitle
        title="Produkty"
        actions={
          <Link href="/admin/produkty/novy" className="btn btn-primary">
            + Nový produkt
          </Link>
        }
      />
      {ulozene && <div className="mb-6"><FormNotice>Produkt je uložený.</FormNotice></div>}
      <p className="mb-6 max-w-2xl text-sm text-ink-soft">
        <strong>Aktívny</strong> – dá sa objednať. <strong>Dočasne nedostupný</strong> – zostáva na webe, ale nedá sa
        objednať. <strong>Vyradený</strong> – skrytý z webu (história objednávok zostáva).
      </p>
      <ul className="divide-y divide-line rounded-xl border border-line">
        {products.map((p) => (
          <li key={p.id} className={`flex flex-wrap items-center gap-4 p-4 ${p.status === 'archived' ? 'opacity-60' : ''}`}>
            <div className="relative h-12 w-16 shrink-0 rounded bg-paper">
              {(p.photo_url || p.illustration_url) && (
                <Image src={(p.photo_url || p.illustration_url)!} alt="" fill sizes="64px" className="object-contain p-1" />
              )}
            </div>
            <span aria-hidden className="h-8 w-1 rounded-full" style={{ background: p.accent_color }} />
            <div className="min-w-40 flex-1">
              <Link href={`/admin/produkty/${p.id}`} className="font-medium underline-offset-4 hover:underline">
                {p.name}
              </Link>
              <p className="font-mono text-xs text-ink-mute">{p.sku}</p>
            </div>
            <Badge tone={TONE[p.status]}>{PRODUCT_STATUS_LABEL[p.status]}</Badge>
            <form action={setProductStatusAction} className="flex items-center gap-2">
              <input type="hidden" name="id" value={p.id} />
              <select name="status" defaultValue={p.status} className="field !w-auto !py-1.5 text-sm" aria-label={`Stav – ${p.name}`}>
                {(Object.keys(PRODUCT_STATUS_LABEL) as ProductStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {PRODUCT_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              <button className="btn btn-ghost !py-1.5 text-sm">Zmeniť</button>
            </form>
            <Link href={`/admin/produkty/${p.id}`} className="text-sm underline underline-offset-4">
              Upraviť
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
