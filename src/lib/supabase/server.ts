import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Klient viazaný na prihláseného používateľa (cookies, anon kľúč, rešpektuje RLS).
// Používať na: kto je prihlásený, prihlásenie/odhlásenie, MFA.
export async function createSessionClient() {
  const cookieStore = await cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Volané zo Server Component – cookies nastaví proxy.ts.
        }
      },
    },
  })
}

// Privilegovaný klient (service role, OBCHÁDZA RLS). Len na serveri a len
// PO overení oprávnení cez src/lib/auth.ts (requireApprovedCustomer / requireAdmin).
export function createServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
