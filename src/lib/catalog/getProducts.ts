import 'server-only'
import { DEFAULT_PRODUCTS } from '@/lib/catalog/defaultProducts'
import { createServiceClient, isSupabaseConfigured } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'

/** Produkty viditeľné na webe (aktívne + dočasne nedostupné). */
export async function getVisibleProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    // Náhľad bez databázy.
    return DEFAULT_PRODUCTS.map((p) => ({ ...p, id: p.slug, status: 'active', photo_url: null }))
  }
  const { data, error } = await createServiceClient()
    .from('products')
    .select('*')
    .neq('status', 'archived')
    .order('sort_order')
    .order('name')
  if (error) throw error
  return (data ?? []) as Product[]
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await createServiceClient()
    .from('products')
    .select('*')
    .order('sort_order')
    .order('name')
  if (error) throw error
  return (data ?? []) as Product[]
}
