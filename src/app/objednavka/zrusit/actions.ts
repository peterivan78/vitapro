'use server'

import { redirect } from 'next/navigation'
import { cancelOrder } from '@/lib/orders/cancelOrder'
import { hashCancelToken, isWellFormedCancelToken } from '@/lib/orders/cancelToken'

export async function cancelByTokenAction(formData: FormData) {
  const token = formData.get('t')
  if (!isWellFormedCancelToken(token)) redirect('/objednavka/zrusit?stav=neplatny')
  const result = await cancelOrder({ cancelTokenHash: hashCancelToken(token) }, 'email')
  if (result.ok) redirect(`/objednavka/zrusit?stav=zrusena&c=${encodeURIComponent(result.orderNumber)}`)
  redirect(`/objednavka/zrusit?stav=${result.reason === 'in_progress' ? 'spracuva-sa' : 'neplatny'}`)
}
