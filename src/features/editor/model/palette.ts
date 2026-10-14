import { replaceColors, scanColors } from '@/lib/colorTokens'
import { replaceCssColor, scanCss, setCssVarColor } from './paletteCss'
import { isElement, type ElementNode, type PageDoc, type StyleMap } from './types'

/** The project's colors: what is used where, and a global "change this color everywhere". */
export type PaletteColor = { key: string; uses: number }
export type ThemeColor = { name: string; key: string; uses: number }

/** Attributes that hold a color (SVG paint, old <font color>). */
const COLOR_ATTRS = ['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color', 'color', 'bgcolor']

const eachValue = (node: ElementNode, visit: (value: string) => void) => {
  for (const map of Object.values(node.styles)) for (const value of Object.values(map ?? {})) visit(value)
  for (const name of COLOR_ATTRS) if (node.attrs[name]) visit(node.attrs[name]!)
}

/** `var(--primary)` uses of a theme color, in the page CSS and in element styles. */
function varUses(doc: PageDoc, name: string): number {
  const escaped = name.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
  const pattern = new RegExp('var\\(\\s*' + escaped + '\\s*[,)]', 'g')
  let uses = doc.css.match(pattern)?.length ?? 0
  for (const node of Object.values(doc.nodes)) if (isElement(node)) eachValue(node, (value) => { uses += value.match(pattern)?.length ?? 0 })
  return uses
}

/** Theme colors (CSS variables) and the literal colors on the page, most used first. */
export function paletteOf(doc: PageDoc): { theme: ThemeColor[]; colors: PaletteColor[] } {
  const css = scanCss(doc.css)
  const counts = new Map<string, number>()
  const count = (key: string) => counts.set(key, (counts.get(key) ?? 0) + 1)
  css.literals.forEach((token) => count(token.key))
  for (const node of Object.values(doc.nodes)) if (isElement(node)) eachValue(node, (value) => scanColors(value).forEach((token) => count(token.key)))
  const seen = new Set<string>()
  const theme = css.vars.filter(({ name, token }) => !seen.has(`${name}|${token.key}`) && seen.add(`${name}|${token.key}`))
    .map(({ name, token }) => ({ name, key: token.key, uses: varUses(doc, name) }))
  const colors = [...counts].map(([key, uses]) => ({ key, uses })).sort((a, b) => b.uses - a.uses)
  return { theme, colors }
}

/** Applies a text change to every style value and color attribute; nodes without a change keep their identity. */
function mapNodes(doc: PageDoc, change: (value: string) => string): PageDoc['nodes'] {
  let nodes = doc.nodes
  for (const node of Object.values(doc.nodes)) {
    if (!isElement(node)) continue
    let styles = node.styles
    for (const [breakpoint, map] of Object.entries(node.styles)) {
      const next: StyleMap = {}
      let changed = false
      for (const [property, value] of Object.entries(map ?? {})) {
        next[property] = change(value)
        changed ||= next[property] !== value
      }
      if (changed) styles = { ...styles, [breakpoint]: next }
    }
    let attrs = node.attrs
    for (const name of COLOR_ATTRS) {
      const value = attrs[name]
      if (value && change(value) !== value) attrs = { ...attrs, [name]: change(value) }
    }
    if (styles !== node.styles || attrs !== node.attrs) nodes = { ...nodes, [node.id]: { ...node, styles, attrs } }
  }
  return nodes
}

/** Every use of a color (page CSS, element styles at every screen size, SVG paint) becomes `toHex`. */
export function replaceColor(doc: PageDoc, fromKey: string, toHex: string): PageDoc {
  if (fromKey === toHex.toLowerCase()) return doc
  const to = toHex.toLowerCase()
  return { ...doc, css: replaceCssColor(doc.css, fromKey, to), nodes: mapNodes(doc, (value) => replaceColors(value, fromKey, to)) }
}

/** Changes one theme color (a CSS variable): everything that uses var(--name) follows. */
export function setThemeColor(doc: PageDoc, name: string, fromKey: string, toHex: string): PageDoc {
  return fromKey === toHex.toLowerCase() ? doc : { ...doc, css: setCssVarColor(doc.css, name, fromKey, toHex.toLowerCase()) }
}
