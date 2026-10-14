/*
 * Frame runtime — start. Runs after the page body is parsed and BEFORE the
 * page's own scripts, so the model is linked to the untouched DOM first.
 */
;(function (fe) {
  fe.start()
  if (fe.initialData) fe.handlers.data({ sources: fe.initialData })
  fe.post('ready', { rootId: fe.rootId })
})(window.__fe)
