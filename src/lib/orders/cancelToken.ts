import 'server-only'
import { createHash, randomBytes } from 'node:crypto'

/** Jednorazový token do odkazu na zrušenie objednávky (256 bitov). */
export function createCancelToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url')
  return { token, hash: hashCancelToken(token) }
}

export function hashCancelToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function isWellFormedCancelToken(token: unknown): token is string {
  return typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token)
}
