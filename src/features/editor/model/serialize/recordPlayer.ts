import { RECORD_ATTR, ROW_ATTR, isRecordBox } from '../dataRecords'
import { isElement, type DataValue, type PageDoc } from '../types'
import { FILL_JS } from './fillRow'

/**
 * Records chosen by the page address (data-fe-row="?id"): the rows are embedded
 * and the box shows the row whose id is in ?id=3 when the page opens. Without it
 * the first row (already in place) stays.
 */
const SCRIPT = (data: string) => `(function () {
  var DATA = ${data}${FILL_JS}
  document.querySelectorAll('[${RECORD_ATTR}][${ROW_ATTR}^="?"]').forEach(function (box) {
    var wanted = new URLSearchParams(location.search).get(box.getAttribute('${ROW_ATTR}').slice(1))
    var rows = DATA[box.getAttribute('${RECORD_ATTR}')] || []
    var row = wanted === null ? null : rows.find(function (item) { return String(item.id == null ? '' : item.id) === wanted })
    if (row) fill(box, row)
  })
})()`

/** Adds the record player when a box takes its record from the page address. */
export function withRecords(doc: PageDoc): PageDoc {
  const sources = new Set(Object.values(doc.nodes).filter(isRecordBox).filter((node) => node.attrs[ROW_ATTR]?.startsWith('?')).map((node) => node.attrs[RECORD_ATTR]!))
  if (!sources.size || !Object.values(doc.nodes).some(isElement)) return doc
  const data: Record<string, Record<string, DataValue>[]> = {}
  for (const source of doc.data ?? []) if (sources.has(source.name)) data[source.name] = source.rows
  return { ...doc, scripts: [...doc.scripts, { code: SCRIPT(JSON.stringify(data).replace(/</g, '\u003c')), inHead: false }] }
}
