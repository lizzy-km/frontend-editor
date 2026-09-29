import type { CSSProperties } from 'react'

const TEXT_PROPS = ['fontFamily', 'fontWeight', 'fontStyle', 'color', 'textAlign', 'textTransform', 'textDecoration'] as const

/**
 * Makes the text editor look exactly like the element being edited,
 * scaled to the canvas zoom, so typing feels like typing on the page.
 */
export function matchTextStyle(element: Element, scale: number): CSSProperties {
  const view = element.ownerDocument.defaultView
  if (!view) return {}
  const style = view.getComputedStyle(element)
  const px = (value: string) => (value.endsWith('px') ? `${parseFloat(value) * scale}px` : value)

  const matched: CSSProperties = {
    fontSize: px(style.fontSize),
    lineHeight: px(style.lineHeight),
    letterSpacing: px(style.letterSpacing),
    paddingTop: px(style.paddingTop),
    paddingRight: px(style.paddingRight),
    paddingBottom: px(style.paddingBottom),
    paddingLeft: px(style.paddingLeft),
  }
  for (const prop of TEXT_PROPS) (matched as Record<string, string>)[prop] = style[prop]
  return matched
}
