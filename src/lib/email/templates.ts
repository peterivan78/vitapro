import type { OrderPayload } from '@/lib/orders/orderPayload'
import type { OrderDeliveryAddress } from '@/lib/types'
import { cratesLabel } from '@/lib/crates'

export type EmailContent = { subject: string; html: string; text: string }

export const JSON_BEGIN = '----- BEGIN VITAPRO ORDER JSON -----'
export const JSON_END = '----- END VITAPRO ORDER JSON -----'

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Hlavičky emailu nesmú obsahovať zalomenia riadkov. */
export function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

export function formatDateSk(iso: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${Number(d)}. ${Number(m)}. ${y}`
}

export function formatDateTimeSk(iso: string): string {
  return new Intl.DateTimeFormat('sk-SK', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Bratislava',
  }).format(new Date(iso))
}

function addressLines(a: OrderDeliveryAddress): string[] {
  return [
    a.company,
    a.street,
    `${a.zip} ${a.city}`.trim(),
    a.country,
    a.contact_name ? `Kontakt: ${a.contact_name}${a.contact_phone ? `, ${a.contact_phone}` : ''}` : a.contact_phone,
    a.note ? `Poznámka k adrese: ${a.note}` : '',
  ].filter(Boolean)
}

function layout(title: string, body: string): string {
  return `<!doctype html><html lang="sk"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:#f5f1ea;font-family:Helvetica,Arial,sans-serif;color:#1d1b1a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1ea;padding:32px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:6px">
<tr><td style="padding:32px 32px 8px;font-family:Georgia,serif;font-size:24px;letter-spacing:4px">VITAPRO</td></tr>
<tr><td style="padding:8px 32px 32px;font-size:15px;line-height:1.55">${body}</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #ece6dc;font-size:12px;color:#6f6a63">
AQUA PRO EUROPE, a.s. · Pod furčou 7 · 040 01 Košice</td></tr>
</table></td></tr></table></body></html>`
}

function itemsTableHtml(p: OrderPayload): string {
  const rows = p.items
    .map(
      (i) => `<tr>
<td style="padding:8px 0;border-bottom:1px solid #ece6dc">${escapeHtml(i.name)}<br><span style="color:#8a847b;font-size:12px">${escapeHtml(i.sku)}</span></td>
<td style="padding:8px 0;border-bottom:1px solid #ece6dc;text-align:right;white-space:nowrap">${i.quantity} ks</td></tr>`,
    )
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin:16px 0">
${rows}
<tr><td style="padding:10px 0;font-weight:bold">Spolu</td>
<td style="padding:10px 0;text-align:right;font-weight:bold;white-space:nowrap">${p.totals.units} ks · ${cratesLabel(p.totals.crates)}</td></tr>
</table>`
}

function itemsText(p: OrderPayload): string {
  return p.items.map((i) => `  ${i.line}. ${i.name} [${i.sku}] – ${i.quantity} ks`).join('\n')
}

// ---------------------------------------------------------------------------
// Potvrdenie pre zákazníka
// ---------------------------------------------------------------------------
export type CancelLink = { url: string; deadline: string }

export function customerConfirmationEmail(p: OrderPayload, cancel?: CancelLink): EmailContent {
  const subject = `Prijali sme vašu objednávku ${p.order_number} – VITAPRO`
  const delivery = addressLines(p.delivery.address)
  const html = layout(
    subject,
    `<p>Dobrý deň${p.customer.contact_name ? `, ${escapeHtml(p.customer.contact_name)}` : ''},</p>
<p>ďakujeme, vašu objednávku <strong>${escapeHtml(p.order_number)}</strong> sme prijali.
Obchodné oddelenie ju spracuje a ozve sa vám s termínom dodania.</p>
${itemsTableHtml(p)}
<p style="margin:20px 0 4px;font-weight:bold">Dodacia adresa</p>
<p style="margin:0">${delivery.map(escapeHtml).join('<br>')}</p>
<p style="margin:16px 0 0"><strong>Požadovaný termín:</strong> ${formatDateSk(p.delivery.requested_date)}</p>
${p.note ? `<p style="margin:8px 0 0"><strong>Poznámka:</strong> ${escapeHtml(p.note)}</p>` : ''}
<p style="margin:24px 0 0;color:#6f6a63;font-size:13px">Ak potrebujete objednávku zmeniť, odpovedzte na tento email.</p>
${cancel ? cancelBlockHtml(cancel) : ''}`,
  )
  const text = `Dobrý deň,

ďakujeme, vašu objednávku ${p.order_number} sme prijali. Obchodné oddelenie ju spracuje a ozve sa vám s termínom dodania.

Položky:
${itemsText(p)}
Spolu: ${p.totals.units} ks (${cratesLabel(p.totals.crates)})

Dodacia adresa:
${delivery.join('\n')}

Požadovaný termín: ${formatDateSk(p.delivery.requested_date)}
${p.note ? `Poznámka: ${p.note}\n` : ''}
Ak potrebujete objednávku zmeniť, odpovedzte na tento email.
${cancel ? `\nTúto objednávku ste nezadali vy? Zrušiť ju môžete do ${formatDateTimeSk(cancel.deadline)}:\n${cancel.url}\n` : ''}
AQUA PRO EUROPE, a.s.`
  return { subject, html, text }
}

// ---------------------------------------------------------------------------
// Interná objednávka (pre obchod + internú AI)
// ---------------------------------------------------------------------------
export function internalOrderSubject(p: OrderPayload): string {
  return `[OBJEDNÁVKA] ${p.order_number} | ${oneLine(p.customer.company_name)} | IČO ${oneLine(p.customer.ico)} | ${p.totals.units} ks`
}

export function internalOrderEmail(p: OrderPayload): EmailContent {
  const subject = internalOrderSubject(p)
  const c = p.customer
  const json = JSON.stringify(p, null, 2)
  const customerRows: [string, string][] = [
    ['Firma', c.company_name],
    ['IČO', c.ico],
    ['DIČ', c.dic || '—'],
    ['IČ DPH', c.ic_dph || '—'],
    ['Kontakt', c.contact_name],
    ['Email', c.email],
    ['Telefón', c.phone || '—'],
    ['Fakturačná adresa', `${c.billing_address.street}, ${c.billing_address.zip} ${c.billing_address.city}, ${c.billing_address.country}`],
  ]
  const html = layout(
    subject,
    `<p style="font-size:18px;margin:0 0 4px"><strong>Nová objednávka ${escapeHtml(p.order_number)}</strong></p>
<p style="margin:0;color:#6f6a63">${escapeHtml(formatDateTimeSk(p.created_at))}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;margin:16px 0">
${customerRows
  .map(([k, v]) => `<tr><td style="padding:3px 16px 3px 0;color:#6f6a63">${k}</td><td style="padding:3px 0">${escapeHtml(v)}</td></tr>`)
  .join('')}
</table>
${itemsTableHtml(p)}
<p style="margin:16px 0 4px;font-weight:bold">Dodacia adresa${p.delivery.address.label ? ` (${escapeHtml(p.delivery.address.label)})` : ''}</p>
<p style="margin:0">${addressLines(p.delivery.address).map(escapeHtml).join('<br>')}</p>
<p style="margin:16px 0 0"><strong>Požadovaný termín:</strong> ${formatDateSk(p.delivery.requested_date)}</p>
<p style="margin:8px 0 0"><strong>Poznámka:</strong> ${p.note ? escapeHtml(p.note) : '—'}</p>
<p style="margin:24px 0 4px;color:#6f6a63;font-size:12px">Strojovo čitateľná verzia (rovnaká ako príloha objednavka-${escapeHtml(p.order_number)}.json):</p>
<pre style="white-space:pre-wrap;font-size:11px;background:#f5f1ea;padding:12px;border-radius:4px">${escapeHtml(json)}</pre>`,
  )
  const text = `NOVÁ OBJEDNÁVKA ${p.order_number}
Vytvorená: ${formatDateTimeSk(p.created_at)}

ODBERATEĽ
${customerRows.map(([k, v]) => `${k}: ${v}`).join('\n')}

POLOŽKY
${itemsText(p)}
SPOLU: ${p.totals.units} ks (${cratesLabel(p.totals.crates)} po ${p.totals.crate_size} ks)

DODACIA ADRESA${p.delivery.address.label ? ` (${p.delivery.address.label})` : ''}
${addressLines(p.delivery.address).join('\n')}

Požadovaný termín: ${formatDateSk(p.delivery.requested_date)}
Poznámka: ${p.note ?? '—'}

${JSON_BEGIN}
${json}
${JSON_END}
`
  return { subject, html, text }
}

// ---------------------------------------------------------------------------
// Registrácie
// ---------------------------------------------------------------------------
export function registrationNotifyEmail(r: {
  company_name: string
  ico: string
  contact_name: string
  email: string
  phone: string
  ico_known: boolean
  adminUrl: string
}): EmailContent {
  const subject = `[REGISTRÁCIA] ${oneLine(r.company_name)} | IČO ${oneLine(r.ico)}${r.ico_known ? ' | známy klient' : ''}`
  const lines = [
    `Firma: ${r.company_name}`,
    `IČO: ${r.ico} ${r.ico_known ? '(je v zozname klientov)' : '(NIE JE v zozname klientov)'}`,
    `Kontakt: ${r.contact_name}`,
    `Email: ${r.email}`,
    `Telefón: ${r.phone || '—'}`,
  ]
  const html = layout(
    subject,
    `<p><strong>Nová registrácia čaká na schválenie.</strong></p>
<p>${lines.map(escapeHtml).join('<br>')}</p>
<p><a href="${escapeHtml(r.adminUrl)}" style="display:inline-block;background:#1d1b1a;color:#fff;padding:10px 18px;border-radius:4px;text-decoration:none">Otvoriť v admine</a></p>`,
  )
  return { subject, html, text: `Nová registrácia čaká na schválenie.\n\n${lines.join('\n')}\n\nAdmin: ${r.adminUrl}` }
}

export function accountApprovedEmail(r: { contact_name: string; siteUrl: string }): EmailContent {
  const subject = 'Váš účet VITAPRO je schválený'
  const html = layout(
    subject,
    `<p>Dobrý deň${r.contact_name ? `, ${escapeHtml(r.contact_name)}` : ''},</p>
<p>váš účet bol schválený. Odteraz môžete objednávať šťavy VITAPRO.</p>
<p><a href="${escapeHtml(r.siteUrl)}" style="display:inline-block;background:#1d1b1a;color:#fff;padding:10px 18px;border-radius:4px;text-decoration:none">Prejsť na objednávku</a></p>`,
  )
  return { subject, html, text: `Dobrý deň,\n\nváš účet bol schválený. Odteraz môžete objednávať šťavy VITAPRO.\n\n${r.siteUrl}` }
}

function cancelBlockHtml({ url, deadline }: CancelLink): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-top:1px solid #ece6dc">
<tr><td style="padding-top:20px;font-size:13px;color:#6f6a63">
<strong style="color:#1d1b1a">Túto objednávku ste nezadali vy?</strong><br>
Zrušiť ju môžete do <strong>${escapeHtml(formatDateTimeSk(deadline))}</strong> a zmeňte si heslo.<br>
<a href="${escapeHtml(url)}" style="display:inline-block;margin-top:12px;border:1px solid #b3261e;color:#b3261e;padding:8px 16px;border-radius:4px;text-decoration:none">Zrušiť objednávku</a>
</td></tr></table>`
}

// ---------------------------------------------------------------------------
// Zrušenie objednávky
// ---------------------------------------------------------------------------
export const CANCEL_SCHEMA_VERSION = 'vitapro.order-cancellation.v1'

export type CancellationInfo = {
  order_number: string
  company_name: string
  ico: string
  email: string
  cancelled_at: string
  via: 'email' | 'account' | 'admin'
}

const VIA_LABEL: Record<CancellationInfo['via'], string> = {
  email: 'odkazom z potvrdzovacieho emailu',
  account: 'v zákazníckom účte',
  admin: 'v administrácii',
}

export function internalCancellationEmail(c: CancellationInfo): EmailContent {
  const subject = `[ZRUŠENÁ] ${c.order_number} | ${oneLine(c.company_name)} | IČO ${oneLine(c.ico)}`
  const json = JSON.stringify({ schema: CANCEL_SCHEMA_VERSION, ...c }, null, 2)
  const html = layout(
    subject,
    `<p style="font-size:18px;margin:0 0 4px;color:#b3261e"><strong>Objednávka ${escapeHtml(c.order_number)} bola zrušená</strong></p>
<p>Zákazník ${escapeHtml(c.company_name)} (IČO ${escapeHtml(c.ico)}) ju zrušil ${VIA_LABEL[c.via]} – ${escapeHtml(formatDateTimeSk(c.cancelled_at))}.</p>
<p><strong>Objednávku nespracúvajte.</strong> Ak už bola naimportovaná, zrušte ju aj v internom systéme.</p>
<pre style="white-space:pre-wrap;font-size:11px;background:#f5f1ea;padding:12px;border-radius:4px">${escapeHtml(json)}</pre>`,
  )
  const text = `ZRUŠENÁ OBJEDNÁVKA ${c.order_number}
Zákazník: ${c.company_name} (IČO ${c.ico})
Zrušená ${VIA_LABEL[c.via]}: ${formatDateTimeSk(c.cancelled_at)}

Objednávku nespracúvajte. Ak už bola naimportovaná, zrušte ju aj v internom systéme.

${JSON_BEGIN}
${json}
${JSON_END}
`
  return { subject, html, text }
}

export function customerCancellationEmail(c: CancellationInfo): EmailContent {
  const subject = `Objednávka ${c.order_number} bola zrušená – VITAPRO`
  const html = layout(
    subject,
    `<p>Dobrý deň,</p>
<p>objednávka <strong>${escapeHtml(c.order_number)}</strong> bola zrušená a nebude spracovaná.</p>
<p style="color:#6f6a63;font-size:13px">Ak ste ju nezadali vy, odporúčame zmeniť si heslo a kontaktovať obchodné oddelenie.</p>`,
  )
  const text = `Dobrý deň,

objednávka ${c.order_number} bola zrušená a nebude spracovaná.

Ak ste ju nezadali vy, odporúčame zmeniť si heslo a kontaktovať obchodné oddelenie.

AQUA PRO EUROPE, a.s.`
  return { subject, html, text }
}
