import 'server-only'

// Cloudflare Turnstile – ochrana formulárov pred botmi. Voliteľné:
// bez TURNSTILE_SECRET_KEY sa kontrola preskočí (vývoj / pred nasadením).
export async function verifyTurnstile(token: FormDataEntryValue | null, ip?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (typeof token !== 'string' || !token) return false
  const body = new URLSearchParams({ secret, response: token })
  if (ip) body.set('remoteip', ip)
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}
