import { MATCH_ATTR, MESSAGE_ATTR, SUBMIT_ATTR, SUCCESS_ATTR } from '../forms'
import { isElement, type PageDoc } from '../types'

/**
 * Makes forms set up in the editor work for visitors (Preview, public view,
 * .html downloads): the browser checks the rules, "must match" and own error
 * messages are added, and sending posts the answers as JSON to the form's
 * address (or just thanks the visitor when there is none).
 */
export const FORM_SCRIPT = `(function () {
  function note(form, text, failed) {
    var old = form.querySelector('[data-fe-note]')
    if (old) old.remove()
    var p = document.createElement('p')
    p.setAttribute('data-fe-note', '')
    p.setAttribute('role', failed ? 'alert' : 'status')
    p.style.cssText = 'margin: 0; font-weight: 600; color: ' + (failed ? '#b91c1c' : 'inherit')
    p.textContent = text
    if (failed) form.appendChild(p)
    else form.replaceChildren(p)
  }
  function checkMatches(form) {
    form.querySelectorAll('[${MATCH_ATTR}]').forEach(function (field) {
      var other = form.elements.namedItem(field.getAttribute('${MATCH_ATTR}'))
      var differs = other && 'value' in other && other.value !== field.value
      field.setCustomValidity(differs ? field.getAttribute('${MESSAGE_ATTR}') || 'This doesn\\u2019t match.' : '')
    })
  }
  document.querySelectorAll('form[${SUBMIT_ATTR}]').forEach(function (form) {
    form.addEventListener('input', function (event) {
      var field = event.target
      if (field.hasAttribute && field.hasAttribute('${MESSAGE_ATTR}') && !field.hasAttribute('${MATCH_ATTR}')) field.setCustomValidity('')
      checkMatches(form)
    })
    form.addEventListener('invalid', function (event) {
      var field = event.target
      var own = field.getAttribute('${MESSAGE_ATTR}')
      if (own && !field.validity.customError) field.setCustomValidity(own)
    }, true)
    form.addEventListener('submit', function (event) {
      event.preventDefault()
      checkMatches(form)
      if (!form.reportValidity()) return
      var thanks = form.getAttribute('${SUCCESS_ATTR}') || 'Thank you!'
      var address = form.getAttribute('action') || ''
      if (form.getAttribute('${SUBMIT_ATTR}') !== 'send' || !/^(https?:)?\\//i.test(address)) return note(form, thanks)
      var answers = {}
      new FormData(form).forEach(function (value, name) { answers[name] = typeof value === 'string' ? value : value.name })
      var button = form.querySelector('[type=submit], button:not([type])')
      if (button) button.disabled = true
      fetch(address, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(answers) })
        .then(function (answer) { if (!answer.ok) throw new Error(String(answer.status)); note(form, thanks) })
        .catch(function () { if (button) button.disabled = false; note(form, 'Couldn\\u2019t send. Please try again.', true) })
    })
  })
})()`

/** Adds the form player when a form was set up in the editor. */
export function withForms(doc: PageDoc): PageDoc {
  const used = Object.values(doc.nodes).some((node) => isElement(node) && node.tag === 'form' && node.attrs[SUBMIT_ATTR])
  return used ? { ...doc, scripts: [...doc.scripts, { code: FORM_SCRIPT, inHead: false }] } : doc
}
