'use client'

import { useEffect } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import { writeStandingChange } from '@/lib/standingChange'

export function ClearCart() {
  const { clear, hydrated } = useCart()
  useEffect(() => {
    if (hydrated) {
      clear()
      writeStandingChange(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])
  return null
}
