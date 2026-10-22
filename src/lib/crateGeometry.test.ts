import { CELLS, depth, project } from './crateGeometry'

describe('crate projection', () => {
  it('matches the drawing at the top rim corners (mm, ±0.1)', () => {
    // Body odčítané z public/img/prepravka.svg.
    const near = project(-142, -107, 168)
    expect(near[0]).toBeCloseTo(125.67, 1)
    expect(near[1]).toBeCloseTo(160.7, 1)
    const back = project(142, 107, 168)
    expect(back[0]).toBeCloseTo(235.57, 1)
    expect(back[1]).toBeCloseTo(1.93, 1)
  })

  it('orders the 12 cells from farthest to nearest', () => {
    expect(CELLS).toHaveLength(12)
    expect(CELLS[0]).toEqual([105, 70])
    expect(CELLS[11]).toEqual([-105, -70])
    for (let i = 1; i < CELLS.length; i++) {
      expect(depth(...CELLS[i - 1])).toBeGreaterThanOrEqual(depth(...CELLS[i]))
    }
  })
})
