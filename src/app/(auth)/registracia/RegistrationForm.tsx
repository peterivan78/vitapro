'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Field, FormError } from '@/components/form/Field'
import { SubmitButton } from '@/components/form/SubmitButton'
import { registerAction, type FormState } from '../actions'

export function RegistrationForm({ turnstile }: { turnstile: React.ReactNode }) {
  const [state, action] = useActionState<FormState, FormData>(registerAction, {})
  const e = state.fields ?? {}
  const v = state.values ?? {}

  return (
    <form action={action} className="space-y-10" noValidate>
      <FormError message={state.error} />

      <fieldset className="space-y-5">
        <legend className="eyebrow mb-5 text-ink-mute">Firma</legend>
        <Field label="Obchodné meno" name="company_name" required autoComplete="organization" defaultValue={v.company_name} error={e.company_name} />
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="IČO" name="ico" required inputMode="numeric" defaultValue={v.ico} error={e.ico} />
          <Field label="DIČ" name="dic" defaultValue={v.dic} error={e.dic} />
          <Field label="IČ DPH" name="ic_dph" defaultValue={v.ic_dph} error={e.ic_dph} />
        </div>
        <Field label="Ulica a číslo (sídlo)" name="billing_street" required autoComplete="street-address" defaultValue={v.billing_street} error={e.billing_street} />
        <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
          <Field label="PSČ" name="billing_zip" required autoComplete="postal-code" defaultValue={v.billing_zip} error={e.billing_zip} />
          <Field label="Mesto" name="billing_city" required autoComplete="address-level2" defaultValue={v.billing_city} error={e.billing_city} />
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="eyebrow mb-5 text-ink-mute">Kontaktná osoba</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Meno a priezvisko" name="contact_name" required autoComplete="name" defaultValue={v.contact_name} error={e.contact_name} />
          <Field label="Telefón" name="phone" type="tel" required autoComplete="tel" defaultValue={v.phone} error={e.phone} />
        </div>
        <Field label="Email (prihlasovacie meno)" name="email" type="email" required autoComplete="email" defaultValue={v.email} error={e.email} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Heslo" name="password" type="password" required autoComplete="new-password" minLength={10} hint="Aspoň 10 znakov." error={e.password} />
          <Field label="Heslo znova" name="password_confirm" type="password" required autoComplete="new-password" error={e.password_confirm} />
        </div>
      </fieldset>

      <fieldset className="space-y-3 text-sm">
        <legend className="sr-only">Súhlasy</legend>
        <label className="flex gap-3">
          <input type="checkbox" name="terms" className="mt-0.5 h-4 w-4 accent-ink" defaultChecked={v.terms === 'on'} />
          <span>
            Súhlasím s{' '}
            <Link href="/obchodne-podmienky" target="_blank" className="underline underline-offset-4">
              obchodnými podmienkami
            </Link>
            .
          </span>
        </label>
        {e.terms && <p className="text-danger">{e.terms}</p>}
        <label className="flex gap-3">
          <input type="checkbox" name="privacy" className="mt-0.5 h-4 w-4 accent-ink" defaultChecked={v.privacy === 'on'} />
          <span>
            Oboznámil(a) som sa so{' '}
            <Link href="/ochrana-osobnych-udajov" target="_blank" className="underline underline-offset-4">
              spracovaním osobných údajov
            </Link>
            .
          </span>
        </label>
        {e.privacy && <p className="text-danger">{e.privacy}</p>}
      </fieldset>

      {turnstile}

      <div className="flex flex-wrap items-center gap-5">
        <SubmitButton pendingText="Registrujem…">Odoslať registráciu</SubmitButton>
        <p className="text-sm text-ink-mute">
          Už máte účet?{' '}
          <Link href="/prihlasenie" className="text-ink underline underline-offset-4">
            Prihláste sa
          </Link>
        </p>
      </div>
    </form>
  )
}
