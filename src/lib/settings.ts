import 'server-only'
import { createServiceClient, isSupabaseConfigured } from '@/lib/supabase/server'
import type { Settings } from '@/lib/types'

export const DEFAULT_SETTINGS: Settings = {
  order_email: 'objednavky@vita-pro.sk',
  registration_notify_email: 'objednavky@vita-pro.sk',
  sales_name: 'Obchodné oddelenie',
  sales_email: 'objednavky@vita-pro.sk',
  sales_phone: '',
  auto_approve_known_ico: false,
  crate_size: 12,
}

export async function getSettings(): Promise<Settings> {
  if (!isSupabaseConfigured()) return DEFAULT_SETTINGS
  const { data } = await createServiceClient().from('settings').select('*').eq('id', 1).maybeSingle<Settings>()
  return { ...DEFAULT_SETTINGS, ...(data ?? {}) }
}

export const COMPANY = {
  name: 'AQUA PRO EUROPE, a.s.',
  street: 'Pod furčou 7',
  city: '040 01 Košice',
  producer: 'Výskumný ústav ovocných a okrasných drevín a.s., Prievidzská 1457/73, 972 01 Bojnice',
}
