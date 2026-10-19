import { toFieldValue } from './data'
import { isElement, type DataApi, type DataField, type DataSource, type DataValue, type NodeMap, type PageDoc } from './types'

/**
 * A click that changes data in an API (a connected data source), as one attribute on the button or link:
 *   data-fe-update='{"source":"products","item":"clicked","changes":[{"field":"liked","op":"toggle","value":""}]}'
 * `item`: "clicked" (the data card the button is in) or { id } (one item, by its id). Changes: set a field to a value,
 * switch a yes/no field, or add to a number. Only "set" works on a chosen item (nothing is read from it first).
 */
export const UPDATE_ATTR = 'data-fe-update'

export type ChangeOp = 'set' | 'toggle' | 'add'
export type UpdateChange = { field: string; op: ChangeOp; value: string }
export type UpdateClick = { source: string; item: 'clicked' | { id: string }; changes: UpdateChange[] }

export const CHANGE_OPS: { value: ChangeOp; label: string }[] = [
  { value: 'set', label: 'Set to' },
  { value: 'toggle', label: 'Switch yes / no' },
  { value: 'add', label: 'Add' },
]

/** The update a click makes (null when the attribute is missing or can't be read). */
export function updateClickOf(attrs: Record<string, string>): UpdateClick | null {
  try {
    const click = JSON.parse(attrs[UPDATE_ATTR] ?? 'null') as Partial<UpdateClick> | null
    if (!click || typeof click.source !== 'string' || !Array.isArray(click.changes)) return null
    const changes = click.changes.filter((change) => typeof change?.field === 'string' && ['set', 'toggle', 'add'].includes(change.op))
    const item = click.item === 'clicked' ? 'clicked' : typeof click.item === 'object' && click.item && typeof click.item.id === 'string' ? { id: click.item.id } : null
    return item && changes.length ? { source: click.source, item, changes: changes.map((change) => ({ field: change.field, op: change.op, value: String(change.value ?? '') })) } : null
  } catch { return null }
}

/** The attribute value for an update ('' removes it). */
export const updateAttrValue = (click: UpdateClick | null) => (click ? JSON.stringify(click) : '')

/** Does any click on the page update data? */
export const usesUpdateClicks = (nodes: NodeMap) => Object.values(nodes).some((node) => isElement(node) && updateClickOf(node.attrs) !== null)

/** The sources a click can update: the ones connected to an API. */
export const updatableSources = (doc: Pick<PageDoc, 'data'>): DataSource[] => (doc.data ?? []).filter((source) => Boolean(source.api?.url))

/** Where ONE item of a source lives, `:id` marking the changing part (the item address, or the list address + /:id). */
export function itemAddress(api: DataApi | undefined): string {
  if (!api) return ''
  return api.itemUrl || (api.url.includes('?') ? '' : `${api.url.replace(/\/+$/, '')}/:id`)
}

/** What a change makes of a field's value. `current` is the item's value now (needed to switch or add). */
export function changedValue(change: UpdateChange, type: DataField['type'], current: DataValue | undefined): DataValue {
  if (change.op === 'toggle') return !(current === true || current === 'true')
  if (change.op === 'add') return (Number(current) || 0) + (Number(change.value) || 0)
  return toFieldValue(change.value, type)
}

/** The request body: each value placed where the API keeps it ("rating.rate" goes inside rating). */
export function requestBody(fields: DataField[], values: Record<string, DataValue>): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  for (const [name, value] of Object.entries(values)) {
    const path = (fields.find((field) => field.name === name)?.from || name).split('.')
    let at = body
    for (const key of path.slice(0, -1)) at = (at[key] ??= {}) as Record<string, unknown>
    at[path[path.length - 1]!] = value
  }
  return body
}
