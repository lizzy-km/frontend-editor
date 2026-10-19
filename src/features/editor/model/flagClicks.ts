import { isElement, type NodeMap } from './types'

/**
 * A click that changes a flag for this visitor, plain attributes on the button or link:
 *   data-fe-flag="beta"  data-fe-flag-mode="on" | "off" | "toggle"
 * Boxes set to "Only when these flags are on" (data-fe-flags) then appear or disappear straight away.
 */
export const FLAG_ATTR = 'data-fe-flag'
export const FLAG_MODE_ATTR = 'data-fe-flag-mode'

export type FlagMode = 'on' | 'off' | 'toggle'
export const FLAG_MODES: { value: FlagMode; label: string }[] = [
  { value: 'on', label: 'Turn it on' },
  { value: 'off', label: 'Turn it off' },
  { value: 'toggle', label: 'Switch it' },
]

/** The flag an element's click changes, and how (null when it has none). */
export function flagClickOf(attrs: Record<string, string>): { flag: string; mode: FlagMode } | null {
  const flag = attrs[FLAG_ATTR]
  if (!flag) return null
  const mode = attrs[FLAG_MODE_ATTR]
  return { flag, mode: mode === 'on' || mode === 'off' ? mode : 'toggle' }
}

/** Does any click on the page change a flag? (Decides whether the flag player is added.) */
export const usesFlagClicks = (nodes: NodeMap) => Object.values(nodes).some((node) => isElement(node) && Boolean(node.attrs[FLAG_ATTR]))
