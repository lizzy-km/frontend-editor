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

export { isTransparent, toHexColor } from '@/lib/color'
