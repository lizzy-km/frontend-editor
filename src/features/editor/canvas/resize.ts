import { setStyles } from '../actions/styleActions'

/**
 * Applies a resize from the canvas handles. Side handles change one
 * dimension; corner handles change both. Sizes are in page pixels.
 */
export function resizeFromHandle(id: string, anchor: string, width: number, height: number) {
  const changesWidth = anchor.includes('left') || anchor.includes('right')
  const changesHeight = anchor.includes('top') || anchor.includes('bottom')
  const values: Record<string, string> = {}
  if (changesWidth) {
    values.width = `${Math.max(1, Math.round(width))}px`
    values['max-width'] = 'none'
  }
  if (changesHeight) values.height = `${Math.max(1, Math.round(height))}px`
  if (Object.keys(values).length > 0) setStyles(id, values)
}
