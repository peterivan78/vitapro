import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { safeNext } from '@/lib/site'
import { createSessionClient } from '@/lib/supabase/server'

// Cieľ odkazov z emailov Supabase (potvrdenie registrácie, zmena hesla).
// Podporuje obe varianty: token_hash (odporúčaná šablóna emailu, funguje
// aj na inom zariadení) aj code (predvolený PKCE tok).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const next = safeNext(searchParams.get('next'), '/ucet')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const supabase = await createSessionClient()

  let ok = false
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    ok = !error
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    ok = !error
  }

  const target = ok ? next : '/prihlasenie?chyba=odkaz'
  return NextResponse.redirect(new URL(target, request.url))
}
