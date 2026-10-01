/*
 * Frame runtime — start. Runs after the page body is parsed and BEFORE the
 * page's own scripts, so the model is linked to the untouched DOM first.
 */
;(function (fe) {
  fe.start()
  fe.post('ready', { rootId: fe.rootId })
})(window.__fe)
