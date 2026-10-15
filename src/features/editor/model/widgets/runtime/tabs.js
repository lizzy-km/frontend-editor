/* Tabs: click or arrow keys show one panel and hide the others. */
function selectTab(tab) {
  var root = up(tab, '[data-ui="tabs"]')
  if (!root) return
  var key = tab.getAttribute('data-ui-tab')
  own(root, '[data-ui-tab]', 'tabs').forEach(function (other) {
    var on = other === tab
    other.setAttribute('aria-selected', on ? 'true' : 'false')
    other.tabIndex = on ? 0 : -1
  })
  own(root, '[data-ui-panel]', 'tabs').forEach(function (panel) { panel.hidden = panel.getAttribute('data-ui-panel') !== key })
}
document.addEventListener('click', function (event) {
  var tab = up(event.target, '[data-ui-tab]')
  if (tab) selectTab(tab)
})
document.addEventListener('keydown', function (event) {
  var tab = up(event.target, '[data-ui-tab]')
  var root = up(tab, '[data-ui="tabs"]')
  if (!root) return
  var tabs = own(root, '[data-ui-tab]', 'tabs')
  var at = tabs.indexOf(tab)
  var step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
  var next = step ? tabs[(at + step + tabs.length) % tabs.length] : event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[tabs.length - 1] : null
  if (!next) return
  event.preventDefault()
  next.focus()
  selectTab(next)
})
