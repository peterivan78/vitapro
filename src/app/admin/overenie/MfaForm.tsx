'use client'

import { useActionState, useState, useTransition } from 'react'
import { FormError } from '@/components/form/Field'
import { SubmitButton } from '@/components/form/SubmitButton'
import { startEnrollAction, verifyMfaAction, type MfaState } from './actions'

export function MfaForm({ factorId }: { factorId: string | null }) {
  const [enroll, setEnroll] = useState<MfaState['enroll']>()
  const [enrollError, setEnrollError] = useState<string>()
  const [starting, startTransition] = useTransition()
  const [state, action] = useActionState<MfaState, FormData>(verifyMfaAction, {})
  const activeFactor = factorId ?? enroll?.factorId

  if (!activeFactor) {
    return (
      <div className="space-y-5">
        <p className="leading-relaxed text-ink-soft">
          Administrácia je chránená dvojstupňovým overením. Nainštalujte si do telefónu aplikáciu na overovacie kódy
          (napr. Google Authenticator, Microsoft Authenticator alebo 1Password) a pokračujte.
        </p>
        <FormError message={enrollError} />
        <button
          type="button"
          className="btn btn-primary"
          disabled={starting}
          onClick={() =>
            startTransition(async () => {
              const res = await startEnrollAction()
              if (res.error) setEnrollError(res.error)
              else setEnroll(res.enroll)
            })
          }
        >
          {starting ? 'Pripravujem…' : 'Nastaviť overenie'}
        </button>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-6">
      {enroll && (
        <div className="space-y-4">
          <p className="text-ink-soft">Naskenujte QR kód aplikáciou a zadajte 6-miestny kód, ktorý zobrazí.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enroll.qr} alt="QR kód pre aplikáciu na overovanie" width={200} height={200} className="rounded-lg bg-white p-3" />
          <p className="text-xs text-ink-mute">
            Kód nejde naskenovať? Zadajte ručne: <code className="break-all font-mono">{enroll.secret}</code>
          </p>
        </div>
      )}
      <input type="hidden" name="factorId" value={activeFactor} />
      <FormError message={state.error} />
      <div>
        <label htmlFor="code" className="mb-1.5 block text-sm font-medium">
          Overovací kód
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          autoFocus
          className="field !w-40 text-center font-mono text-xl tracking-[0.3em]"
        />
      </div>
      <SubmitButton pendingText="Overujem…">Overiť</SubmitButton>
    </form>
  )
}
