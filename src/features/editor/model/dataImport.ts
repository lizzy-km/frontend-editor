import { codeName, emptyValue } from './data'
import type { DataField, DataSource, DataValue, FieldType, PageDoc } from './types'

/** Turning pasted JSON (an API answer, an export) into the fields and sample rows of a data source. */

export type ParsedJson = { fields: DataField[]; rows: Record<string, DataValue>[]; notes: string[] }
export type ParseResult = ({ ok: true } & ParsedJson) | { ok: false; error: string }

const MAX_ROWS = 500
const IMAGE_KEY = /(image|img|photo|picture|thumb|avatar|cover|logo|icon|banner)/i
const IMAGE_FILE = /\.(png|jpe?g|gif|webp|avif|svg)(\?|#|$)/i
const DATE = /^\d{4}-\d{2}-\d{2}([T ][\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const isList = (value: unknown): value is Record<string, unknown>[] => Array.isArray(value) && value.length > 0 && value.every(isObject)

/** The list of objects inside an answer: the answer itself, or the biggest list found by looking inside objects. */
export function findList(json: unknown, depth = 0): Record<string, unknown>[] | null {
  if (isList(json)) return json
  if (!isObject(json) || depth > 3) return null
  const found = Object.values(json).map((value) => findList(value, depth + 1)).filter((list): list is Record<string, unknown>[] => list !== null)
  return found.sort((a, b) => b.length - a.length)[0] ?? null
}

/** One object as flat key -> value: nested objects become `parentChild`, lists of words become "a, b". */
function flatten(object: Record<string, unknown>, notes: Set<string>, prefix = ''): Record<string, unknown> {
  const flat: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(object)) {
    const name = prefix ? `${prefix} ${key}` : key
    if (isObject(value)) Object.assign(flat, flatten(value, notes, name))
    else if (Array.isArray(value)) {
      if (value.every((item) => item === null || typeof item !== 'object')) flat[name] = value.join(', ')
      else notes.add(`“${name}” holds a list of objects: left out.`)
    } else flat[name] = value
  }
  return flat
}

function kindOf(name: string, values: unknown[]): FieldType {
  const present = values.filter((value) => value !== null && value !== undefined && value !== '')
  if (present.length && present.every((value) => typeof value === 'boolean')) return 'boolean'
  if (present.length && present.every((value) => typeof value === 'number')) return 'number'
  const strings = present.map(String)
  if (strings.length && strings.every((text) => DATE.test(text))) return 'date'
  if (strings.length && strings.every((text) => /^https?:\/\//.test(text) || text.startsWith('/'))) {
    return IMAGE_KEY.test(name) || strings.some((text) => IMAGE_FILE.test(text)) ? 'image' : 'url'
  }
  return strings.some((text) => text.length > 120 || text.includes('\n')) ? 'longText' : 'text'
}

function coerce(value: unknown, type: FieldType): DataValue {
  if (value === null || value === undefined || value === '') return emptyValue(type)
  if (type === 'number') return Number(value)
  if (type === 'boolean') return value === true || value === 'true'
  return type === 'date' ? String(value).slice(0, 10) : String(value)
}

/** Reads JSON text: finds the list of objects, makes a field for every key, and a row for every object. */
export function parseJsonData(text: string): ParseResult {
  let json: unknown
  try { json = JSON.parse(text) } catch { return { ok: false, error: 'This is not valid JSON. Check for a missing comma, quote or bracket.' } }
  const list = findList(json) ?? (isObject(json) ? [json] : null)
  if (!list) return { ok: false, error: 'No list of items found. Paste an array of objects like [{ "name": "Shirt", "price": 59 }].' }
  const notes = new Set<string>()
  const flat = list.slice(0, MAX_ROWS).map((object) => flatten(object, notes))
  if (list.length > MAX_ROWS) notes.add(`Only the first ${MAX_ROWS} of ${list.length} items were kept.`)
  const keys = [...new Set(flat.flatMap((row) => Object.keys(row)))]
  const names = new Map<string, string>()
  for (const key of keys) {
    let name = codeName(key, 'field')
    for (let n = 2; [...names.values()].includes(name); n++) name = `${codeName(key, 'field')}${n}`
    names.set(key, name)
  }
  const fields: DataField[] = keys.map((key) => ({ name: names.get(key)!, type: kindOf(key, flat.map((row) => row[key])) }))
  const rows = flat.map((row) => Object.fromEntries(keys.map((key, index) => [fields[index]!.name, coerce(row[key], fields[index]!.type)])))
  if (fields.length === 0) return { ok: false, error: 'The items have no fields.' }
  return { ok: true, fields, rows, notes: [...notes] }
}

/** Replaces the source's fields and rows, or adds the rows to what is there (new fields are added; missing values stay empty). */
export function importData(doc: PageDoc, id: string, parsed: ParsedJson, mode: 'replace' | 'add'): PageDoc {
  const change = (source: DataSource): DataSource => {
    if (mode === 'replace') return { ...source, fields: parsed.fields, rows: parsed.rows }
    const fields = [...source.fields, ...parsed.fields.filter((field) => !source.fields.some((have) => have.name === field.name))]
    const fill = (row: Record<string, DataValue>) => Object.fromEntries(fields.map((field) => [field.name, row[field.name] ?? emptyValue(field.type)]))
    return { ...source, fields, rows: [...source.rows, ...parsed.rows].map(fill) }
  }
  return { ...doc, data: (doc.data ?? []).map((source) => (source.id === id ? change(source) : source)) }
}
