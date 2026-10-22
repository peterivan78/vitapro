import type { OrderCustomer, OrderDeliveryAddress } from '@/lib/types'

// Strojovo čitateľná objednávka pre internú AI / import do interného systému.
// Štruktúru NEMENIŤ bez zvýšenia verzie v poli `schema` – interná AI sa na
// ňu spolieha. Nové polia pridávať len ako nepovinné.
export const ORDER_SCHEMA_VERSION = 'vitapro.order.v1'

export type OrderPayload = {
  schema: typeof ORDER_SCHEMA_VERSION
  order_number: string
  created_at: string
  customer: OrderCustomer
  delivery: {
    address: OrderDeliveryAddress
    requested_date: string | null
  }
  items: { line: number; sku: string; name: string; quantity: number; unit: 'ks' }[]
  totals: { units: number; crates: number; crate_size: number }
  /** Prepravky ako samostatná položka interného systému (nepovinné, pridané vo v1). */
  packaging?: { sku: string; name: string; quantity: number; unit: 'ks' }
  note: string | null
}

export type OrderPayloadInput = {
  orderNumber: string
  createdAt: string
  customer: OrderCustomer
  delivery: OrderDeliveryAddress
  requestedDate: string | null
  note: string
  crateSize: number
  items: { sku: string; name: string; quantity: number }[]
  crate?: { sku: string; name: string }
}

export function buildOrderPayload(input: OrderPayloadInput): OrderPayload {
  const units = input.items.reduce((sum, i) => sum + i.quantity, 0)
  return {
    schema: ORDER_SCHEMA_VERSION,
    order_number: input.orderNumber,
    created_at: input.createdAt,
    customer: input.customer,
    delivery: { address: input.delivery, requested_date: input.requestedDate },
    items: input.items.map((i, idx) => ({ line: idx + 1, sku: i.sku, name: i.name, quantity: i.quantity, unit: 'ks' })),
    totals: { units, crates: Math.floor(units / input.crateSize), crate_size: input.crateSize },
    ...(input.crate?.sku
      ? { packaging: { sku: input.crate.sku, name: input.crate.name, quantity: Math.floor(units / input.crateSize), unit: 'ks' as const } }
      : {}),
    note: input.note.trim() ? input.note.trim() : null,
  }
}
