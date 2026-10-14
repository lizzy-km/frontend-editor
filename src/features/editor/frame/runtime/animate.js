/*
 * Frame runtime — animation preview. Animations don't run while editing
 * (things would vanish while you work); the Play button sends the keyframes
 * here to show one run. "One by one" plays the children in turn.
 */
;(function (fe) {
  /** { id, frames: [css…], duration, delay, easing, stagger } (seconds). */
  fe.handlers.play = function (payload) {
    var element = fe.element(payload.id)
    if (!element || !element.animate) return
    var parts = payload.stagger ? Array.prototype.slice.call(element.children) : [element]
    parts.forEach(function (part, index) {
      part.animate(payload.frames, {
        duration: payload.duration * 1000,
        delay: (payload.delay + index * payload.stagger) * 1000,
        easing: payload.easing,
      })
    })
  }
})(window.__fe)
