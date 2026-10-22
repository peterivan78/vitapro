import { CELLS, CRATE_VIEWBOX, frontClipPolygon, frustum } from '@/lib/crateGeometry'

export type CrateSlot = { key: string; color: string } | null

const CLIP = frontClipPolygon()

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
  const ch = (shift: number) => {
    const v = (n >> shift) & 255
    const out = amount < 0 ? v * (1 + amount) : v + (255 - v) * amount
    return Math.round(out).toString(16).padStart(2, '0')
  }
  return `#${ch(16)}${ch(8)}${ch(0)}`
}

const INK = '#3a3026'
const GLASS = '#fbf8f3'

function Bottle({ x, y, color }: { x: number; y: number; color: string }) {
  // Fľaša 0,33 l (mm): telo Ø56, hrdlo Ø36, uzáver Ø40. Šťava siaha po hrdlo.
  const body = frustum(x, y, 60, 146, 28, 28)
  const shoulder = frustum(x, y, 146, 164, 28, 18)
  const neck = frustum(x, y, 164, 174, 18, 18)
  const cap = frustum(x, y, 174, 187, 20, 20)
  const line = { stroke: INK, strokeWidth: 0.6, strokeLinejoin: 'round' as const }
  return (
    <>
      <path d={body.side} fill={shade(color, -0.12)} {...line} />
      <path d={shoulder.side} fill={color} {...line} />
      <path d={neck.side} fill={GLASS} {...line} />
      <path d={cap.side} fill="#25211e" {...line} />
      <ellipse {...cap.top} fill="#3d3833" {...line} />
      {/* odlesk skla */}
      <path d={`M${body.top.cx - 17},${body.top.cy + 4} l0,22`} stroke="#ffffff" strokeOpacity={0.45} strokeWidth={2.2} strokeLinecap="round" />
    </>
  )
}

/**
 * Ilustrácia prepravky, ktorá sa plní fľašami v farbách štiav.
 * `slots` – max. 12 položiek v poradí plnenia (od zadnej priehradky).
 */
export function CrateFill({
  slots,
  size = 'lg',
  className = '',
  label,
}: {
  slots: CrateSlot[]
  size?: 'sm' | 'lg'
  className?: string
  label: string
}) {
  const { width, height } = CRATE_VIEWBOX
  const clipId = `crate-clip-${size}`
  return (
    <div role="img" aria-label={label} className={`relative ${className}`} style={{ aspectRatio: `${width} / ${height}` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={size === 'sm' ? '/img/prepravka-sm.svg' : '/img/prepravka.svg'} alt="" className="absolute inset-0 h-full w-full" draggable={false} />
      <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <clipPath id={clipId}>
            <polygon points={CLIP} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          {CELLS.map(([x, y], i) => {
            const slot = slots[i]
            if (!slot) return null
            return (
              <g key={`${i}-${slot.key}`} className="crate-drop" style={{ animationDelay: `${(i % 4) * 25}ms` }}>
                <Bottle x={x} y={y} color={slot.color} />
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
