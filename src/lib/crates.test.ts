import { clampQuantity, cratesLabel, currentCrateSlots, summarizeCrates, totalUnits, unitsLabel } from './crates'

describe('summarizeCrates', () => {
  it('rejects an empty order', () => {
    expect(summarizeCrates(0)).toMatchObject({ isValid: false, fullCrates: 0, missing: 0 })
  })

  it('accepts exact multiples of the crate size', () => {
    expect(summarizeCrates(24)).toEqual({ units: 24, fullCrates: 2, remainder: 0, missing: 0, isValid: true })
  })

  it('reports how many units are missing to fill the last crate', () => {
    expect(summarizeCrates(30)).toMatchObject({ fullCrates: 2, remainder: 6, missing: 6, isValid: false })
    expect(summarizeCrates(1)).toMatchObject({ fullCrates: 0, missing: 11, isValid: false })
  })

  it('respects a custom crate size', () => {
    expect(summarizeCrates(18, 6)).toMatchObject({ fullCrates: 3, isValid: true })
  })
})

describe('totalUnits', () => {
  it('sums a mixed crate', () => {
    expect(totalUnits([5, 4, 3])).toBe(12)
  })
})

describe('clampQuantity', () => {
  it('floors, clamps negatives and rejects NaN', () => {
    expect(clampQuantity(3.7)).toBe(3)
    expect(clampQuantity(-2)).toBe(0)
    expect(clampQuantity(Number.NaN)).toBe(0)
    expect(clampQuantity(1e9)).toBe(9_996)
  })
})

describe('Slovak plurals', () => {
  it('declines crates and units', () => {
    expect([1, 2, 5].map(cratesLabel)).toEqual(['1 prepravka', '2 prepravky', '5 prepraviek'])
    expect([1, 3, 12].map(unitsLabel)).toEqual(['1 kus', '3 kusy', '12 kusov'])
  })
})

describe('currentCrateSlots', () => {
  const lines = [
    { key: 'a', color: '#111111', quantity: 10 },
    { key: 'b', color: '#222222', quantity: 5 },
  ]

  it('shows the crate being filled after the full ones', () => {
    const r = currentCrateSlots(lines)
    expect(r.completedCrates).toBe(1)
    expect(r.slots.map((s) => s.key)).toEqual(['b', 'b', 'b'])
  })

  it('shows the last full crate when everything fits exactly', () => {
    const r = currentCrateSlots([{ key: 'a', color: '#111111', quantity: 24 }])
    expect(r.completedCrates).toBe(1)
    expect(r.slots).toHaveLength(12)
  })
})
