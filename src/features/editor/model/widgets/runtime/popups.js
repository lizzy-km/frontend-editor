/* Pop-over boxes (select list, date picker) and menus: one open at a time, closed by Esc or a click outside. */
function closePopups(except) {
  $$('[data-ui-popup]').forEach(function (popup) {
    if (popup === except || popup.hidden) return
    popup.hidden = true
    var trigger = $('[data-ui-trigger]', up(popup, '[data-ui]'))
    if (trigger) trigger.setAttribute('aria-expanded', 'false')
  })
  $$('details[data-ui="menu"][open]').forEach(function (menu) { if (!except || !menu.contains(except)) menu.open = false })
}
function openPopup(popup) {
  closePopups(popup)
  popup.hidden = false
  var trigger = $('[data-ui-trigger]', up(popup, '[data-ui]'))
  if (trigger) trigger.setAttribute('aria-expanded', 'true')
}
function togglePopup(popup) { if (popup.hidden) openPopup(popup); else closePopups() }
document.addEventListener('click', function (event) {
  var inside = up(event.target, '[data-ui="select"], [data-ui="datepicker"], details[data-ui="menu"]')
  if (!inside) closePopups()
  else if (up(event.target, 'details[data-ui="menu"] a')) closePopups()
})
document.addEventListener('keydown', function (event) {
  if (event.key !== 'Escape') return
  var open = $('[data-ui-popup]:not([hidden])') || $('details[data-ui="menu"][open]')
  if (!open) return
  var trigger = $('[data-ui-trigger], summary', up(open, '[data-ui]'))
  closePopups()
  if (trigger) trigger.focus()
})
