'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { clampQuantity } from '@/lib/crates'

type Cart = Record<string, number>

type CartContextValue = {
  enabled: boolean
  cart: Cart
  units: number
  quantity: (productId: string) => number
  setQuantity: (productId: string, quantity: number) => void
  clear: () => void
  hydrated: boolean
}

const STORAGE_KEY = 'vitapro-cart-v1'
const CartContext = createContext<CartContextValue | null>(null)

function readStorage(): Cart {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : {}
    if (!parsed || typeof parsed !== 'object') return {}
    const out: Cart = {}
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      const q = clampQuantity(Number(v))
      if (q > 0) out[k] = q
    }
    return out
  } catch {
    return {}
  }
}

export function CartProvider({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Načítanie uloženého košíka až po hydratácii (localStorage nie je na serveri).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(enabled ? readStorage() : {})
    setHydrated(true)
  }, [enabled])

  useEffect(() => {
    if (!hydrated || !enabled) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // Súkromné okno / plné úložisko – košík ostane len v pamäti.
    }
  }, [cart, hydrated, enabled])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) => {
      const q = clampQuantity(quantity)
      const next = { ...prev }
      if (q > 0) next[productId] = q
      else delete next[productId]
      return next
    })
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({
      enabled,
      cart,
      units: Object.values(cart).reduce((a, b) => a + b, 0),
      quantity: (id) => cart[id] ?? 0,
      setQuantity,
      clear: () => setCart({}),
      hydrated,
    }),
    [enabled, cart, setQuantity, hydrated],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart musí byť vnútri CartProvider')
  return ctx
}
