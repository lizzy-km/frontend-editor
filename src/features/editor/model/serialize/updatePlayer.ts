import { FROM_ATTR, ITEM_ATTR } from '../dataLists'
import { UPDATE_ATTR, itemAddress, updateClickOf } from '../updateClicks'
import { isElement, type PageDoc } from '../types'
import { FILL_JS } from './fillRow'

/**
 * Makes "When clicked → Update data" work for visitors (Preview, public view, .html downloads): the click sends the
 * change to the source's API (PATCH to the item's address), then the data card shows the new value. The item is
 * found through the card's place in the data (data-fe-item / data-fe-from, added when the list is expanded).
 * A key the API needs (set in the React project's .env) can't be in a plain .html page: such APIs work in the React download.
 */
const SCRIPT = (data: string) => `(function () {
  var DATA = ${data}${FILL_JS}
  function note(text) {
    var box = document.createElement('div')
    box.setAttribute('role', 'status')
    box.style.cssText = 'position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 2147483000; padding: 10px 16px; border-radius: 10px; background: #1c1917; color: #fff; font: 600 14px system-ui, sans-serif'
    box.textContent = text
    document.body.appendChild(box)
    setTimeout(function () { box.remove() }, 3500)
  }
  function changed(change, type, current) {
    if (change.op === 'toggle') return !(current === true || current === 'true')
    if (change.op === 'add') return (Number(current) || 0) + (Number(change.value) || 0)
    if (type === 'number') return Number(change.value) || 0
    if (type === 'boolean') return /^(true|yes|1)$/i.test(change.value)
    return change.value
  }
  document.addEventListener('click', function (event) {
    var button = event.target.closest && event.target.closest('[${UPDATE_ATTR}]')
    if (!button) return
    var click
    try { click = JSON.parse(button.getAttribute('${UPDATE_ATTR}')) } catch (e) { return }
    var source = DATA[click.source]
    if (!source) return
    var card = null, row = null, id
    if (click.item === 'clicked') {
      card = button.closest('[${ITEM_ATTR}]')
      var index = card ? Number(card.getAttribute('${ITEM_ATTR}')) : -1
      row = source.rows[index]
      if (!card || !row || card.getAttribute('${FROM_ATTR}') !== click.source) return
      id = row.id != null ? row.id : index + 1
    } else id = click.item.id
    var values = {}, body = {}
    click.changes.forEach(function (change) {
      values[change.field] = changed(change, source.fields[change.field] && source.fields[change.field].type, row ? row[change.field] : undefined)
      var path = ((source.fields[change.field] && source.fields[change.field].from) || change.field).split('.'), at = body
      path.slice(0, -1).forEach(function (key) { at = at[key] = at[key] || {} })
      at[path[path.length - 1]] = values[change.field]
    })
    button.setAttribute('aria-busy', 'true')
    fetch(source.address.replace(/\\/:[A-Za-z_]\\w*/, '/' + encodeURIComponent(id)), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (answer) {
        if (!answer.ok) throw new Error(String(answer.status))
        if (row) { Object.keys(values).forEach(function (name) { row[name] = values[name] }); if (card) fill(card, row) }
      })
      .catch(function () { note('Your change could not be saved. Please try again.') })
      .then(function () { button.removeAttribute('aria-busy') })
  })
})()`

/** Adds the player when a click updates data. */
export function withUpdateClicks(doc: PageDoc): PageDoc {
  const used = new Set(Object.values(doc.nodes).flatMap((node) => (isElement(node) ? [updateClickOf(node.attrs)?.source] : [])).filter((name): name is string => Boolean(name)))
  const data: Record<string, { address: string; fields: Record<string, { type: string; from: string }>; rows: unknown[] }> = {}
  for (const source of doc.data ?? []) {
    const address = itemAddress(source.api)
    if (used.has(source.name) && address) data[source.name] = { address, fields: Object.fromEntries(source.fields.map((field) => [field.name, { type: field.type, from: field.from ?? '' }])), rows: source.rows }
  }
  return Object.keys(data).length ? { ...doc, scripts: [...doc.scripts, { code: SCRIPT(JSON.stringify(data).split('<').join('\\u003c')), inHead: false }] } : doc
}
