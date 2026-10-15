/* Search bar and filters: show only the rows or cards of a list or table that match what the visitor typed or picked. */
function filterTargets(name) { return name ? $$('[data-ui-filterable="' + name + '"]') : [] }
function filterItems(target) {
  var body = target.tagName === 'TABLE' ? target.tBodies[0] : target
  return Array.prototype.slice.call(body && body.rows ? body.rows : target.children)
}
/** The values a group of filters has switched on (nothing switched on = show everything). */
function activeValues(group) {
  var kind = group.getAttribute('data-ui-kind')
  if (kind === 'select') { var select = $('select', group); return select && select.value ? [select.value] : [] }
  if (kind === 'checks') return $$('input[type="checkbox"]:checked', group).map(function (box) { return box.value })
  var chip = $('[data-ui-filter][aria-pressed="true"]', group)
  var value = chip && chip.getAttribute('data-ui-filter')
  return value ? [value] : []
}
function itemMatches(item, group, values) {
  if (!values.length) return true
  var by = group.getAttribute('data-ui-by')
  var own = by ? item.getAttribute('data-' + by) : null
  return values.some(function (value) {
    var wanted = value.toLowerCase()
    if (own !== null) return own.toLowerCase().split(',').map(function (part) { return part.trim() }).indexOf(wanted) >= 0
    return item.textContent.toLowerCase().indexOf(wanted) >= 0
  })
}
function applyFilters(name) {
  var targets = filterTargets(name)
  if (!targets.length) return
  var words = []
  $$('[data-ui="search"][data-ui-for="' + name + '"] input').forEach(function (box) {
    words = words.concat(box.value.toLowerCase().split(/\s+/).filter(Boolean))
  })
  var groups = $$('[data-ui="filter"][data-ui-for="' + name + '"]').map(function (group) { return { group: group, values: activeValues(group) } })
  var shown = 0, total = 0
  targets.forEach(function (target) {
    filterItems(target).forEach(function (item) {
      var text = item.textContent.toLowerCase()
      var show = words.every(function (word) { return text.indexOf(word) >= 0 }) && groups.every(function (one) { return itemMatches(item, one.group, one.values) })
      item.hidden = !show
      total += 1
      if (show) shown += 1
    })
  })
  $$('[data-ui-empty-for="' + name + '"]').forEach(function (note) { note.hidden = shown > 0 })
  $$('[data-ui-count-for="' + name + '"]').forEach(function (note) { note.textContent = shown + ' of ' + total })
}
function filterNameOf(el) {
  var group = up(el, '[data-ui="search"], [data-ui="filter"]')
  return group ? group.getAttribute('data-ui-for') : ''
}
document.addEventListener('input', function (event) {
  if (up(event.target, '[data-ui="search"]')) applyFilters(filterNameOf(event.target))
})
document.addEventListener('change', function (event) {
  if (up(event.target, '[data-ui="filter"]')) applyFilters(filterNameOf(event.target))
})
document.addEventListener('click', function (event) {
  var chip = up(event.target, '[data-ui="filter"] [data-ui-filter]')
  if (chip) {
    var group = up(chip, '[data-ui="filter"]')
    $$('[data-ui-filter]', group).forEach(function (other) { other.setAttribute('aria-pressed', other === chip ? 'true' : 'false') })
    return applyFilters(filterNameOf(chip))
  }
  var reset = up(event.target, '[data-ui-reset]')
  if (!reset) return
  var name = reset.getAttribute('data-ui-reset')
  $$('[data-ui="search"][data-ui-for="' + name + '"] input').forEach(function (box) { box.value = '' })
  $$('[data-ui="filter"][data-ui-for="' + name + '"]').forEach(function (group) {
    $$('input[type="checkbox"]', group).forEach(function (box) { box.checked = false })
    $$('select', group).forEach(function (select) { select.value = '' })
    $$('[data-ui-filter]', group).forEach(function (chip, index) { chip.setAttribute('aria-pressed', index === 0 ? 'true' : 'false') })
  })
  applyFilters(name)
})
/* Cards that load later (scrolling, React pages) are filtered too. */
whenReady(function (scope) {
  var inside = up(scope, '[data-ui-filterable]')
  var names = inside ? [inside.getAttribute('data-ui-filterable')] : all(scope, '[data-ui-filterable]').map(function (el) { return el.getAttribute('data-ui-filterable') })
  names.forEach(applyFilters)
})
