'use server'

import { revalidatePath } from 'next/cache'
import { AccessError, getViewer } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { addressSchema, fieldErrors, profileSchema } from '@/lib/validation'

export type AccountFormState = { error?: string; fields?: Record<string, string>; ok?: boolean }

async function requireProfileId(): Promise<string> {
  const viewer = await getViewer()
  if (!viewer?.profile) throw new AccessError('Nie ste prihlásený.')
  if (viewer.profile.status === 'blocked') throw new AccessError('Účet je pozastavený.')
  return viewer.profile.id
}

function handle(e: unknown): AccountFormState {
  if (e instanceof AccessError) return { error: e.message }
  console.error('[account]', e)
  return { error: 'Uloženie sa nepodarilo. Skúste to znova.' }
}

export async function saveAddressAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  try {
    const profileId = await requireProfileId()
    const parsed = addressSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { fields: fieldErrors(parsed.error) }
    const db = createServiceClient()
    const id = String(formData.get('id') ?? '')

    if (id) {
      // Úprava len vlastnej adresy (profile_id v podmienke).
      const { error } = await db.from('addresses').update(parsed.data).eq('id', id).eq('profile_id', profileId)
      if (error) throw error
    } else {
      const { count } = await db
        .from('addresses')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', profileId)
        .eq('archived', false)
      if ((count ?? 0) >= 50) return { error: 'Dosiahli ste maximálny počet adries.' }
      const { error } = await db.from('addresses').insert({ ...parsed.data, profile_id: profileId, is_default: count === 0 })
      if (error) throw error
    }
    revalidatePath('/ucet')
    revalidatePath('/objednavka')
    return { ok: true }
  } catch (e) {
    return handle(e)
  }
}

export async function archiveAddressAction(formData: FormData) {
  const profileId = await requireProfileId()
  const id = String(formData.get('id') ?? '')
  await createServiceClient()
    .from('addresses')
    .update({ archived: true, is_default: false })
    .eq('id', id)
    .eq('profile_id', profileId)
  revalidatePath('/ucet')
}

export async function setDefaultAddressAction(formData: FormData) {
  const profileId = await requireProfileId()
  const id = String(formData.get('id') ?? '')
  const db = createServiceClient()
  const { data } = await db.from('addresses').select('id').eq('id', id).eq('profile_id', profileId).eq('archived', false).maybeSingle()
  if (!data) return
  await db.from('addresses').update({ is_default: false }).eq('profile_id', profileId)
  await db.from('addresses').update({ is_default: true }).eq('id', id)
  revalidatePath('/ucet')
}

export async function updateProfileAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  try {
    const profileId = await requireProfileId()
    const parsed = profileSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return { fields: fieldErrors(parsed.error) }
    // IČO, email, stav a rola sa tu meniť nedajú.
    const { error } = await createServiceClient().from('profiles').update(parsed.data).eq('id', profileId)
    if (error) throw error
    revalidatePath('/ucet')
    return { ok: true }
  } catch (e) {
    return handle(e)
  }
}
