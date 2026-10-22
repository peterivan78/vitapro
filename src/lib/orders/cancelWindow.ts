/** Do kedy sa dá objednávka zrušiť; null = zrušenie vypnuté. */
export function cancelDeadline(createdAt: string, windowMinutes: number): Date | null {
  if (windowMinutes <= 0) return null
  return new Date(new Date(createdAt).getTime() + windowMinutes * 60_000)
}

export function isWithinCancelWindow(createdAt: string, windowMinutes: number, now = new Date()): boolean {
  const deadline = cancelDeadline(createdAt, windowMinutes)
  return deadline !== null && now < deadline
}
