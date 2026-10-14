import { codeName } from './data'
import { collectSubtreeIds, getAncestorIds, getElement, getTextContent } from './tree/queries'
import { isElement, type ElementNode, type NodeMap } from './types'

/**
 * Forms are plain HTML: <form> with inputs that have a name, a type and the
 * browser's own rules (required, minlength, maxlength, min, max, pattern), so
 * forms pasted from an AI work as they are. Two extras are the editor's:
 * data-fe-match (must equal another field, "repeat password") and
 * data-fe-message (one error message for the field).
 */
export const MATCH_ATTR = 'data-fe-match'
export const MESSAGE_ATTR = 'data-fe-message'
/** On the <form>: what sending does, and the thank-you text. */
export const SUBMIT_ATTR = 'data-fe-submit'
export const SUCCESS_ATTR = 'data-fe-success'

export type FieldKind = 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'date' | 'checkbox' | 'radio' | 'select' | 'longText'

/** One named value the form sends (radio buttons with one name are one field). */
export type FormField = {
  ids: string[]; name: string; label: string; kind: FieldKind; required: boolean
  minLength?: number; maxLength?: number; min?: number; max?: number; pattern?: string; match?: string; message?: string
}

const INPUT_KINDS: Record<string, FieldKind> = {
  text: 'text', search: 'text', email: 'email', password: 'password', tel: 'tel', url: 'url', number: 'number', range: 'number',
  date: 'date', 'datetime-local': 'date', time: 'date', month: 'date', week: 'date', checkbox: 'checkbox', radio: 'radio',
}

/** What kind of value an element asks for (null: not a field, e.g. a submit button or a file picker). */
export function fieldKind(node: ElementNode | undefined): FieldKind | null {
  if (!node) return null
  if (node.tag === 'textarea') return 'longText'
  if (node.tag === 'select') return 'select'
  if (node.tag !== 'input') return null
  return INPUT_KINDS[(node.attrs.type ?? 'text').toLowerCase()] ?? null
}

/** The <form> an element is in (or is). */
export function formAround(nodes: NodeMap, id: string): ElementNode | undefined {
  return [id, ...getAncestorIds(nodes, id)].map((each) => getElement(nodes, each)).find((node) => node?.tag === 'form')
}

/** A label's own words (a dropdown's options inside it are not part of them). */
function labelText(nodes: NodeMap, id: string): string {
  const node = nodes[id]
  if (!node) return ''
  if (node.kind === 'text') return node.text
  if (FIELD_TAGS.has(node.tag)) return ''
  return node.children.map((child) => labelText(nodes, child)).join(' ').replace(/\s+/g, ' ').trim()
}

const FIELD_TAGS = new Set(['input', 'select', 'textarea'])

/** The words people read next to a field: its <label>, else aria-label, hint text or name. */
export function fieldLabel(nodes: NodeMap, node: ElementNode): string {
  const wrapping = getAncestorIds(nodes, node.id).map((id) => getElement(nodes, id)).find((parent) => parent?.tag === 'label')
  const form = formAround(nodes, node.id)
  const pointing = node.attrs.id && form
    ? collectSubtreeIds(nodes, form.id).map((id) => getElement(nodes, id)).find((label) => label?.tag === 'label' && label.attrs.for === node.attrs.id)
    : undefined
  const fromLabel = (wrapping ?? pointing) ? labelText(nodes, (wrapping ?? pointing)!.id).replace(/[*:]\s*$/, '').trim() : ''
  return fromLabel || node.attrs['aria-label'] || node.attrs.placeholder || node.attrs.name || 'This field'
}

const numberAttr = (node: ElementNode, name: string) => {
  const value = Number(node.attrs[name])
  return node.attrs[name] !== undefined && node.attrs[name] !== '' && Number.isFinite(value) ? value : undefined
}

/** The name a field is sent (and coded) under: its name, else one made from its label. */
export const fieldName = (nodes: NodeMap, node: ElementNode) => node.attrs.name || codeName(fieldLabel(nodes, node), 'field')

/** "shippingSpeed" -> "Shipping speed". */
const humanize = (name: string) => {
  const words = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ').trim().toLowerCase()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** A radio question's words: its group's <legend>, else its name (each button's own label is one answer). */
function questionLabel(nodes: NodeMap, node: ElementNode): string {
  const group = getAncestorIds(nodes, node.id).map((id) => getElement(nodes, id)).find((parent) => parent?.tag === 'fieldset')
  const legend = group?.children.map((id) => getElement(nodes, id)).find((child) => child?.tag === 'legend')
  return (legend && getTextContent(nodes, legend.id)) || humanize(fieldName(nodes, node))
}

function toField(nodes: NodeMap, node: ElementNode, kind: FieldKind): FormField {
  return {
    ids: [node.id], name: fieldName(nodes, node), label: kind === 'radio' ? questionLabel(nodes, node) : fieldLabel(nodes, node), kind, required: 'required' in node.attrs,
    minLength: numberAttr(node, 'minlength'), maxLength: numberAttr(node, 'maxlength'),
    min: numberAttr(node, 'min'), max: numberAttr(node, 'max'), pattern: node.attrs.pattern || undefined,
    match: node.attrs[MATCH_ATTR] || undefined, message: node.attrs[MESSAGE_ATTR] || undefined,
  }
}

/** Every field of a form, in page order. */
export function fieldsOf(nodes: NodeMap, formId: string): FormField[] {
  const fields: FormField[] = []
  for (const id of collectSubtreeIds(nodes, formId)) {
    const node = nodes[id]
    const kind = isElement(node) ? fieldKind(node) : null
    if (!kind || !isElement(node) || node.hidden || 'disabled' in node.attrs) continue
    const field = toField(nodes, node, kind)
    const same = fields.find((each) => each.name === field.name)
    if (same) same.ids.push(id) // radio buttons of one question
    else fields.push(field)
  }
  return fields
}

/** What happens when a form is sent. Sign-in kinds are used by the sign-in pages. */
export type SubmitKind = 'send' | 'sign-in' | 'register' | 'forgot' | 'reset' | 'confirm'

export type FormSettings = { submit: SubmitKind; address: string; success: string }

const SUBMIT_KINDS: SubmitKind[] = ['send', 'sign-in', 'register', 'forgot', 'reset', 'confirm']
export const DEFAULT_SUCCESS = 'Thank you! We got your message.'

export function formSettings(form: ElementNode): FormSettings {
  const submit = SUBMIT_KINDS.find((kind) => kind === form.attrs[SUBMIT_ATTR]) ?? 'send'
  const address = /^(https?:)?\/[^\s]*$/i.test(form.attrs.action ?? '') ? form.attrs.action! : ''
  return { submit, address, success: form.attrs[SUCCESS_ATTR] || DEFAULT_SUCCESS }
}
