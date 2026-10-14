import { ASK_ATTR, CLOSE_ATTR, MODAL_ATTR, OPEN_ATTR, popupUse } from '../popups'
import type { PageDoc } from '../types'

/**
 * Makes pop-ups and "ask first" work for visitors (Preview, public view, .html
 * downloads). Pop-ups are hidden at load, centred over the page when opened,
 * and closed by their close buttons, Esc or a click outside. "Ask first" shows
 * a small question box before the click goes through.
 */
export const POPUP_SCRIPT = `(function () {
  var current = null, back = null
  var CARD = 'max-width: 420px; width: calc(100% - 48px); padding: 28px; border-radius: 16px; background: #fff; color: #1c1917; box-shadow: 0 24px 60px -20px rgba(0,0,0,.5); font: 16px/1.5 system-ui, sans-serif'
  var BTN = 'font: inherit; font-weight: 700; padding: 10px 18px; border-radius: 10px; cursor: pointer; border: 1px solid #1c1917; '
  function backdrop(styles) {
    var el = document.createElement('div')
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true')
    el.style.cssText = 'position: fixed; inset: 0; z-index: 2147483000; display: flex; align-items: center; justify-content: center; overflow: auto; ' + (styles || '')
    return el
  }
  function open(name) {
    var el = document.querySelector('[${MODAL_ATTR}="' + name + '"]')
    if (!el) return
    if (current) close()
    el.__style = el.getAttribute('style') || ''
    el.style.cssText = el.__style + ';position: fixed; inset: 0; z-index: 2147483000; display: flex; align-items: center; justify-content: center; overflow: auto'
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true')
    document.body.style.overflow = 'hidden'
    back = document.activeElement
    current = el
    var focusable = el.querySelector('button, a[href], input, select, textarea, [tabindex]')
    if (focusable) focusable.focus()
  }
  function close() {
    if (!current) return
    current.style.cssText = current.__style + ';display: none'
    document.body.style.overflow = ''
    current = null
    if (back && back.focus) back.focus()
  }
  function ask(message) {
    return new Promise(function (resolve) {
      var box = backdrop('background: rgba(28,25,23,.55)')
      box.innerHTML = '<div style="' + CARD + '"><p style="margin: 0 0 20px; font-weight: 600"></p><div style="display: flex; gap: 10px; justify-content: flex-end"><button type="button" data-no style="' + BTN + 'background: #fff; color: #1c1917">Cancel</button><button type="button" data-yes style="' + BTN + 'background: #1c1917; color: #fff">Yes</button></div></div>'
      box.querySelector('p').textContent = message
      function done(answer) { document.removeEventListener('keydown', keys, true); box.remove(); resolve(answer) }
      function keys(event) { if (event.key === 'Escape') { event.stopPropagation(); done(false) } }
      box.addEventListener('click', function (event) {
        if (event.target === box || event.target.hasAttribute('data-no')) done(false)
        else if (event.target.hasAttribute('data-yes')) done(true)
      })
      document.addEventListener('keydown', keys, true)
      document.body.appendChild(box)
      box.querySelector('[data-yes]').focus()
    })
  }
  document.querySelectorAll('[${MODAL_ATTR}]').forEach(function (el) { el.style.display = 'none' })
  document.addEventListener('click', function (event) {
    var asking = event.target.closest && event.target.closest('[${ASK_ATTR}]')
    if (!asking || asking.__ok) return
    event.preventDefault(); event.stopImmediatePropagation()
    ask(asking.getAttribute('${ASK_ATTR}')).then(function (yes) {
      if (!yes) return
      asking.__ok = true; asking.click(); asking.__ok = false
    })
  }, true)
  document.addEventListener('click', function (event) {
    var target = event.target
    if (!target.closest) return
    var opener = target.closest('[${OPEN_ATTR}]')
    if (opener) { event.preventDefault(); open(opener.getAttribute('${OPEN_ATTR}')); return }
    if (target.closest('[${CLOSE_ATTR}]')) { event.preventDefault(); close(); return }
    if (current && target === current) close()
  })
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') close() })
})()`

/** Adds the pop-up player when the page has a pop-up, an opener or an "ask first". */
export function withPopups(doc: PageDoc): PageDoc {
  const use = popupUse(doc.nodes)
  return use.modal || use.ask ? { ...doc, scripts: [...doc.scripts, { code: POPUP_SCRIPT, inHead: false }] } : doc
}
