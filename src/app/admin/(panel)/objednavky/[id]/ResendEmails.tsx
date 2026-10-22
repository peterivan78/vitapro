'use client'

import { useActionState } from 'react'
import { resendOrderEmailsAction, type AdminFormState } from '@/app/admin/actions'
import { FormError, FormNotice } from '@/components/form/Field'
import { SubmitButton } from '@/components/form/SubmitButton'

export function ResendEmails({ orderId }: { orderId: string }) {
  const [state, action] = useActionState<AdminFormState, FormData>(resendOrderEmailsAction, {})
  return (
    <form action={action} className="mt-4 space-y-3">
      <input type="hidden" name="id" value={orderId} />
      <div className="flex flex-wrap items-center gap-2">
        <select name="which" defaultValue="internal" className="field !w-auto !py-1.5 text-sm" aria-label="Ktorý email">
          <option value="internal">Interný email</option>
          <option value="customer">Potvrdenie zákazníkovi</option>
          <option value="both">Oba</option>
        </select>
        <SubmitButton className="btn btn-ghost !py-1.5 text-sm" pendingText="Odosielam…">
          Odoslať znova
        </SubmitButton>
      </div>
      <FormError message={state.error} />
      {state.ok && <FormNotice>{state.message}</FormNotice>}
    </form>
  )
}
