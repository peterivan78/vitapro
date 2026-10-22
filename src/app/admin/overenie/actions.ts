'use server'

import { redirect } from 'next/navigation'
import { getViewer } from '@/lib/auth'
import { createSessionClient } from '@/lib/supabase/server'

export type MfaState = { error?: string; enroll?: { factorId: string; qr: string; secret: string } }

async function requireAdminRole() {
  const viewer = await getViewer()
  if (viewer?.profile?.role !== 'admin') redirect('/')
}

export async function startEnrollAction(): Promise<MfaState> {
  await requireAdminRole()
  const supabase = await createSessionClient()
  // Nedokončené (neoverené) faktory z predchádzajúcich pokusov odstránime.
  const { data: factors } = await supabase.auth.mfa.listFactors()
  for (const f of factors?.all ?? []) {
    if (f.status === 'unverified') await supabase.auth.mfa.unenroll({ factorId: f.id })
  }
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: `VITAPRO admin ${Date.now()}` })
  if (error || !data) return { error: 'Nepodarilo sa spustiť nastavenie overenia.' }
  return { enroll: { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret } }
}

export async function verifyMfaAction(prev: MfaState, formData: FormData): Promise<MfaState> {
  await requireAdminRole()
  const factorId = String(formData.get('factorId') ?? '')
  const code = String(formData.get('code') ?? '').replace(/\s/g, '')
  if (!/^\d{6}$/.test(code)) return { ...prev, error: 'Zadajte 6-miestny kód z aplikácie.' }
  const supabase = await createSessionClient()
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })
  if (error) return { ...prev, error: 'Kód nie je správny alebo vypršal. Skúste znova.' }
  redirect('/admin')
}
