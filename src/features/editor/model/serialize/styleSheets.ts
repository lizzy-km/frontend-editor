import { BREAKPOINT_ORDER, BREAKPOINTS } from '../breakpoints'
import { isElement, type ElementNode, type NodeMap, type StyleMap } from '../types'
import { splitImports } from './cssImports'
import { isValidCssProperty, sanitizeCssValue } from './escape'

function declarations(styles: StyleMap): string {
  return Object.entries(styles)
    .filter(([property]) => isValidCssProperty(property))
    .map(([property, value]) => `${property}: ${sanitizeCssValue(value)};`)
    .join(' ')
}

/**
 * CSS for everything the user changed in the editor, grouped per screen size.
 * `selectorFor` decides how an element is targeted: [data-fe-id] inside the
 * editor, .fe-<id> in exported files.
 */
export function buildOverrideCss(nodes: NodeMap, selectorFor: (node: ElementNode) => string): string {
  const elements = Object.values(nodes).filter(isElement)
  const blocks: string[] = []

  for (const breakpoint of BREAKPOINT_ORDER) {
    const rules = elements
      .filter((node) => node.styles[breakpoint] && Object.keys(node.styles[breakpoint]!).length > 0)
      .map((node) => `${selectorFor(node)} { ${declarations(node.styles[breakpoint]!)} }`)
    if (rules.length === 0) continue

    const media = BREAKPOINTS[breakpoint].media
    blocks.push(media ? `@media ${media} {\n${rules.join('\n')}\n}` : rules.join('\n'))
  }
  return blocks.join('\n\n')
}

/**
 * Puts the pasted CSS in a cascade layer. Un-layered rules always win over
 * layered ones, so the user's edits beat the original CSS without !important
 * and without fighting specificity. @import/@charset must stay on top.
 */
export function wrapUserCss(css: string): string {
  if (!css.trim()) return ''
  const { imports, rest } = splitImports(css)
  return `${imports.join('\n')}\n@layer page {\n${rest.trim()}\n}`.trim()
}
