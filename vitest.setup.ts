import '@testing-library/jest-dom/vitest'

// Node (v22+) ships a built-in, opt-in `localStorage` global backed by a SQLite
// file. When no `--localstorage-file` path is configured, that built-in wins
// over jsdom's own in-memory implementation (jsdom's `window.localStorage` and
// `globalThis.localStorage` resolve to the same broken object, whose `setItem`
// is not a function), which breaks anything relying on Web Storage in tests —
// e.g. Zustand's `persist` middleware. Replace it with a minimal, working
// in-memory mock so `localStorage`/`window.localStorage` behave as expected.
class InMemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length() {
    return this.store.size
  }

  clear() {
    this.store.clear()
  }

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string) {
    this.store.delete(key)
  }

  setItem(key: string, value: string) {
    this.store.set(key, String(value))
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  enumerable: true,
  value: new InMemoryStorage(),
})
// Only jsdom-environment tests have a `window` global — API route tests
// running under the `node` environment (see @vitest-environment pragma)
// don't, and only need the globalThis assignment above.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    enumerable: true,
    value: new InMemoryStorage(),
  })
}
