'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/components/cart/CartProvider'
import { writeStandingChange } from '@/lib/standingChange'

/** Načíta položky pravidelnej dodávky do výberu a prepne pokladňu do režimu zmeny. */
export function StandingChangeButton({
  orderId,
  orderNumber,
  items,
}: {
  orderId: string
  orderNumber: string
  items: { product_id: string | null; quantity: number }[]
}) {
  const { enabled, setQuantity, clear } = useCart()
  const router = useRouter()
  if (!enabled) return null
  return (
    <button
      type="button"
      className="btn btn-ghost !py-2 text-sm"
      onClick={() => {
        clear()
        for (const i of items) if (i.product_id) setQuantity(i.product_id, i.quantity)
        writeStandingChange({ orderId, orderNumber })
        router.push('/#stavy')
      }}
    >
      Zmeniť
    </button>
  )
}
