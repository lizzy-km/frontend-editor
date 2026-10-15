import { track } from '@/features/analytics/track'
import { addField, addRow, addSource, changeField, removeField, removeRow, removeSource, setCell, updateSource } from '../model/data'
import { importData, type ParsedJson } from '../model/dataImport'
import type { DataField, DataSource } from '../model/types'
import { updateDoc } from './commit'

/** Data panel edits: each is one undo step; typing in a box is coalesced into one. */

export function createSource(start: Omit<DataSource, 'id'>, preset: string): string {
  let id = ''
  updateDoc((doc) => {
    const result = addSource(doc, start)
    id = result.id
    return result.doc
  })
  track('data_add', { preset })
  return id
}

/** Connects a source to a real API: remembers the address, list place and key setting, and takes the fields and sample items the test found. One undo step. */
export function connectApi(id: string, api: NonNullable<DataSource['api']>, parsed: ParsedJson) {
  updateDoc((doc) => importData(updateSource(doc, id, { api }), id, parsed, 'replace'))
  track('api_connect', { auth: Boolean(api.auth), rows: parsed.rows.length })
}

/** Fills a data source from pasted JSON: replaces its fields and rows, or adds to them. One undo step. */
export function importJson(id: string, parsed: ParsedJson, mode: 'replace' | 'add') {
  updateDoc((doc) => importData(doc, id, parsed, mode))
  track('data_import', { mode, rows: parsed.rows.length })
}

export const deleteSource = (id: string) => updateDoc((doc) => removeSource(doc, id))
export const renameSource = (id: string, name: string) => updateDoc((doc) => updateSource(doc, id, { name }), `data:${id}:name`)
export const setSourceApi = (id: string, api: DataSource['api']) => updateDoc((doc) => updateSource(doc, id, { api }), `data:${id}:api`)
export const newField = (id: string, field: DataField) => updateDoc((doc) => addField(doc, id, field))
export const editField = (id: string, index: number, change: Partial<DataField>) => updateDoc((doc) => changeField(doc, id, index, change), `data:${id}:field:${index}`)
export const deleteField = (id: string, index: number) => updateDoc((doc) => removeField(doc, id, index))
export const newRow = (id: string) => updateDoc((doc) => addRow(doc, id))
export const deleteRow = (id: string, index: number) => updateDoc((doc) => removeRow(doc, id, index))
export const editCell = (id: string, row: number, field: DataField, value: string | boolean) =>
  updateDoc((doc) => setCell(doc, id, row, field, value), `data:${id}:${row}:${field.name}`)
