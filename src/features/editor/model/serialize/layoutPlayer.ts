import { NAV_ATTR, TOGGLE_ATTR } from '../layouts'
import { isElement, type PageDoc } from '../types'

/**
 * Makes the ready-made layouts work for visitors (Preview, public view, .html
 * downloads): the ☰ button opens and closes the menu on phones, a menu link
 * closes it, and in downloaded files the link to the open page is highlighted.
 */
export const LAYOUT_SCRIPT = `(function () {
  var body = document.body
  document.addEventListener('click', function (event) {
    var target = event.target
    if (!target.closest) return
    if (target.closest('[${TOGGLE_ATTR}]')) { body.classList.toggle('menu-open'); return }
    if (target.closest('[${NAV_ATTR}]')) body.classList.remove('menu-open')
  })
  var here = location.pathname.split('/').pop() || 'index.html'
  document.querySelectorAll('a[${NAV_ATTR}]').forEach(function (link) {
    if ((link.getAttribute('href') || '').split('/').pop() === here) { link.classList.add('active'); link.setAttribute('aria-current', 'page') }
  })
})()`

/** Adds the layout player when the page has a menu button or menu links. */
export function withLayouts(doc: PageDoc): PageDoc {
  const used = Object.values(doc.nodes).some((node) => isElement(node) && (TOGGLE_ATTR in node.attrs || NAV_ATTR in node.attrs))
  return used ? { ...doc, scripts: [...doc.scripts, { code: LAYOUT_SCRIPT, inHead: false }] } : doc
}
