/** Small color helpers shared by the settings panel and exports. */

/** "rgb(12, 34, 56)" / "rgba(...)" / "#abc" -> "#0c2238" for <input type="color">. */
export function toHexColor(value: string): string {
  const hex = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    const digits = hex[1]!
    return digits.length === 3 ? `#${[...digits].map((d) => d + d).join('')}` : `#${digits}`
  }
  const rgb = value.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i)
  if (!rgb) return '#000000'
  return `#${rgb.slice(1, 4).map((part) => Number(part).toString(16).padStart(2, '0')).join('')}`
}

/** True for fully transparent colors ("transparent", "rgba(0, 0, 0, 0)"). */
export function isTransparent(value: string): boolean {
  return value === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(value.replace(/\s+/g, ' ')) || /\/\s*0\)$/.test(value)
}

/** How solid a color is: 1 = solid, 0 = invisible ("rgba(0,0,0,0.4)" -> 0.4, "#ff000080" -> 0.5). */
export function alphaOf(value: string): number {
  const text = value.trim()
  if (text === 'transparent') return 0
  const rgba = text.match(/rgba?\([^)]*?[,/]\s*([\d.]+%?)\s*\)$/i)
  if (rgba && /rgba?\([^,/]*[, ][^,/]*[, ][^,/]*[,/]/.test(text)) {
    const raw = rgba[1]!
    return Math.min(1, raw.endsWith('%') ? Number(raw.slice(0, -1)) / 100 : Number(raw))
  }
  const hex = text.match(/^#[0-9a-f]{6}([0-9a-f]{2})$/i)
  return hex ? Math.round((parseInt(hex[1]!, 16) / 255) * 100) / 100 : 1
}

/** The same color with a new solidness (0–1). Solid colors come back as #hex. */
export function withAlpha(value: string, alpha: number): string {
  const hex = toHexColor(value)
  if (alpha >= 1) return hex
  const [r, g, b] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16))
  return `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 100) / 100})`
}
