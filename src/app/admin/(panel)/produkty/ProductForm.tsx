'use client'

import Image from 'next/image'
import { useActionState, useState } from 'react'
import { saveProductAction, type AdminFormState } from '@/app/admin/actions'
import { Field, FormError } from '@/components/form/Field'
import { SubmitButton } from '@/components/form/SubmitButton'
import { PRODUCT_STATUS_LABEL, type Product, type ProductStatus } from '@/lib/types'

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function ProductForm({ product }: { product?: Product }) {
  const [state, action] = useActionState<AdminFormState, FormData>(saveProductAction, {})
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(product))
  const [color, setColor] = useState(product?.accent_color ?? '#1c1a19')
  const e = state.fields ?? {}
  const p = product

  return (
    <form action={action} className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-5">
        <FormError message={state.error} />
        {p && <input type="hidden" name="id" value={p.id} />}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Názov"
            name="name"
            required
            defaultValue={p?.name}
            error={e.name}
            onChange={(ev) => {
              if (!slugTouched) setSlug(slugify(ev.target.value))
            }}
          />
          <Field label="ID v ActiWhere" name="sku" required defaultValue={p?.sku} error={e.sku} hint="Musí sedieť s interným systémom." />
        </div>
        <Field label="Názov v ActiWhere" name="erp_name" defaultValue={p?.erp_name} error={e.erp_name} hint="Presne ako v internom systéme. Ide do objednávky; na webe sa zobrazuje „Názov“." />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Adresa (slug)"
            name="slug"
            required
            value={slug}
            onChange={(ev) => {
              setSlugTouched(true)
              setSlug(ev.target.value)
            }}
            error={e.slug}
          />
          <Field label="Objem / balenie" name="volume" defaultValue={p?.volume ?? '0,33 l'} error={e.volume} />
        </div>
        <Field label="Podnadpis" name="subtitle" defaultValue={p?.subtitle} error={e.subtitle} placeholder="100% prírodná šťava z …" />
        {(
          [
            ['description', 'Krátky popis', p?.description],
            ['composition', 'Zloženie', p?.composition],
            ['nutrition', 'Výživové údaje na 100 ml', p?.nutrition],
          ] as const
        ).map(([name, label, value]) => (
          <div key={name}>
            <label htmlFor={`f-${name}`} className="mb-1.5 block text-sm font-medium">
              {label}
            </label>
            <textarea id={`f-${name}`} name={name} rows={name === 'description' ? 2 : 3} defaultValue={value} className="field" />
            {e[name] && <p className="mt-1.5 text-sm text-danger">{e[name]}</p>}
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="f-status" className="mb-1.5 block text-sm font-medium">
            Stav
          </label>
          <select id="f-status" name="status" defaultValue={p?.status ?? 'active'} className="field">
            {(Object.keys(PRODUCT_STATUS_LABEL) as ProductStatus[]).map((s) => (
              <option key={s} value={s}>
                {PRODUCT_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-[1fr_auto] items-end gap-3">
          <Field label="Farba (z etikety)" name="accent_color" value={color} onChange={(ev) => setColor(ev.target.value)} error={e.accent_color} />
          <input type="color" aria-label="Výber farby" value={/^#[0-9a-f]{6}$/i.test(color) ? color : '#000000'} onChange={(ev) => setColor(ev.target.value)} className="h-11 w-14 cursor-pointer rounded border border-line" />
        </div>
        <Field label="Poradie" name="sort_order" type="number" min={0} defaultValue={p?.sort_order ?? 100} error={e.sort_order} hint="Menšie číslo = vyššie na webe." />

        <ImageInput name="illustration" label="Ilustrácia (rytina)" current={p?.illustration_url} />
        <ImageInput name="photo" label="Fotka produktu" current={p?.photo_url} hint="Ak je nahratá, zobrazí sa namiesto ilustrácie." />

        <SubmitButton pendingText="Ukladám…" className="btn btn-primary w-full">
          {p ? 'Uložiť zmeny' : 'Vytvoriť produkt'}
        </SubmitButton>
      </div>
    </form>
  )
}

function ImageInput({ name, label, current, hint }: { name: string; label: string; current?: string | null; hint?: string }) {
  return (
    <fieldset className="space-y-2 rounded-xl border border-line p-4">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      {current && (
        <div className="relative h-28 w-full rounded bg-paper">
          <Image src={current} alt="" fill sizes="320px" className="object-contain p-2" />
        </div>
      )}
      <input type="file" name={`${name}_file`} accept="image/png,image/jpeg,image/webp" className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-paper-deep file:px-3 file:py-1.5" />
      <p className="text-xs text-ink-mute">PNG, JPG alebo WEBP, max. 5 MB. {hint}</p>
      {current && (
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" name={`${name}_remove`} /> Odstrániť
        </label>
      )}
    </fieldset>
  )
}
