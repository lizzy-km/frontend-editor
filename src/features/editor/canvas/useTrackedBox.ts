import { useEffect, useMemo } from 'react'
import { useFrameStore, watchNode } from '../frame/frame.store'
import { toOverlayBox, type Box, type FramePlacement } from './geometry'

/**
 * Follows a node's on-screen box. The frame measures watched nodes every
 * animation frame (catching scrolling, images, fonts, animations, edits)
 * and only sends boxes that changed, so React re-renders only then.
 */
export function useTrackedBox(id: string | null, placement: FramePlacement): Box | null {
  const rect = useFrameStore((state) => (id ? state.rects[id] ?? null : null))
  const { left, top, scale } = placement

  useEffect(() => (id ? watchNode(id) : undefined), [id])

  return useMemo(() => (rect ? toOverlayBox(rect, { left, top, scale }) : null), [rect, left, top, scale])
}
