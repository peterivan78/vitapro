// Geometria ilustrácie prepravky (public/img/prepravka.svg).
//
// SVG je pravouhlý priemet 3D modelu prepravky (284 × 214 × 168 mm, 4 × 3
// priehradky). Uhly a posun sme dopočítali spätne z 3D modelu tak, aby
// priemet sedel na kresbu s presnosťou ~0,02 mm. Jednotka SVG = 1 mm.
// Vďaka tomu sa fľaše dajú kresliť priamo v 3D súradniciach priehradok.

export const CRATE_VIEWBOX = { width: 361.24, height: 313.06 }

const AZIMUTH = (35 * Math.PI) / 180
const ELEVATION = (28 * Math.PI) / 180
const OFFSET_X = 180.62
const OFFSET_Y = 229.65

export const SIN_E = Math.sin(ELEVATION)
export const COS_E = Math.cos(ELEVATION)

/** Hĺbka bodu od pozorovateľa – väčšie = ďalej (kreslí sa skôr). */
export function depth(x: number, y: number): number {
  return x * Math.sin(AZIMUTH) + y * Math.cos(AZIMUTH)
}

export function project(x: number, y: number, z: number): [number, number] {
  const px = x * Math.cos(AZIMUTH) - y * Math.sin(AZIMUTH)
  return [px + OFFSET_X, -(depth(x, y) * SIN_E + z * COS_E) + OFFSET_Y]
}

/** Stredy 12 priehradiek (priečky sú na x = −70/0/70, y = ±35), zoradené od najvzdialenejšej. */
export const CELLS: [number, number][] = [-105, -35, 35, 105]
  .flatMap((x) => [-70, 0, 70].map((y) => [x, y] as [number, number]))
  .sort((a, b) => depth(b[0], b[1]) - depth(a[0], a[1]))

const RIM_Z = 168

/** Oblasť nad prednými hranami prepravky – časti fliaš pod ňou sú skryté za stenou. */
export function frontClipPolygon(): string {
  const left = project(-142, 107, RIM_Z)
  const front = project(-142, -107, RIM_Z)
  const right = project(142, -107, RIM_Z)
  const lift = 0.6
  return [
    [-40, -80],
    [-40, left[1] - lift - 25],
    [left[0], left[1] - lift],
    [front[0], front[1] - lift],
    [right[0], right[1] - lift],
    [CRATE_VIEWBOX.width + 40, right[1] - lift - 13],
    [CRATE_VIEWBOX.width + 40, -80],
  ]
    .map((p) => p.map((n) => n.toFixed(2)).join(','))
    .join(' ')
}

/**
 * Plášť zrezaného kužeľa / valca so zvislou osou (r0 dole na z0, r1 hore na z1)
 * + horná podstava. Vracia SVG path pre plášť a parametre hornej elipsy.
 */
export function frustum(cx: number, cy: number, z0: number, z1: number, r0: number, r1: number) {
  const [bx, by] = project(cx, cy, z0)
  const [tx, ty] = project(cx, cy, z1)
  const f = (n: number) => n.toFixed(2)
  const side =
    `M${f(tx - r1)},${f(ty)} L${f(bx - r0)},${f(by)} ` +
    `A${f(r0)},${f(r0 * SIN_E)} 0 0 0 ${f(bx + r0)},${f(by)} ` +
    `L${f(tx + r1)},${f(ty)} Z`
  return { side, top: { cx: tx, cy: ty, rx: r1, ry: r1 * SIN_E } }
}
