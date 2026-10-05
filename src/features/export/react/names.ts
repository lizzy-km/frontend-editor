import type { ElementNode } from '@/features/editor/model/types'

/** Classes that say nothing about what a part is. */
const GENERIC_CLASSES = new Set(['section', 'container', 'wrapper', 'wrap', 'inner', 'content', 'row', 'col', 'block', 'grid'])
const RESERVED = new Set(['App', 'React', 'Fragment', 'Component', 'Suspense', 'Main'])

/** "pricing-plans" -> "PricingPlans"; never starts with a digit. */
export function pascalCase(text: string): string {
  const name = text.split(/[^a-zA-Z0-9]+/).filter(Boolean).map((word) => word[0]!.toUpperCase() + word.slice(1)).join('')
  return /^[0-9]/.test(name) ? `Part${name}` : name
}

/** "PricingPlans" -> "pricingPlans" */
export const lowerFirst = (name: string) => name.charAt(0).toLowerCase() + name.slice(1)

/** A name from the element's id or first meaningful class, or null when it has neither. */
export function meaningfulName(node: ElementNode): string | null {
  const id = node.attrs.id && pascalCase(node.attrs.id)
  if (id) return id
  const classes = (node.attrs.class ?? '').split(/\s+/).filter((name) => name && !GENERIC_CLASSES.has(name) && !name.startsWith('fe-'))
  return (classes[0] && pascalCase(classes[0])) || null
}

/** The most telling name for an element: its id, else its first meaningful class, else its tag. */
export const describeName = (node: ElementNode): string => meaningfulName(node) ?? pascalCase(node.tag)

/**
 * Hands out unique component names, avoiding React's own names. If the
 * wanted name is taken, the alternative is tried (e.g. "Card" -> "PricingCard"),
 * then numbers (Hero2…).
 */
export function createNameRegistry() {
  const used = new Set<string>()
  const clean = (wanted: string) => (RESERVED.has(wanted) ? `${wanted}Section` : wanted || 'Part')
  return (wanted: string, alternative?: string): string => {
    const first = clean(wanted)
    const base = used.has(first) && alternative ? clean(alternative) : first
    let name = base
    for (let n = 2; used.has(name); n++) name = `${base}${n}`
    used.add(name)
    return name
  }
}

/** Words a prop can't be called (JavaScript keywords). */
const KEYWORDS = new Set(['break', 'case', 'catch', 'class', 'const', 'continue', 'default', 'delete', 'do', 'else', 'export',
  'extends', 'false', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'null', 'return', 'super',
  'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield', 'let', 'static', 'enum', 'await'])

/** Unique prop names inside one component (title, title2…). */
export function createPropNames() {
  const used = new Set<string>(['key', 'children'])
  return (wanted: string): string => {
    const safe = /^[a-zA-Z_$][\w$]*$/.test(wanted) ? wanted : 'value'
    const base = KEYWORDS.has(safe) ? `${safe}Value` : safe
    let name = base
    for (let n = 2; used.has(name); n++) name = `${base}${n}`
    used.add(name)
    return name
  }
}
