import { NODE_ATTR } from '../frame/frameRenderer'
import { useFrameStore } from '../frame/frame.store'

export type Box = { x: number; y: number; width: number; height: number }

/** Where the iframe sits inside the canvas container, plus its zoom. */
export type FramePlacement = { left: number; top: number; scale: number }

/** Converts an element's box inside the iframe to overlay (container) pixels. */
export function toOverlayBox(element: Element, placement: FramePlacement): Box {
  const rect = element.getBoundingClientRect()
  return {
    x: placement.left + rect.left * placement.scale,
    y: placement.top + rect.top * placement.scale,
    width: rect.width * placement.scale,
    height: rect.height * placement.scale,
  }
}

/** Converts overlay pixels to iframe viewport pixels. */
export function toFramePoint(x: number, y: number, placement: FramePlacement) {
  return { x: (x - placement.left) / placement.scale, y: (y - placement.top) / placement.scale }
}

/** The node under an overlay point, or null outside the page. */
export function nodeIdAt(x: number, y: number, placement: FramePlacement): string | null {
  const frameDoc = useFrameStore.getState().iframe?.contentDocument
  if (!frameDoc) return null
  const point = toFramePoint(x, y, placement)
  const view = frameDoc.defaultView
  if (!view || point.x < 0 || point.y < 0 || point.x > view.innerWidth || point.y > view.innerHeight) return null

  const hit = frameDoc.elementFromPoint(point.x, point.y)
  return hit?.closest(`[${NODE_ATTR}]`)?.getAttribute(NODE_ATTR) ?? null
}

export function sameBox(a: Box | null, b: Box | null): boolean {
  if (!a || !b) return a === b
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
}
