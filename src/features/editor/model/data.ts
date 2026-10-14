import { createId } from '@/lib/ids'
import type { DataField, DataSource, DataValue, FieldType, PageDoc } from './types'

/** Pure operations on a document's data sources (the Data panel commits them). */

const words = (text: string) => text.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/[^a-zA-Z0-9]+/).filter(Boolean)

/** "Blog posts" -> "blogPosts": a name code can use (sources and fields). */
export function codeName(text: string, fallback = 'items'): string {
  const parts = words(text)
  const name = parts.map((word, index) => (index ? word[0]!.toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase())).join('')
  return /^[a-z]/i.test(name) ? name : fallback
}

/** "blogPosts" -> "BlogPost": the TypeScript type of one row (naive singular). */
export function rowTypeName(name: string): string {
  const pascal = name.charAt(0).toUpperCase() + name.slice(1)
  if (/ies$/.test(pascal)) return pascal.slice(0, -3) + 'y'
  if (/(ss|us)$/.test(pascal)) return pascal
  return pascal.endsWith('s') ? pascal.slice(0, -1) : `${pascal}Item`
}

/** An empty value of the right kind for a new row or a new field. */
export function emptyValue(type: FieldType): DataValue {
  if (type === 'number') return 0
  if (type === 'boolean') return false
  return ''
}

/** What someone typed, turned into the field's kind ("12" -> 12, "yes" -> true). */
export function toFieldValue(raw: string | boolean, type: FieldType): DataValue {
  if (type === 'boolean') return raw === true || /^(true|yes|1)$/i.test(String(raw))
  if (type === 'number') return Number.isFinite(Number(raw)) ? Number(raw) : 0
  return String(raw)
}

const unique = (wanted: string, taken: string[]) => {
  let name = wanted
  for (let n = 2; taken.includes(name); n++) name = `${wanted}${n}`
  return name
}

const withSources = (doc: PageDoc, change: (sources: DataSource[]) => DataSource[]): PageDoc => ({ ...doc, data: change(doc.data ?? []) })
const mapSource = (doc: PageDoc, id: string, change: (source: DataSource) => DataSource) =>
  withSources(doc, (sources) => sources.map((source) => (source.id === id ? change(source) : source)))

/** Adds a source (from a preset or empty) with a unique code name. Returns its id. */
export function addSource(doc: PageDoc, start: Omit<DataSource, 'id'>): { doc: PageDoc; id: string } {
  const id = createId()
  const name = unique(codeName(start.name), (doc.data ?? []).map((source) => source.name))
  return { doc: withSources(doc, (sources) => [...sources, { ...start, id, name }]), id }
}

export const removeSource = (doc: PageDoc, id: string) => withSources(doc, (sources) => sources.filter((source) => source.id !== id))

/** New name (kept unique and code-safe) or API settings. */
export function updateSource(doc: PageDoc, id: string, change: { name?: string; api?: DataSource['api'] }): PageDoc {
  const others = (doc.data ?? []).filter((source) => source.id !== id).map((source) => source.name)
  return mapSource(doc, id, (source) => ({
    ...source,
    ...(change.name !== undefined ? { name: unique(codeName(change.name, source.name), others) } : {}),
    ...('api' in change ? { api: change.api } : {}),
  }))
}

/** Adds a field; every row gets an empty value for it. */
export function addField(doc: PageDoc, id: string, field: DataField): PageDoc {
  return mapSource(doc, id, (source) => {
    const name = unique(codeName(field.name, 'field'), source.fields.map((f) => f.name))
    return { ...source, fields: [...source.fields, { name, type: field.type }], rows: source.rows.map((row) => ({ ...row, [name]: emptyValue(field.type) })) }
  })
}

/** Renames and/or retypes a field; row values move and convert with it. */
export function changeField(doc: PageDoc, id: string, index: number, change: Partial<DataField>): PageDoc {
  return mapSource(doc, id, (source) => {
    const old = source.fields[index]
    if (!old) return source
    const others = source.fields.filter((_, i) => i !== index).map((f) => f.name)
    const name = change.name !== undefined ? unique(codeName(change.name, old.name), others) : old.name
    const type = change.type ?? old.type
    const rows = source.rows.map((row) => {
      const { [old.name]: value, ...rest } = row
      return { ...rest, [name]: value === undefined ? emptyValue(type) : toFieldValue(value as string, type) }
    })
    return { ...source, fields: source.fields.map((f, i) => (i === index ? { name, type } : f)), rows }
  })
}

export function removeField(doc: PageDoc, id: string, index: number): PageDoc {
  return mapSource(doc, id, (source) => {
    const name = source.fields[index]?.name
    return { ...source, fields: source.fields.filter((_, i) => i !== index), rows: source.rows.map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => key !== name))) }
  })
}

export const addRow = (doc: PageDoc, id: string) =>
  mapSource(doc, id, (source) => ({ ...source, rows: [...source.rows, Object.fromEntries(source.fields.map((f) => [f.name, emptyValue(f.type)]))] }))

export const removeRow = (doc: PageDoc, id: string, index: number) =>
  mapSource(doc, id, (source) => ({ ...source, rows: source.rows.filter((_, i) => i !== index) }))

/** One cell of the mock data. */
export function setCell(doc: PageDoc, id: string, row: number, field: DataField, raw: string | boolean): PageDoc {
  return mapSource(doc, id, (source) => ({
    ...source,
    rows: source.rows.map((values, i) => (i === row ? { ...values, [field.name]: toFieldValue(raw, field.type) } : values)),
  }))
}
