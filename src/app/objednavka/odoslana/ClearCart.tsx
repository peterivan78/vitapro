'use client'

import { useEffect } from 'react'
import { useCart } from '@/components/cart/CartProvider'

export function ClearCart() {
  const { clear, hydrated } = useCart()
  useEffect(() => {
    if (hydrated) clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])
  return null
}
