import { buildOrderPayload } from '@/lib/orders/orderPayload'
import {
  JSON_BEGIN,
  JSON_END,
  customerConfirmationEmail,
  escapeHtml,
  formatDateSk,
  internalCancellationEmail,
  internalOrderEmail,
} from './templates'

const payload = buildOrderPayload({
  orderNumber: 'OBJ-2026-00042',
  createdAt: '2026-10-22T08:30:00.000Z',
  customer: {
    customer_id: 'u1',
    company_name: 'Bistro <Jablko> s.r.o.',
    ico: '12345678',
    dic: '2020123456',
    ic_dph: '',
    contact_name: 'Jana Nováková',
    email: 'jana@example.sk',
    phone: '+421 900 000 000',
    billing_address: { street: 'Hlavná 1', city: 'Košice', zip: '040 01', country: 'Slovensko' },
  },
  delivery: {
    address_id: 'a1',
    label: 'Prevádzka centrum',
    company: 'Bistro Jablko',
    street: 'Hlavná 1',
    city: 'Košice',
    zip: '040 01',
    country: 'Slovensko',
    contact_name: 'Peter',
    contact_phone: '',
    note: '',
  },
  requestedDate: '2026-11-03',
  note: '  ',
  crateSize: 12,
  items: [
    { sku: 'VP-CVIKLA-033', name: 'Cvikla', quantity: 18 },
    { sku: 'VP-DULA-033', name: 'Dulienka', quantity: 6 },
  ],
})

describe('buildOrderPayload', () => {
  it('numbers lines, totals units and crates, and drops a blank note', () => {
    expect(payload.schema).toBe('vitapro.order.v1')
    expect(payload.items.map((i) => i.line)).toEqual([1, 2])
    expect(payload.totals).toEqual({ units: 24, crates: 2, crate_size: 12 })
    expect(payload.note).toBeNull()
  })
})

describe('internalOrderEmail', () => {
  const email = internalOrderEmail(payload)

  it('puts the key identifiers in the subject', () => {
    expect(email.subject).toBe('[OBJEDNÁVKA] OBJ-2026-00042 | Bistro <Jablko> s.r.o. | IČO 12345678 | 24 ks')
  })

  it('embeds the exact JSON payload between markers in the text body', () => {
    const start = email.text.indexOf(JSON_BEGIN) + JSON_BEGIN.length
    const end = email.text.indexOf(JSON_END)
    expect(JSON.parse(email.text.slice(start, end))).toEqual(payload)
  })

  it('escapes customer-provided text in HTML', () => {
    expect(email.html).toContain('Bistro &lt;Jablko&gt; s.r.o.')
    expect(email.html).not.toContain('<Jablko>')
  })
})

describe('customerConfirmationEmail', () => {
  it('lists items and the requested date', () => {
    const email = customerConfirmationEmail(payload)
    expect(email.text).toContain('1. Cvikla [VP-CVIKLA-033] – 18 ks')
    expect(email.text).toContain('Spolu: 24 ks (2 prepravky)')
    expect(email.text).toContain('Požadovaný termín: 3. 11. 2026')
  })
})

describe('helpers', () => {
  it('formats dates and escapes HTML', () => {
    expect(formatDateSk(null)).toBe('—')
    expect(escapeHtml(`"a" & 'b'`)).toBe('&quot;a&quot; &amp; &#39;b&#39;')
  })
})

describe('cancellation', () => {
  it('adds a cancel button only when a link is given', () => {
    expect(customerConfirmationEmail(payload).html).not.toContain('Zrušiť objednávku')
    const withLink = customerConfirmationEmail(payload, 'https://web.sk/objednavka/zrusit?t=abc')
    expect(withLink.html).toContain('href="https://web.sk/objednavka/zrusit?t=abc"')
    expect(withLink.text).toContain('https://web.sk/objednavka/zrusit?t=abc')
  })

  it('tells sales not to process a cancelled order, with machine-readable JSON', () => {
    const email = internalCancellationEmail({
      order_number: 'OBJ-2026-00042',
      company_name: 'Bistro s.r.o.',
      ico: '12345678',
      email: 'jana@example.sk',
      cancelled_at: '2026-10-22T09:00:00.000Z',
      via: 'email',
    })
    expect(email.subject).toBe('[ZRUŠENÁ] OBJ-2026-00042 | Bistro s.r.o. | IČO 12345678')
    const json = email.text.slice(email.text.indexOf(JSON_BEGIN) + JSON_BEGIN.length, email.text.indexOf(JSON_END))
    expect(JSON.parse(json)).toMatchObject({ schema: 'vitapro.order-cancellation.v1', order_number: 'OBJ-2026-00042', via: 'email' })
  })
})
