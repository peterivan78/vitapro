import { cancelDeadline, isWithinCancelWindow } from './cancelWindow'

describe('cancel window', () => {
  const created = '2026-10-22T10:00:00.000Z'

  it('allows cancelling only before the deadline', () => {
    expect(isWithinCancelWindow(created, 120, new Date('2026-10-22T11:59:00Z'))).toBe(true)
    expect(isWithinCancelWindow(created, 120, new Date('2026-10-22T12:00:00Z'))).toBe(false)
    expect(isWithinCancelWindow(created, 120, new Date('2026-10-24T10:00:00Z'))).toBe(false)
  })

  it('treats 0 minutes as cancellation disabled', () => {
    expect(cancelDeadline(created, 0)).toBeNull()
    expect(isWithinCancelWindow(created, 0, new Date(created))).toBe(false)
  })
})
