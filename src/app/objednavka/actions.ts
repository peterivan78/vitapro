'use server'

import { redirect } from 'next/navigation'
import { AccessError, requireApprovedCustomer } from '@/lib/auth'
import { OrderError, placeOrder } from '@/lib/orders/placeOrder'
import { orderSchema } from '@/lib/validation'

export type OrderFormState = { error?: string }

export async function submitOrderAction(_prev: OrderFormState, formData: FormData): Promise<OrderFormState> {
  let orderNumber: string
  try {
    const viewer = await requireApprovedCustomer()
    let items: unknown
    try {
      items = JSON.parse(String(formData.get('items') ?? '[]'))
    } catch {
      return { error: 'Neplatné položky objednávky.' }
    }
    const parsed = orderSchema.safeParse({
      address_id: formData.get('address_id'),
      requested_date: formData.get('requested_date') ?? '',
      note: formData.get('note') ?? '',
      items,
    })
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    const result = await placeOrder(viewer.profile, {
      addressId: parsed.data.address_id,
      requestedDate: parsed.data.requested_date,
      note: parsed.data.note,
      items: parsed.data.items,
    })
    orderNumber = result.orderNumber
  } catch (e) {
    if (e instanceof OrderError || e instanceof AccessError) return { error: e.message }
    console.error('[order]', e)
    return { error: 'Niečo sa pokazilo. Skúste to znova alebo nás kontaktujte.' }
  }
  redirect(`/objednavka/odoslana?c=${encodeURIComponent(orderNumber)}`)
}
