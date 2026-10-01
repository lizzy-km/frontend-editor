/*
 * Frame runtime — pictures. Takes the PNG from inside the frame, so it shows
 * the page exactly as it looks with its scripts running. The html-to-image
 * library is sent by the editor the first time a picture is needed.
 */
;(function (fe) {
  function isTransparent(color) {
    return !color || color === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(color)
  }

  /** First non-transparent background going up (pictures need a solid backdrop). */
  function backgroundOf(element) {
    for (var current = element; current; current = current.parentElement) {
      var color = getComputedStyle(current).backgroundColor
      if (!isTransparent(color)) return color
    }
    return '#ffffff'
  }

  // The code comes only from the editor (core.js ignores other senders) and runs in
  // this sandbox, which already runs the page's own untrusted scripts: no new power.
  fe.handlers.loadCapture = function (payload) {
    if (!window.htmlToImage) new Function(payload.code)()
    return Boolean(window.htmlToImage)
  }

  /** { id|null, pixelRatio, topOnly } -> a PNG Blob of the page or one element. */
  fe.handlers.capture = function (payload) {
    if (!window.htmlToImage) throw new Error('Picture tool not loaded')
    var element = payload.id ? fe.element(payload.id) : document.body
    if (!element) throw new Error('Could not find that part of the page.')
    var isPage = element === document.body
    var full = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
    var height = !isPage ? undefined : payload.topOnly ? Math.min(full, Math.round(document.body.clientWidth * 0.625)) : full
    return window.htmlToImage.toBlob(element, {
      pixelRatio: payload.pixelRatio || 2,
      cacheBust: true,
      backgroundColor: backgroundOf(element),
      // Leave out things hidden in the editor (they show faded there).
      filter: function (node) { return !(node.hasAttribute && node.hasAttribute('data-fe-hidden')) },
      height: height,
    }).then(function (blob) {
      if (!blob) throw new Error('The picture came out empty.')
      return blob
    })
  }
})(window.__fe)
