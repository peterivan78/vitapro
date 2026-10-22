'use client'

import { useActionState } from 'react'
import { Field, FormError } from '@/components/form/Field'
import { SubmitButton } from '@/components/form/SubmitButton'
import { newPasswordAction, type FormState } from '../actions'

export function NewPasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(newPasswordAction, {})
  const e = state.fields ?? {}
  return (
    <form action={action} className="space-y-5">
      <FormError message={state.error} />
      <Field label="Nové heslo" name="password" type="password" required autoComplete="new-password" hint="Aspoň 10 znakov." error={e.password} />
      <Field label="Nové heslo znova" name="password_confirm" type="password" required autoComplete="new-password" error={e.password_confirm} />
      <SubmitButton>Uložiť heslo</SubmitButton>
    </form>
  )
}
