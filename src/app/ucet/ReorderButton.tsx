'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/components/cart/CartProvider'

export function ReorderButton({ items }: { items: { product_id: string | null; quantity: number }[] }) {
  const { enabled, setQuantity, clear } = useCart()
  const router = useRouter()
  if (!enabled) return null
  return (
    <button
      type="button"
      className="text-sm underline underline-offset-4"
      onClick={() => {
        clear()
        for (const i of items) if (i.product_id) setQuantity(i.product_id, i.quantity)
        router.push('/#stavy')
      }}
    >
      Objednať znova
    </button>
  )
}
