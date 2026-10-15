/* Small helpers on inputs: show/hide password, number steppers, clear search, character counter. */
function fieldInput(button) { return $('input', up(button, '[data-ui-wrap]') || button.parentNode) }
document.addEventListener('click', function (event) {
  var reveal = up(event.target, '[data-ui-reveal]')
  var step = up(event.target, '[data-ui-step]')
  var clear = up(event.target, '[data-ui-clear]')
  if (reveal) {
    var secret = fieldInput(reveal)
    if (!secret) return
    var show = secret.type === 'password'
    secret.type = show ? 'text' : 'password'
    reveal.setAttribute('aria-pressed', show ? 'true' : 'false')
    reveal.textContent = show ? 'Hide' : 'Show'
  } else if (step) {
    var number = fieldInput(step)
    if (!number) return
    if (Number(step.getAttribute('data-ui-step')) > 0) number.stepUp(); else number.stepDown()
    fire(number, 'input'); fire(number, 'change')
  } else if (clear) {
    var box = fieldInput(clear)
    if (box) { box.value = ''; fire(box, 'input'); box.focus() }
  }
})
function showCount(input) {
  var counter = $('[data-ui-count]', up(input, '[data-ui="field"]'))
  if (counter) counter.textContent = input.value.length + (input.maxLength > 0 ? ' / ' + input.maxLength : '')
}
document.addEventListener('input', function (event) { if (up(event.target, '[data-ui="field"]')) showCount(event.target) })
whenReady(function (scope) { all(scope, '[data-ui="field"] textarea, [data-ui="field"] input').forEach(showCount) })
