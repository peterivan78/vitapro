/** Zajtrajší dátum (YYYY-MM-DD) podľa slovenského času. */
export function tomorrowInBratislava(now = new Date()): string {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Bratislava' }).format(now)
  const d = new Date(`${today}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}
