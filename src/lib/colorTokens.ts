/** Finds colors in CSS text and swaps them (hex, rgb(), hsl(), white/black), keeping each one's own transparency. */

export type Rgb = { r: number; g: number; b: number }
export type ColorToken = { text: string; index: number; key: string; alpha: number }

const TOKEN = /(?<!url\()#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![0-9a-z_-])|\brgba?\([^()]*\)|\bhsla?\([^()]*\)|(?<![\w.#-])(?:white|black)(?![\w-])/gi

const hex2 = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
export const hexOfRgb = ({ r, g, b }: Rgb) => `#${hex2(r)}${hex2(g)}${hex2(b)}`

function hslToRgb(h: number, s: number, l: number): Rgb {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 }
}

const part = (text: string, scale: number) => (text.endsWith('%') ? (parseFloat(text) / 100) * scale : parseFloat(text))

/** The color a token means (null: not a plain color, e.g. rgb(var(--x))). */
export function parseColor(text: string): { rgb: Rgb; alpha: number } | null {
  const value = text.trim().toLowerCase()
  if (value === 'white') return { rgb: { r: 255, g: 255, b: 255 }, alpha: 1 }
  if (value === 'black') return { rgb: { r: 0, g: 0, b: 0 }, alpha: 1 }
  const hex = value.match(/^#([0-9a-f]{3,8})$/)
  if (hex) {
    const digits = hex[1]!.length === 3 || hex[1]!.length === 4 ? [...hex[1]!].map((d) => d + d).join('') : hex[1]!
    if (digits.length !== 6 && digits.length !== 8) return null
    const [r, g, b, a] = [0, 2, 4, 6].map((start) => parseInt(digits.slice(start, start + 2), 16))
    return { rgb: { r: r!, g: g!, b: b! }, alpha: digits.length === 8 ? Math.round((a! / 255) * 100) / 100 : 1 }
  }
  const fn = value.match(/^(rgba?|hsla?)\(([^)]*)\)$/)
  if (!fn) return null
  const parts = fn[2]!.split(/[\s,/]+/).filter(Boolean)
  if (parts.length < 3 || parts.length > 4 || parts.some((p) => !/^[\d.+-]/.test(p))) return null
  const alpha = parts[3] === undefined ? 1 : Math.min(1, Math.max(0, part(parts[3], 1)))
  if (fn[1]!.startsWith('rgb')) return { rgb: { r: part(parts[0]!, 255), g: part(parts[1]!, 255), b: part(parts[2]!, 255) }, alpha }
  return { rgb: hslToRgb(((parseFloat(parts[0]!) % 360) + 360) % 360, part(parts[1]!, 1), part(parts[2]!, 1)), alpha }
}

/** Every color in a piece of CSS (a value or a block of declarations), with where it is. Fully transparent ones are skipped. */
export function scanColors(text: string): ColorToken[] {
  const found: ColorToken[] = []
  for (const match of text.matchAll(TOKEN)) {
    const color = parseColor(match[0])
    if (color && color.alpha > 0) found.push({ text: match[0], index: match.index!, key: hexOfRgb(color.rgb), alpha: color.alpha })
  }
  return found
}

/** The same token in a new color, keeping its transparency (solid ones come back as #hex). */
export function recolor(token: ColorToken, toHex: string): string {
  if (token.alpha >= 1) return toHex
  if (/^#/.test(token.text)) return `${toHex}${hex2(token.alpha * 255)}`
  const { r, g, b } = parseColor(toHex)!.rgb
  return `rgba(${r}, ${g}, ${b}, ${token.alpha})`
}

/** `text` with every color equal to `fromKey` (a #hex) changed to `toHex`. */
export function replaceColors(text: string, fromKey: string, toHex: string): string {
  let out = text
  for (const token of scanColors(text).filter((each) => each.key === fromKey).reverse()) {
    out = `${out.slice(0, token.index)}${recolor(token, toHex)}${out.slice(token.index + token.text.length)}`
  }
  return out
}
