import type { CSSProperties } from 'react'
import type { ComputedStyles } from '../inspector/useComputedStyle'

const TEXT_PROPS = ['font-family', 'font-weight', 'font-style', 'color', 'text-align', 'text-transform', 'text-decoration'] as const
const SIZE_PROPS = ['font-size', 'line-height', 'letter-spacing', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left'] as const

const camel = (name: string) => name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())

/**
 * Makes the text editor look exactly like the element being edited (its
 * computed styles, from the frame), scaled to the canvas zoom, so typing
 * feels like typing on the page.
 */
export function matchTextStyle(styles: ComputedStyles, scale: number): CSSProperties {
  const px = (value = '') => (value.endsWith('px') ? `${parseFloat(value) * scale}px` : value)
  const matched: Record<string, string> = {}
  for (const prop of SIZE_PROPS) matched[camel(prop)] = px(styles[prop])
  for (const prop of TEXT_PROPS) matched[camel(prop)] = styles[prop] ?? ''
  return matched as CSSProperties
}
