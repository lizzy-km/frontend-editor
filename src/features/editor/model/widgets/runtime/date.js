/* Calendar and date picker. The 42 day buttons are ordinary elements: this code only changes their numbers and marks. */
var LANG = document.documentElement.lang || undefined
function pad(n) { return (n < 10 ? '0' : '') + n }
function toIso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) }
function fromIso(text) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text || '')
  var d = m && new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return d && d.getMonth() === Number(m[2]) - 1 ? d : null
}
function monthShort(index) { return new Date(2023, index, 1).toLocaleDateString(LANG, { month: 'short' }) }
function formatDate(d, format) {
  return format.replace(/YYYY|MMM|MM|DD|D/g, function (token) {
    return { YYYY: d.getFullYear(), MMM: monthShort(d.getMonth()), MM: pad(d.getMonth() + 1), DD: pad(d.getDate()), D: d.getDate() }[token]
  })
}
function parseDate(text, format) {
  var order = []
  var pattern = format.replace(/[.*+?^$()|[\]\\\/]/g, '\\$&').replace(/YYYY|MMM|MM|DD|D/g, function (token) {
    order.push(token)
    return token === 'YYYY' ? '(\\d{4})' : token === 'MMM' ? '([^\\s\\d]+)' : '(\\d{1,2})'
  })
  var m = new RegExp('^\\s*' + pattern + '\\s*$').exec(text)
  if (!m) return null
  var y = 0, mo = -1, da = 0
  order.forEach(function (token, i) {
    var part = m[i + 1]
    if (token === 'YYYY') y = Number(part)
    else if (token === 'DD' || token === 'D') da = Number(part)
    else if (token === 'MM') mo = Number(part) - 1
    else for (var k = 0; k < 12; k++) if (monthShort(k).toLowerCase().slice(0, 3) === part.toLowerCase().slice(0, 3)) mo = k
  })
  var d = new Date(y, mo, da)
  return y && mo >= 0 && d.getMonth() === mo && d.getDate() === da ? d : null
}
function calRoot(cal) { return up(cal, '[data-ui="calendar"], [data-ui="datepicker"]') }
function calFormat(root) { return root.getAttribute('data-ui-format') || (root.getAttribute('data-ui') === 'calendar' ? 'D MMM YYYY' : 'YYYY-MM-DD') }
function calRender(cal) {
  var root = calRoot(cal)
  var week = root.hasAttribute('data-ui-week') ? Number(root.getAttribute('data-ui-week')) : 1
  var today = toIso(new Date())
  var first = fromIso((cal.getAttribute('data-ui-month') || '') + '-01') || new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  var title = $('[data-ui-title]', cal)
  if (title) title.textContent = first.toLocaleDateString(LANG, { month: 'long', year: 'numeric' })
  $$('[data-ui-weekday]', cal).forEach(function (label, i) { label.textContent = new Date(2023, 0, 1 + ((week + i) % 7)).toLocaleDateString(LANG, { weekday: 'short' }) })
  var start = new Date(first.getFullYear(), first.getMonth(), 1 - ((first.getDay() - week + 7) % 7))
  var selected = cal.getAttribute('data-ui-selected')
  var marks = (root.getAttribute('data-ui-marks') || '').split(',').map(function (item) { return item.trim() })
  var min = root.getAttribute('data-ui-min'), max = root.getAttribute('data-ui-max')
  var focusable = null
  $$('[data-ui-day]', cal).forEach(function (button, i) {
    var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    var iso = toIso(d)
    var out = d.getMonth() !== first.getMonth()
    button.textContent = String(d.getDate())
    button.setAttribute('data-date', iso)
    toggle(button, 'data-out', out); toggle(button, 'data-today', iso === today); toggle(button, 'data-mark', marks.indexOf(iso) >= 0)
    button.setAttribute('aria-selected', iso === selected ? 'true' : 'false')
    button.disabled = Boolean((min && iso < min) || (max && iso > max))
    button.tabIndex = -1
    if (!out && !button.disabled && (iso === selected || (!focusable && iso >= (selected || today)))) focusable = button
  })
  if (focusable) focusable.tabIndex = 0
}
function toggle(el, name, on) { if (on) el.setAttribute(name, ''); else el.removeAttribute(name) }
function calShow(cal, d) {
  cal.setAttribute('data-ui-month', d.getFullYear() + '-' + pad(d.getMonth() + 1))
  calRender(cal)
}
function calPick(cal, iso) {
  var d = fromIso(iso)
  var root = calRoot(cal)
  if (!d) return
  cal.setAttribute('data-ui-selected', iso)
  calShow(cal, d)
  var out = $('[data-ui-output]', root)
  if (out) out.textContent = d.toLocaleDateString(LANG, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  var input = root.getAttribute('data-ui') === 'datepicker' ? $('[data-ui-input]', root) : null
  if (input) { input.value = formatDate(d, calFormat(root)); fire(input, 'input'); fire(input, 'change'); closePopups(); var trigger = $('[data-ui-trigger]', root); if (trigger) trigger.focus() }
  root.dispatchEvent(new CustomEvent('ui:select', { bubbles: true, detail: { date: iso } }))
}
function calMonthOf(cal) { return fromIso((cal.getAttribute('data-ui-month') || '') + '-01') || new Date() }
document.addEventListener('click', function (event) {
  var cal = up(event.target, '[data-ui-cal]')
  if (!cal) return
  var day = up(event.target, '[data-ui-day]')
  var month = calMonthOf(cal)
  if (day) calPick(cal, day.getAttribute('data-date'))
  else if (up(event.target, '[data-ui-prev]')) calShow(cal, new Date(month.getFullYear(), month.getMonth() - 1, 1))
  else if (up(event.target, '[data-ui-next]')) calShow(cal, new Date(month.getFullYear(), month.getMonth() + 1, 1))
  else if (up(event.target, '[data-ui-today]')) calPick(cal, toIso(new Date()))
})
document.addEventListener('keydown', function (event) {
  var day = up(event.target, '[data-ui-day]')
  var cal = up(day, '[data-ui-cal]')
  var move = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key]
  if (!cal || !move) return
  event.preventDefault()
  var from = fromIso(day.getAttribute('data-date'))
  var to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + move)
  if (to.getMonth() !== calMonthOf(cal).getMonth()) calShow(cal, to)
  var next = $('[data-ui-day][data-date="' + toIso(to) + '"]', cal)
  if (next) { $$('[data-ui-day]', cal).forEach(function (button) { button.tabIndex = -1 }); next.tabIndex = 0; next.focus() }
})
/* Date picker: the box opens on click, and typing a date moves the calendar. */
function pickerSync(root) {
  var cal = $('[data-ui-cal]', root)
  var input = $('[data-ui-input]', root)
  if (!cal || !input) return
  var d = parseDate(input.value, calFormat(root))
  if (d) { cal.setAttribute('data-ui-selected', toIso(d)); calShow(cal, d) } else { cal.removeAttribute('data-ui-selected'); calRender(cal) }
}
document.addEventListener('click', function (event) {
  var root = up(event.target, '[data-ui="datepicker"]')
  var popup = root && $('[data-ui-popup]', root)
  if (!popup || up(event.target, '[data-ui-popup]')) return
  if (up(event.target, '[data-ui-trigger]')) { if (popup.hidden) pickerSync(root); togglePopup(popup) }
  else if (up(event.target, '[data-ui-input]') && popup.hidden) { pickerSync(root); openPopup(popup) }
})
document.addEventListener('change', function (event) {
  var root = up(event.target, '[data-ui="datepicker"]')
  if (root && event.target === $('[data-ui-input]', root)) pickerSync(root)
})
whenReady(function (scope) {
  all(scope, '[data-ui-cal]').forEach(calRender)
  all(scope, '[data-ui="datepicker"]').forEach(pickerSync)
})
