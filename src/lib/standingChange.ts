// Zákazník práve upravuje existujúcu pravidelnú dodávku (klikol „Zmeniť“
// v Môj účet). Uložené v prehliadači; server pri odoslaní overí, že
// pôvodná dodávka patrí zákazníkovi a je stále aktívna.
const KEY = 'vitapro-standing-change-v1'

export type StandingChange = { orderId: string; orderNumber: string }

export function readStandingChange(): StandingChange | null {
  try {
    const raw = window.localStorage.getItem(KEY)
    const v = raw ? (JSON.parse(raw) as Partial<StandingChange>) : null
    return v && typeof v.orderId === 'string' && typeof v.orderNumber === 'string' ? { orderId: v.orderId, orderNumber: v.orderNumber } : null
  } catch {
    return null
  }
}

export function writeStandingChange(v: StandingChange | null) {
  try {
    if (v) window.localStorage.setItem(KEY, JSON.stringify(v))
    else window.localStorage.removeItem(KEY)
  } catch {
    // Súkromné okno – zmena sa odošle ako nová pravidelná dodávka.
  }
}
