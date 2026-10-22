'use client'

import { useActionState } from 'react'
import { Field, FormError, FormNotice } from '@/components/form/Field'
import { SubmitButton } from '@/components/form/SubmitButton'
import { forgotPasswordAction, type FormState } from '../actions'

export function ForgotForm({ turnstile }: { turnstile: React.ReactNode }) {
  const [state, action] = useActionState<FormState, FormData>(forgotPasswordAction, {})
  if (state.ok) {
    return <FormNotice>Ak k tomuto emailu existuje účet, poslali sme naň odkaz na zmenu hesla.</FormNotice>
  }
  return (
    <form action={action} className="space-y-5">
      <FormError message={state.error} />
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      {turnstile}
      <SubmitButton>Poslať odkaz</SubmitButton>
    </form>
  )
}
