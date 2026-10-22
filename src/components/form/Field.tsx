import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  name: string
  error?: string
  hint?: string
}

export function Field({ label, name, error, hint, className, ...input }: Props) {
  const id = input.id ?? `f-${name}`
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {input.required && <span className="text-ink-mute"> *</span>}
      </label>
      <input id={id} name={name} className="field" aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...input} />
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-mute">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
      {message}
    </p>
  )
}

export function FormNotice({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-ok/20 bg-ok/5 px-4 py-3 text-sm text-ok">{children}</p>
}
