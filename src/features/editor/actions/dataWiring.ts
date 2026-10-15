import { track } from '@/features/analytics/track'
import { autoWire, wiringAttrs, type RowChoice } from '../model/dataRecords'
import { isElement } from '../model/types'
import { getDoc } from '../store/doc.store'
import { updateNodes } from './commit'
import { setAttributes } from './nodeActions'

/** Makes a box show a data source: every row (a list), one record, or nothing (mode null). One undo step. */
export function wireData(id: string, mode: 'list' | 'record' | null, source: string, row?: RowChoice) {
  const node = getDoc().nodes[id]
  if (!isElement(node)) return
  setAttributes(id, wiringAttrs(mode, source, row, node))
  if (mode) track('data_wire', { mode })
}

/** Connects fields to the box's pictures and text by what fits (pictures to picture fields, headings to titles…). One undo step. */
export function connectFields(boxId: string, sourceName: string) {
  const source = (getDoc().data ?? []).find((item) => item.name === sourceName)
  if (source) updateNodes((nodes) => autoWire(nodes, boxId, source))
}
