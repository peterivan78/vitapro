export function siteUrl(path = ''): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
  return `${base}${path}`
}

/** Bezpečný návrat po prihlásení – len relatívne cesty na tomto webe. */
export function safeNext(next: unknown, fallback = '/'): string {
  if (typeof next !== 'string') return fallback
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback
  return next
}
