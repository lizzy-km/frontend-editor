/*
 * Frame runtime — measure. Answers the editor's questions about the live page:
 * where elements are (streamed every frame for the watched ones), what is
 * under the mouse, and computed styles. Coordinates are frame-viewport pixels.
 */
;(function (fe) {
  var watched = []
  var last = {}

  function box(id) {
    var element = fe.element(id)
    if (!element) return null
    var rect = element.getBoundingClientRect()
    return { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
  }
  fe.box = box

  function same(a, b) {
    if (!a || !b) return a === b
    return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
  }

  /** Measuring 1-3 elements per frame is cheap and follows scroll, images, animations. */
  function tick() {
    var changed = null
    watched.forEach(function (id) {
      var next = box(id)
      if (!same(last[id], next)) {
        last[id] = next
        changed = changed || {}
        changed[id] = next
      }
    })
    if (changed) fe.post('rects', changed)
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)

  /** The ids the editor is drawing outlines for (hover, selection...). */
  fe.handlers.watch = function (payload) {
    watched = (payload.ids || []).filter(Boolean)
    last = {}
  }

  /** Id of the model element under a point (skipping things scripts added). */
  fe.handlers.hit = function (payload) {
    if (payload.x < 0 || payload.y < 0 || payload.x > innerWidth || payload.y > innerHeight) return null
    var hit = document.elementFromPoint(payload.x, payload.y)
    var found = hit && hit.closest('[data-fe-id]')
    return found ? found.getAttribute('data-fe-id') : null
  }

  /** Every computed style of an element (plus handy shorthands). */
  fe.handlers.computed = function (payload) {
    var element = fe.element(payload.id)
    if (!element) return null
    var computed = getComputedStyle(element)
    var styles = {}
    for (var i = 0; i < computed.length; i++) styles[computed[i]] = computed.getPropertyValue(computed[i])
    ;['border-radius', 'border-width', 'border-color', 'border-style'].forEach(function (name) {
      styles[name] = computed.getPropertyValue(name)
    })
    return styles
  }

  /** Scroll the page (the editor's overlay receives the wheel events). */
  fe.handlers.scroll = function (payload) { scrollBy(0, payload.dy || 0) }

  /**
   * Editor-only attributes on the live DOM (never in the model): e.g.
   * data-fe-editing while the text editor covers an element, or "open" on a
   * fold-out being edited. Turning a mark off restores the model's value.
   */
  fe.handlers.mark = function (payload) {
    var element = fe.element(payload.id)
    if (!element) return
    if (payload.on) return element.setAttribute(payload.name, '')
    var node = fe.nodes[payload.id]
    if (!(node && node.attrs && payload.name in node.attrs)) element.removeAttribute(payload.name)
  }
})(window.__fe)
