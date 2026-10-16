import { FROM_ATTR, ITEM_ATTR } from '../dataLists'
import { RECORD_ATTR, ROW_ATTR, isRecordBox } from '../dataRecords'
import { MODAL_ATTR, OPEN_ATTR } from '../popups'
import type { DataValue, PageDoc } from '../types'
import { FILL_JS } from './fillRow'

/**
 * A pop-up that shows "the one that was clicked" (data-fe-row="clicked"): when a card opens it, the pop-up's
 * bound words, pictures and addresses are filled from that card's item just before it opens. Cards that open a
 * pop-up carry their place in the data (data-fe-item / data-fe-from, added when the list is expanded).
 */
const SCRIPT = (data: string) => `(function () {
  var DATA = ${data}${FILL_JS}
  document.addEventListener('click', function (event) {
    var opener = event.target.closest && event.target.closest('[${OPEN_ATTR}]')
    var card = opener && opener.closest('[${ITEM_ATTR}]')
    if (!card) return
    var source = card.getAttribute('${FROM_ATTR}')
    var row = (DATA[source] || [])[Number(card.getAttribute('${ITEM_ATTR}'))]
    var popup = document.querySelector('[${MODAL_ATTR}="' + opener.getAttribute('${OPEN_ATTR}') + '"][${RECORD_ATTR}="' + source + '"][${ROW_ATTR}="clicked"]')
    if (row && popup) fill(popup, row)
  }, true)
})()`

/** Adds the player when a pop-up shows the clicked item. */
export function withClickedRows(doc: PageDoc): PageDoc {
  const boxes = Object.values(doc.nodes).filter(isRecordBox).filter((node) => MODAL_ATTR in node.attrs && node.attrs[ROW_ATTR] === 'clicked')
  if (!boxes.length) return doc
  const wanted = new Set(boxes.map((node) => node.attrs[RECORD_ATTR]))
  const data: Record<string, Record<string, DataValue>[]> = {}
  for (const source of doc.data ?? []) if (wanted.has(source.name)) data[source.name] = source.rows
  return { ...doc, scripts: [...doc.scripts, { code: SCRIPT(JSON.stringify(data).replace(/</g, '<')), inHead: false }] }
}
