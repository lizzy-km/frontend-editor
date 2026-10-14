import { ANIMATE_ATTR, easingCss, EFFECTS, poseCss, REST } from '../animations'
import { hiddenFor, VISITOR, type Viewer } from '../conditions'
import { isPageNode } from '../pages'
import { removeNode } from '../tree/treeOps'
import { isElement, type PageDoc } from '../types'
import { expandDataLists } from './expandLists'

const effects = Object.fromEntries(EFFECTS.map((effect) => [effect.value, { from: poseCss(effect.from), hover: poseCss(effect.hover) }]))
const eases = { smooth: easingCss('smooth'), spring: easingCss('spring'), linear: easingCss('linear') }

/**
 * Plays data-fe-animate animations for visitors (Preview, downloads) with the
 * Web Animations API: on scroll (IntersectionObserver), on load, on hover or
 * looping; "one by one" staggers the children. Off for "reduce motion".
 */
export const ANIMATION_SCRIPT = `(function () {
  if (!document.body.animate || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return
  var FX = ${JSON.stringify(effects)}
  var REST = ${JSON.stringify(poseCss(REST))}
  var EASE = ${JSON.stringify(eases)}
  function options(el) {
    return { duration: (Number(el.getAttribute('data-fe-duration')) || 0.6) * 1000, delay: (Number(el.getAttribute('data-fe-delay')) || 0) * 1000,
      easing: EASE[el.getAttribute('data-fe-ease')] || EASE.smooth, fill: 'both' }
  }
  function entrance(el, fx) {
    var stagger = Number(el.getAttribute('data-fe-stagger')) || 0
    var parts = stagger ? Array.prototype.slice.call(el.children) : [el]
    return parts.map(function (part, index) {
      var o = options(el)
      o.delay += index * stagger * 1000
      var run = part.animate([fx.from, REST], o)
      run.pause()
      return run
    })
  }
  document.querySelectorAll('[${ANIMATE_ATTR}]').forEach(function (el) {
    var fx = FX[el.getAttribute('${ANIMATE_ATTR}')]
    if (!fx) return
    var trigger = el.getAttribute('data-fe-trigger') || 'scroll'
    if (trigger === 'hover') {
      var h = options(el); h.delay = 0; h.fill = 'forwards'
      el.addEventListener('mouseenter', function () { el.animate([REST, fx.hover], h) })
      el.addEventListener('mouseleave', function () { el.animate([fx.hover, REST], h) })
      return
    }
    if (trigger === 'loop') {
      var l = options(el); l.iterations = Infinity; l.direction = 'alternate'
      el.animate([REST, fx.hover], l)
      return
    }
    var runs = entrance(el, fx)
    if (trigger === 'load') return runs.forEach(function (run) { run.play() })
    var again = el.hasAttribute('data-fe-repeat')
    var watcher = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runs.forEach(function (run) { run.play() })
          if (!again) watcher.unobserve(el)
        } else if (again) {
          runs.forEach(function (run) { run.pause(); run.currentTime = 0 })
        }
      })
    }, { threshold: 0.15 })
    watcher.observe(el)
  })
})()`

/** Adds the animation player when something on the page is animated. */
function withAnimations(doc: PageDoc): PageDoc {
  const animated = Object.values(doc.nodes).some((node) => isElement(node) && node.attrs[ANIMATE_ATTR])
  return animated ? { ...doc, scripts: [...doc.scripts, { code: ANIMATION_SCRIPT, inHead: false }] } : doc
}

/** Leaves out what this viewer can't see (pages themselves stay: routing decides those). */
function forViewer(doc: PageDoc, viewer: Viewer): PageDoc {
  const hidden = hiddenFor(doc.nodes, viewer).filter((id) => !isPageNode(doc.nodes[id]))
  if (!hidden.length) return doc
  let nodes = doc.nodes
  for (const id of hidden) if (nodes[id]) nodes = removeNode(nodes, id)
  return { ...doc, nodes }
}

/**
 * The page as visitors get it (Preview, public view, downloads): only what this
 * viewer may see (downloads: a signed-out visitor), lists filled with their
 * data rows, and the animation player added.
 */
export const forVisitors = (doc: PageDoc, viewer: Viewer = VISITOR): PageDoc => withAnimations(expandDataLists(forViewer(doc, viewer)))
