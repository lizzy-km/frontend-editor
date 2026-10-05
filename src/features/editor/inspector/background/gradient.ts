/**
 * A CSS gradient as something the panel can edit: kind, direction or
 * centre, and 2–5 colour stops. Anything it can't represent exactly
 * (px stops, colour hints, size keywords we don't know) parses to null,
 * so the panel never rewrites a gradient it doesn't understand.
 */
export type GradientKind = 'linear' | 'radial' | 'conic'
export type GradientStop = { color: string; at: number }
export type Gradient = {
  kind: GradientKind
  /** Degrees, for straight (linear) and sweep (conic) gradients. */
  angle: number
  /** Round (radial) gradients: circle or ellipse. */
  shape: 'circle' | 'ellipse'
  /** Centre for round and sweep gradients, as "x% y%". */
  center: string
  stops: GradientStop[]
}

export const MAX_STOPS = 5

/** Splits on commas that are not inside brackets: "a, rgb(1, 2, 3)" -> ["a", "rgb(1, 2, 3)"]. */
export function splitTopLevel(text: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '(') depth++
    else if (char === ')') depth--
    else if (char === ',' && depth === 0) {
      parts.push(text.slice(start, i).trim())
      start = i + 1
    }
  }
  parts.push(text.slice(start).trim())
  return parts.filter(Boolean)
}

const SIDES: Record<string, number> = {
  'to top': 0, 'to top right': 45, 'to right top': 45, 'to right': 90, 'to bottom right': 135, 'to right bottom': 135,
  'to bottom': 180, 'to bottom left': 225, 'to left bottom': 225, 'to left': 270, 'to top left': 315, 'to left top': 315,
}
const UNIT_TO_DEG: Record<string, number> = { deg: 1, turn: 360, rad: 180 / Math.PI, grad: 0.9 }
const KEYWORD_PCT: Record<string, string> = { left: '0%', top: '0%', center: '50%', right: '100%', bottom: '100%' }

/** "45deg" / "0.25turn" -> degrees, or null. */
function toDegrees(text: string): number | null {
  const match = text.trim().match(/^(-?[\d.]+)(deg|turn|rad|grad)$/)
  return match ? Math.round(Number(match[1]) * UNIT_TO_DEG[match[2]!]!) % 360 : null
}

/** "center" / "left top" / "30% 70%" -> "x% y%", or null. */
export function toCenter(text: string): string | null {
  const words = text.trim().split(/\s+/)
  if (words.length === 1 && words[0] === 'center') return '50% 50%'
  const pct = words.map((word) => (word.endsWith('%') ? word : KEYWORD_PCT[word]))
  if (pct.length !== 2 || pct.some((value) => !value)) return null
  // "top left" means y first: put x first.
  const swapped = ['top', 'bottom'].includes(words[0]!) || ['left', 'right'].includes(words[1]!)
  return swapped ? `${pct[1]} ${pct[0]}` : `${pct[0]} ${pct[1]}`
}

/** The setup part of a gradient ("to right", "circle at center", "from 90deg at 50% 50%"), if the first argument is one. */
function readSetup(gradient: Gradient, first: string): boolean | null {
  const text = first.trim().toLowerCase()
  if (gradient.kind === 'linear') {
    const angle = SIDES[text] ?? toDegrees(text)
    if (angle !== null) gradient.angle = angle
    return angle === null ? (text.startsWith('to ') ? null : false) : true
  }
  if (!/^(circle|ellipse|at |from |closest|farthest)/.test(text)) return false
  const [before, at] = text.split(/\s*\bat\b\s*/)
  if (at !== undefined) {
    const center = toCenter(at)
    if (!center) return null
    gradient.center = center
  }
  const words = (before ?? '').split(/\s+/).filter(Boolean)
  if (gradient.kind === 'radial') {
    if (words.some((word) => !['circle', 'ellipse', 'farthest-corner'].includes(word))) return null
    gradient.shape = words.includes('circle') ? 'circle' : 'ellipse'
  } else if (words.length) {
    if (words[0] !== 'from' || words.length !== 2) return null
    const angle = toDegrees(words[1]!)
    if (angle === null) return null
    gradient.angle = angle
  }
  return true
}

/** "rgb(0, 0, 0) 40%" -> stop; positions may be missing (spread evenly later). */
function readStop(text: string): { color: string; at: number | null } | null {
  const match = text.trim().match(/^(.*?)(?:\s+(-?[\d.]+)%)?$/)
  const color = match?.[1]?.trim()
  if (!color || /\s-?[\d.]+(px|em|rem)$/.test(text.trim()) || /^-?[\d.]+%$/.test(color)) return null
  return { color, at: match?.[2] !== undefined ? Number(match[2]) : null }
}

/** Parses one gradient (linear/radial/conic-gradient(…)), or null if it isn't one we can edit exactly. */
export function parseGradient(text: string): Gradient | null {
  const match = text.trim().match(/^(linear|radial|conic)-gradient\(([\s\S]*)\)$/i)
  if (!match) return null
  const gradient: Gradient = { kind: match[1]!.toLowerCase() as GradientKind, angle: 180, shape: 'ellipse', center: '50% 50%', stops: [] }
  if (gradient.kind === 'conic') gradient.angle = 0
  const args = splitTopLevel(match[2]!)
  const setup = readSetup(gradient, args[0] ?? '')
  if (setup === null) return null
  const raw = (setup ? args.slice(1) : args).map(readStop)
  if (raw.length < 2 || raw.some((stop) => stop === null)) return null
  gradient.stops = raw.map((stop, index) => ({ color: stop!.color, at: stop!.at ?? Math.round((index / (raw.length - 1)) * 100) }))
  return gradient
}

/** The gradient as CSS. */
export function gradientCss(gradient: Gradient): string {
  const stops = gradient.stops.map((stop) => `${stop.color} ${Math.round(stop.at)}%`).join(', ')
  if (gradient.kind === 'linear') return `linear-gradient(${gradient.angle}deg, ${stops})`
  if (gradient.kind === 'radial') return `radial-gradient(${gradient.shape} at ${gradient.center}, ${stops})`
  return `conic-gradient(from ${gradient.angle}deg at ${gradient.center}, ${stops})`
}
