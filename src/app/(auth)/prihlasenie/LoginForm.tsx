'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Field, FormError } from '@/components/form/Field'
import { SubmitButton } from '@/components/form/SubmitButton'
import { loginAction, type FormState } from '../actions'

export function LoginForm({ next, turnstile, notice }: { next: string; turnstile: React.ReactNode; notice?: string }) {
  const [state, action] = useActionState<FormState, FormData>(loginAction, {})
  return (
    <form action={action} className="space-y-5">
      <FormError message={state.error ?? notice} />
      <input type="hidden" name="next" value={next} />
      <Field label="Email" name="email" type="email" required autoComplete="email" defaultValue={state.values?.email} />
      <Field label="Heslo" name="password" type="password" required autoComplete="current-password" />
      {turnstile}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <SubmitButton pendingText="Prihlasujem…">Prihlásiť sa</SubmitButton>
        <Link href="/zabudnute-heslo" className="text-sm text-ink-mute underline underline-offset-4 hover:text-ink">
          Zabudnuté heslo
        </Link>
      </div>
      <p className="border-t border-line pt-6 text-sm text-ink-mute">
        Nemáte účet?{' '}
        <Link href="/registracia" className="text-ink underline underline-offset-4">
          Zaregistrujte firmu
        </Link>
      </p>
    </form>
  )
}
