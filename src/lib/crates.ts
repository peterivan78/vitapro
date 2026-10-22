export const DEFAULT_CRATE_SIZE = 12
export const MAX_QUANTITY_PER_ITEM = 9_996

export type CrateSummary = {
  units: number
  /** Počet celých prepraviek. */
  fullCrates: number
  /** Koľko kusov chýba do najbližšej plnej prepravky (0 = všetko sedí). */
  missing: number
  /** Kusy v poslednej, neúplnej prepravke. */
  remainder: number
  /** Dá sa objednávka odoslať? */
  isValid: boolean
}

export function totalUnits(quantities: Iterable<number>): number {
  let sum = 0
  for (const q of quantities) sum += q
  return sum
}

export function summarizeCrates(units: number, crateSize = DEFAULT_CRATE_SIZE): CrateSummary {
  const remainder = units % crateSize
  return {
    units,
    fullCrates: Math.floor(units / crateSize),
    remainder,
    missing: remainder === 0 ? 0 : crateSize - remainder,
    isValid: units > 0 && remainder === 0,
  }
}

export function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(MAX_QUANTITY_PER_ITEM, Math.floor(value)))
}

/** „1 prepravka“, „2 prepravky“, „5 prepraviek“. */
export function cratesLabel(n: number): string {
  if (n === 1) return '1 prepravka'
  if (n >= 2 && n <= 4) return `${n} prepravky`
  return `${n} prepraviek`
}

/** „1 kus“, „2 kusy“, „5 kusov“. */
export function unitsLabel(n: number): string {
  if (n === 1) return '1 kus'
  if (n >= 2 && n <= 4) return `${n} kusy`
  return `${n} kusov`
}
