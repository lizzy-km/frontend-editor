/* Sortable tables: click a heading to sort by that column (numbers as numbers, words in order). */
function cellValue(row, column) {
  var cell = row.children[column]
  return cell ? cell.textContent.trim() : ''
}
function asNumber(text) {
  var cleaned = text.replace(/[^0-9.\-]/g, '')
  return /\d/.test(text) && /^-?\d*\.?\d+$/.test(cleaned) ? Number(cleaned) : null
}
function sortTable(heading) {
  var table = up(heading, 'table')
  var body = table && table.tBodies[0]
  if (!body) return
  var column = Array.prototype.indexOf.call(heading.parentNode.children, heading)
  var down = heading.getAttribute('aria-sort') === 'ascending'
  $$('th', table).forEach(function (other) { other.removeAttribute('aria-sort') })
  heading.setAttribute('aria-sort', down ? 'descending' : 'ascending')
  var rows = Array.prototype.slice.call(body.rows)
  rows.sort(function (a, b) {
    var x = cellValue(a, column), y = cellValue(b, column)
    var nx = asNumber(x), ny = asNumber(y)
    var result = nx !== null && ny !== null ? nx - ny : x.localeCompare(y, undefined, { numeric: true, sensitivity: 'base' })
    return down ? -result : result
  })
  rows.forEach(function (row) { body.appendChild(row) })
}
document.addEventListener('click', function (event) {
  var heading = up(event.target, 'table[data-ui="table"] th[data-ui-sort]')
  if (heading) sortTable(heading)
})
document.addEventListener('keydown', function (event) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  var heading = up(event.target, 'table[data-ui="table"] th[data-ui-sort]')
  if (heading) { event.preventDefault(); sortTable(heading) }
})
