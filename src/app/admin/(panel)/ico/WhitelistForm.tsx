'use client'

import { useActionState } from 'react'
import { addWhitelistAction, type AdminFormState } from '@/app/admin/actions'
import { FormError, FormNotice } from '@/components/form/Field'
import { SubmitButton } from '@/components/form/SubmitButton'

export function WhitelistForm() {
  const [state, action] = useActionState<AdminFormState, FormData>(addWhitelistAction, {})
  return (
    <form action={action} className="space-y-3">
      <label htmlFor="entries" className="block text-sm font-medium">
        Pridať IČO
      </label>
      <textarea
        id="entries"
        name="entries"
        rows={8}
        className="field font-mono text-sm"
        placeholder={'12345678;Firma s.r.o.\n87654321;Iná firma a.s.'}
      />
      <p className="text-xs text-ink-mute">Jeden klient na riadok: IČO, voliteľne bodkočiarka a názov. Dá sa vložiť aj stĺpec z Excelu.</p>
      <FormError message={state.error} />
      {state.ok && <FormNotice>{state.message}</FormNotice>}
      <SubmitButton pendingText="Ukladám…">Pridať do zoznamu</SubmitButton>
    </form>
  )
}
