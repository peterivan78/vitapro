import 'server-only'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { cache } from 'react'
import { createServiceClient, createSessionClient, isSupabaseConfigured } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

/** Chyba oprávnenia – jej text sa smie zobraziť používateľovi. */
export class AccessError extends Error {}

export type Viewer = {
  userId: string
  email: string
  emailConfirmed: boolean
  profile: Profile | null
}

// Overený používateľ (getUser() overuje token na serveri Supabase,
// na rozdiel od getSession(), ktorému sa nedá veriť).
export const getViewer = cache(async (): Promise<Viewer | null> => {
  // Vždy dynamicky – stránky závislé od prihlásenia sa nesmú vygenerovať staticky.
  await connection()
  if (!isSupabaseConfigured()) return null
  const supabase = await createSessionClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null

  const { data: profile } = await createServiceClient()
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle<Profile>()

  return {
    userId: data.user.id,
    email: data.user.email ?? '',
    emailConfirmed: Boolean(data.user.email_confirmed_at),
    profile: profile ?? null,
  }
})

export function canOrder(viewer: Viewer | null): boolean {
  return Boolean(viewer?.profile && viewer.profile.status === 'approved')
}

/** Pre stránky: neprihlásený → prihlásenie. */
export async function requireViewer(next: string): Promise<Viewer> {
  const viewer = await getViewer()
  if (!viewer) redirect(`/prihlasenie?next=${encodeURIComponent(next)}`)
  return viewer
}

/** Pre serverové akcie objednávania. Vyhodí chybu, ak zákazník nie je schválený. */
export async function requireApprovedCustomer(): Promise<Viewer & { profile: Profile }> {
  const viewer = await getViewer()
  if (!viewer || !viewer.profile) throw new AccessError('Nie ste prihlásený.')
  if (viewer.profile.status !== 'approved') throw new AccessError('Váš účet ešte nebol schválený.')
  return viewer as Viewer & { profile: Profile }
}

export type AdminCheck =
  | { ok: true; viewer: Viewer & { profile: Profile } }
  | { ok: false; reason: 'anonymous' | 'forbidden' | 'mfa_enroll' | 'mfa_verify' }

// Admin musí mať rolu admin A dvojfaktorové overenie (aal2).
export async function checkAdmin(): Promise<AdminCheck> {
  const viewer = await getViewer()
  if (!viewer) return { ok: false, reason: 'anonymous' }
  if (viewer.profile?.role !== 'admin') return { ok: false, reason: 'forbidden' }

  const supabase = await createSessionClient()
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal?.currentLevel !== 'aal2') {
    return { ok: false, reason: aal?.nextLevel === 'aal2' ? 'mfa_verify' : 'mfa_enroll' }
  }
  return { ok: true, viewer: viewer as Viewer & { profile: Profile } }
}

/** Pre admin stránky – presmeruje podľa dôvodu. */
export async function requireAdminPage(): Promise<Viewer & { profile: Profile }> {
  const check = await checkAdmin()
  if (check.ok) return check.viewer
  if (check.reason === 'anonymous') redirect('/prihlasenie?next=/admin')
  if (check.reason === 'forbidden') redirect('/')
  redirect('/admin/overenie')
}

/** Pre admin serverové akcie. */
export async function requireAdmin(): Promise<Viewer & { profile: Profile }> {
  const check = await checkAdmin()
  if (!check.ok) throw new AccessError('Nemáte oprávnenie.')
  return check.viewer
}
