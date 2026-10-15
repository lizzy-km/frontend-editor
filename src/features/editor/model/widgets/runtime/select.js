/* Select list: a button that opens a list; choosing fills the button and a hidden field (so forms get the value). */
function optionValue(option) { return option.getAttribute('data-value') || option.textContent.trim() }
function selectChoose(root, option) {
  own(root, '[data-ui-option]', 'select').forEach(function (other) { other.setAttribute('aria-selected', other === option ? 'true' : 'false') })
  var label = $('[data-ui-value]', root)
  if (label) { label.textContent = option.textContent.trim(); label.removeAttribute('data-empty') }
  var field = $('[data-ui-input]', root)
  if (field) { field.value = optionValue(option); fire(field, 'input'); fire(field, 'change') }
}
function selectFilter(root, text) {
  var query = text.trim().toLowerCase()
  var shown = 0
  own(root, '[data-ui-option]', 'select').forEach(function (option) {
    var match = !query || option.textContent.toLowerCase().indexOf(query) >= 0
    option.hidden = !match
    if (match) shown += 1
  })
  var empty = $('[data-ui-empty]', root)
  if (empty) empty.hidden = shown > 0
}
function selectDone(root) {
  closePopups()
  var trigger = $('[data-ui-trigger]', root)
  if (trigger) trigger.focus()
}
document.addEventListener('click', function (event) {
  var root = up(event.target, '[data-ui="select"]')
  if (!root) return
  var option = up(event.target, '[data-ui-option]')
  if (option) { selectChoose(root, option); selectDone(root); return }
  if (!up(event.target, '[data-ui-trigger]')) return
  var popup = $('[data-ui-popup]', root)
  if (!popup) return
  togglePopup(popup)
  var search = $('[data-ui-search]', root)
  if (!popup.hidden && search) search.focus()
})
document.addEventListener('input', function (event) {
  var search = up(event.target, '[data-ui-search]')
  if (search) selectFilter(up(search, '[data-ui="select"]'), search.value)
})
document.addEventListener('keydown', function (event) {
  var root = up(event.target, '[data-ui="select"]')
  var popup = root && $('[data-ui-popup]', root)
  if (!popup) return
  var options = own(root, '[data-ui-option]', 'select').filter(function (option) { return !option.hidden })
  var at = options.indexOf(document.activeElement)
  var arrow = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
  if (arrow && popup.hidden && up(event.target, '[data-ui-trigger]')) { event.preventDefault(); openPopup(popup); if (options[0]) options[0].focus(); return }
  if (popup.hidden) return
  if (arrow && options.length) { event.preventDefault(); options[(at + arrow + options.length) % options.length].focus() }
  else if ((event.key === 'Enter' || event.key === ' ') && at >= 0) { event.preventDefault(); selectChoose(root, options[at]); selectDone(root) }
})
whenReady(function (scope) {
  all(scope, '[data-ui="select"]').forEach(function (root) {
    var options = own(root, '[data-ui-option]', 'select')
    var field = $('[data-ui-input]', root)
    var chosen = $('[data-ui-option][aria-selected="true"]', root) || (field && field.value ? options.filter(function (option) { return optionValue(option) === field.value })[0] : null)
    if (chosen) selectChoose(root, chosen)
    options.forEach(function (option) { option.tabIndex = -1 })
  })
})
