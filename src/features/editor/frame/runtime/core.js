/*
 * Frame runtime — core. Runs INSIDE the editor's sandboxed iframe (no access
 * to the app). Plain JS, embedded as text. Holds a copy of the page model,
 * the node-id -> DOM map, and a tiny message protocol with the editor:
 *   editor -> frame: { fe: 1, type, payload, rid? }   (rid = request id)
 *   frame -> editor: { fe: 1, type, payload, rid? }
 * Other runtime files add handlers to window.__fe.handlers.
 */
;(function () {
  var fe = {
    rootId: '',
    nodes: {},
    dom: new Map(),
    handlers: {},
    post: function (type, payload, rid) {
      parent.postMessage({ fe: 1, type: type, payload: payload, rid: rid }, '*')
    },
  }
  window.__fe = fe

  window.addEventListener('message', function (event) {
    // Only the editor (our parent window) may drive the runtime.
    if (event.source !== parent) return
    var data = event.data
    if (!data || data.fe !== 1 || typeof data.type !== 'string') return
    var handler = fe.handlers[data.type]
    if (!handler) return
    Promise.resolve()
      .then(function () { return handler(data.payload || {}) })
      .then(
        function (result) { if (data.rid) fe.post('reply', { ok: true, value: result }, data.rid) },
        function (error) { if (data.rid) fe.post('reply', { ok: false, error: String(error && error.message || error) }, data.rid) },
      )
  })

  /** The element (or text node) for a node id, if it is on the page. */
  fe.node = function (id) { return (id && fe.dom.get(id)) || null }
  fe.element = function (id) {
    var node = fe.node(id)
    return node && node.nodeType === 1 ? node : null
  }
})()
