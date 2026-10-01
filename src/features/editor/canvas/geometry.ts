import { askFrame, type FrameRect } from '../frame/frame.store'

export type Box = { x: number; y: number; width: number; height: number }

/** Where the iframe sits inside the canvas container, plus its zoom. */
export type FramePlacement = { left: number; top: number; scale: number }

/** Converts a box inside the frame (frame-viewport pixels) to overlay (container) pixels. */
export function toOverlayBox(rect: FrameRect, placement: FramePlacement): Box {
  return {
    x: placement.left + rect.x * placement.scale,
    y: placement.top + rect.y * placement.scale,
    width: rect.width * placement.scale,
    height: rect.height * placement.scale,
  }
}

/** Converts overlay pixels to iframe viewport pixels. */
export function toFramePoint(x: number, y: number, placement: FramePlacement) {
  return { x: (x - placement.left) / placement.scale, y: (y - placement.top) / placement.scale }
}

/** The node under an overlay point, or null outside the page. */
export function nodeIdAt(x: number, y: number, placement: FramePlacement): Promise<string | null> {
  return askFrame<string>('hit', toFramePoint(x, y, placement))
}

export function sameBox(a: Box | null, b: Box | null): boolean {
  if (!a || !b) return a === b
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
}
