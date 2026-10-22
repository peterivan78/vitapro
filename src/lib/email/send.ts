import 'server-only'
import { Resend } from 'resend'
import type { EmailContent } from '@/lib/email/templates'

export type SendInput = EmailContent & {
  to: string | string[]
  replyTo?: string
  attachments?: { filename: string; content: string; contentType?: string }[]
}

// Odosielateľ: ORDER_FROM_EMAIL (napr. "VITAPRO <objednavky@vita-pro.sk>").
// Doména musí byť overená v Resend. Bez API kľúča sa email len zaloguje.
export async function sendEmail(input: SendInput): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.ORDER_FROM_EMAIL || 'VITAPRO <onboarding@resend.dev>'
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY chýba – email neodoslaný:', input.subject)
    return { ok: false, error: 'missing_api_key' }
  }
  const { error } = await new Resend(apiKey).emails.send({
    from,
    to: input.to,
    replyTo: input.replyTo,
    subject: input.subject,
    html: input.html,
    text: input.text,
    attachments: input.attachments?.map((a) => ({
      filename: a.filename,
      content: Buffer.from(a.content, 'utf-8'),
      contentType: a.contentType,
    })),
  })
  if (error) {
    console.error('[email] odoslanie zlyhalo:', input.subject, error)
    return { ok: false, error: error.message }
  }
  return { ok: true }
}
