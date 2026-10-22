'use client'

import { useActionState } from 'react'
import { Field, FormError, FormNotice } from '@/components/form/Field'
import { SubmitButton } from '@/components/form/SubmitButton'
import type { Profile } from '@/lib/types'
import { updateProfileAction, type AccountFormState } from './actions'

export function ProfileForm({ profile: p }: { profile: Profile }) {
  const [state, action] = useActionState<AccountFormState, FormData>(updateProfileAction, {})
  const e = state.fields ?? {}
  return (
    <form action={action} className="space-y-4">
      <FormError message={state.error} />
      {state.ok && <FormNotice>Údaje sú uložené.</FormNotice>}
      <Field label="Obchodné meno" name="company_name" required defaultValue={p.company_name} error={e.company_name} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="IČO" name="ico_ro" defaultValue={p.ico} disabled hint="Zmenu IČO nahláste obchodnému oddeleniu." />
        <Field label="DIČ" name="dic" defaultValue={p.dic} error={e.dic} />
        <Field label="IČ DPH" name="ic_dph" defaultValue={p.ic_dph} error={e.ic_dph} />
      </div>
      <Field label="Ulica a číslo (sídlo)" name="billing_street" required defaultValue={p.billing_street} error={e.billing_street} />
      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <Field label="PSČ" name="billing_zip" required defaultValue={p.billing_zip} error={e.billing_zip} />
        <Field label="Mesto" name="billing_city" required defaultValue={p.billing_city} error={e.billing_city} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kontaktná osoba" name="contact_name" required defaultValue={p.contact_name} error={e.contact_name} />
        <Field label="Telefón" name="phone" type="tel" required defaultValue={p.phone} error={e.phone} />
      </div>
      <SubmitButton pendingText="Ukladám…">Uložiť údaje</SubmitButton>
    </form>
  )
}
