import { collectSubtreeIds } from '../tree/queries'
import { isElement, type ElementNode, type NodeMap } from '../types'

export const collectSubtreeIdsOf = collectSubtreeIds

/**
 * Cuts out of a page's CSS the rules a component needs, so it can be saved on its own: rules that mention a class or id the
 * component uses, rules for the tags it uses, `:root` / `html` / `*` rules (variables, resets), @font-face and @keyframes.
 * It is a good guess, not a parser of every selector: when the component is added to a page the rules go in front of the
 * page's own, so the page's rules still win where they disagree.
 */
export type Usage = { classes: Set<string>; ids: Set<string>; tags: Set<string>; hooks: Set<string> }

/** The classes, ids and tags used by some boxes. */
export function usageOf(nodes: NodeMap, ids: string[]): Usage {
  const usage: Usage = { classes: new Set(), ids: new Set(), tags: new Set(), hooks: new Set() }
  for (const id of ids) {
    const node = nodes[id]
    if (!isElement(node)) continue
    usage.tags.add(node.tag)
    for (const name of (node as ElementNode).attrs.class?.split(/\s+/) ?? []) if (name) usage.classes.add(name)
    if (node.attrs.id) usage.ids.add(node.attrs.id)
    for (const name of Object.keys(node.attrs)) if (name.startsWith('data-ui-')) usage.hooks.add(name)
  }
  return usage
}

/** Splits CSS text into its top-level blocks: `selector { … }` and `@rule … { … }` or `@rule …;`. */
export function splitRules(css: string): { head: string; body: string | null }[] {
  const rules: { head: string; body: string | null }[] = []
  let depth = 0
  let start = 0
  let open = -1
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '')
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '{') { if (depth === 0) open = i; depth++ }
    else if (char === '}') {
      depth--
      if (depth === 0) { rules.push({ head: text.slice(start, open).trim(), body: text.slice(open + 1, i) }); start = i + 1 }
    } else if (char === ';' && depth === 0) { rules.push({ head: text.slice(start, i).trim(), body: null }); start = i + 1 }
  }
  return rules.filter((rule) => rule.head)
}

const escape = (name: string) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Does a selector list talk about something the component uses (or is a global rule worth keeping)? */
function wanted(selectors: string, usage: Usage): boolean {
  return selectors.split(',').some((selector) => {
    const text = selector.trim()
    if (/^(:root|html|\*|body)\b/.test(text) || text === '*') return true
    for (const name of usage.classes) if (new RegExp(`\\.${escape(name)}(?![\\w-])`).test(text)) return true
    for (const name of usage.hooks) if (text.includes(`[${name}`)) return true
    for (const name of usage.ids) if (new RegExp(`#${escape(name)}(?![\\w-])`).test(text)) return true
    const last = text.split(/[\s>+~]+/).filter(Boolean).at(-1) ?? ''
    return /^[a-z][a-z0-9]*$/i.test(last.replace(/[:[].*$/, '')) && usage.tags.has(last.replace(/[:[].*$/, '').toLowerCase())
  })
}

/** The CSS a component needs (empty when it needs none). */
export function pickCss(css: string, usage: Usage): string {
  const kept: string[] = []
  for (const { head, body } of splitRules(css)) {
    if (body === null) { if (/^@(import|charset)/i.test(head)) kept.push(`${head};`); continue }
    if (/^@(font-face|keyframes|-webkit-keyframes|property)/i.test(head)) kept.push(`${head} {${body}}`)
    else if (/^@(media|supports|container|layer)/i.test(head)) {
      const inner = pickCss(body, usage)
      if (inner) kept.push(`${head} {\n${inner}\n}`)
    } else if (!head.startsWith('@') && wanted(head, usage)) kept.push(`${head} {${body}}`)
  }
  return kept.join('\n')
}
