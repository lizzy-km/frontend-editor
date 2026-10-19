import { FLAG_ATTR, FLAG_MODE_ATTR, usesFlagClicks } from '../flagClicks'
import { FLAGS_ATTR, type Viewer } from '../conditions'
import type { PageDoc } from '../types'

/**
 * Lets clicks turn flags on and off for visitors (Preview, public view, .html downloads). Boxes with
 * "Only when these flags are on" stay in the page and are shown or hidden here. The flags are remembered in
 * the browser (when it allows storage); the first time, the flags the viewer already has are on.
 */
export const flagScript = (initial: string[]) => `(function () {
  var KEY = 'tweak:flags', on = null
  try { on = JSON.parse(localStorage.getItem(KEY) || 'null') } catch (e) { on = null }
  if (!on) { on = {}; ${JSON.stringify(initial)}.forEach(function (name) { on[name] = true }) }
  function show() {
    document.querySelectorAll('[${FLAGS_ATTR}]').forEach(function (el) {
      var ok = el.getAttribute('${FLAGS_ATTR}').split(',').every(function (name) { return !name || on[name] })
      if (el.__shown === undefined) el.__shown = el.style.display
      el.style.display = ok ? el.__shown : 'none'
    })
  }
  document.addEventListener('click', function (event) {
    var button = event.target.closest && event.target.closest('[${FLAG_ATTR}]')
    if (!button) return
    var name = button.getAttribute('${FLAG_ATTR}'), mode = button.getAttribute('${FLAG_MODE_ATTR}')
    on[name] = mode === 'on' ? true : mode === 'off' ? false : !on[name]
    try { localStorage.setItem(KEY, JSON.stringify(on)) } catch (e) { /* not allowed here: the flag lasts until the page closes */ }
    show()
  })
  show()
})()`

/** Adds the flag player when a click changes a flag. */
export function withFlagClicks(doc: PageDoc, viewer: Viewer): PageDoc {
  return usesFlagClicks(doc.nodes) ? { ...doc, scripts: [...doc.scripts, { code: flagScript(viewer.flags), inHead: false }] } : doc
}
