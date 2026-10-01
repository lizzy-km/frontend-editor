import { askFrame, type FrameRect } from '../frame/frame.store'
import { toFramePoint, toOverlayBox, type Box, type FramePlacement } from './geometry'

export type DropTarget = { parentId: string; index: number; indicator: Box }

type FrameDrop = { parentId: string; index: number; indicator: FrameRect }

/**
 * Where would `draggedId` land if dropped at (x, y)? Worked out inside the
 * frame (runtime/drop.js), where the page's real layout is:
 * over a sibling -> reorder; over a container -> nest; over a leaf -> before/after it.
 */
export async function findDropTarget(draggedId: string, x: number, y: number, placement: FramePlacement): Promise<DropTarget | null> {
  const drop = await askFrame<FrameDrop>('drop', { draggedId, ...toFramePoint(x, y, placement) })
  return drop && { parentId: drop.parentId, index: drop.index, indicator: toOverlayBox(drop.indicator, placement) }
}
