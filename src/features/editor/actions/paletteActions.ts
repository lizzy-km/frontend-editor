import { track } from '@/features/analytics/track'
import { replaceColor, setThemeColor } from '../model/palette'
import { updateDoc } from './commit'

/** Changes a color everywhere (page CSS, every element and screen size, SVG paint). Pass the same coalesceKey while dragging a picker: one undo step. */
export function changeColor(fromKey: string, toHex: string, coalesceKey?: string) {
  updateDoc((doc) => replaceColor(doc, fromKey, toHex), coalesceKey)
  track('palette_change', { kind: 'color' })
}

/** Changes a theme color (a CSS variable such as --primary); everything using it follows. */
export function changeThemeColor(name: string, fromKey: string, toHex: string, coalesceKey?: string) {
  updateDoc((doc) => setThemeColor(doc, name, fromKey, toHex), coalesceKey)
  track('palette_change', { kind: 'theme' })
}
