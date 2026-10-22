import { createCancelToken, hashCancelToken, isWellFormedCancelToken } from './cancelToken'

vi.mock('server-only', () => ({}))

describe('cancel token', () => {
  it('creates a URL-safe 256-bit token and stores only its hash', () => {
    const { token, hash } = createCancelToken()
    expect(isWellFormedCancelToken(token)).toBe(true)
    expect(hash).toBe(hashCancelToken(token))
    expect(hash).not.toContain(token)
  })

  it('rejects malformed tokens', () => {
    expect(isWellFormedCancelToken('abc')).toBe(false)
    expect(isWellFormedCancelToken(undefined)).toBe(false)
    expect(isWellFormedCancelToken("x'; drop table orders;--".padEnd(43, 'a'))).toBe(false)
  })
})
