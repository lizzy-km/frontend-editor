import { BOOLEAN_ATTRS, HANDLER_PREFIX, RENAMED } from '../jsxAttrs'

/** The HTML name of an attribute written for React (the reverse of what the export did). */

const FROM_REACT: Record<string, string> = Object.fromEntries(Object.entries(RENAMED).map(([html, react]) => [react, html]))
/** SVG attributes with a dash in HTML (strokeWidth -> stroke-width); others like viewBox stay as they are. */
const SVG_DASHED = new Set(['stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-miterlimit',
  'stroke-opacity', 'fill-opacity', 'fill-rule', 'clip-rule', 'clip-path', 'stop-color', 'stop-opacity', 'flood-color', 'flood-opacity',
  'font-size', 'font-family', 'font-weight', 'text-anchor', 'text-decoration', 'letter-spacing', 'marker-start', 'marker-mid', 'marker-end',
  'shape-rendering', 'vector-effect', 'dominant-baseline', 'alignment-baseline', 'color-interpolation-filters'])
const EVENTS = new Set(['click', 'change', 'input', 'submit', 'keydown', 'keyup', 'keypress', 'focus', 'blur', 'mouseover', 'mouseout',
  'mouseenter', 'mouseleave', 'load', 'scroll', 'dblclick', 'touchstart', 'touchend'])

export function htmlAttrName(name: string, tag: string): string {
  if (name.startsWith(HANDLER_PREFIX) && EVENTS.has(name.slice(HANDLER_PREFIX.length))) return `on${name.slice(HANDLER_PREFIX.length)}`
  if (name === 'defaultValue') return 'value'
  if (name === 'defaultChecked') return 'checked'
  if (name.startsWith('data-') || name.startsWith('aria-')) return name
  if (FROM_REACT[name]) return FROM_REACT[name]!
  const dashed = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
  return SVG_DASHED.has(dashed) && tag !== 'svg-none' ? dashed : name
}

export const isBooleanAttr = (name: string) => BOOLEAN_ATTRS.has(name)
