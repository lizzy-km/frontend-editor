/** Helpers to read/write CSS values in controls. */

/** "16px" -> { number: 16, unit: 'px' }; "auto" -> { number: null, unit: 'auto' } */
export function splitUnit(value: string): { number: number | null; unit: string } {
  const match = value.trim().match(/^(-?\d*\.?\d+)([a-z%]*)$/i)
  if (!match) return { number: null, unit: value.trim() }
  return { number: Number(match[1]), unit: match[2] ?? '' }
}

/** Rounds long computed numbers ("15.9999px") for display. */
export function roundNumber(value: number, digits = 2): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

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
