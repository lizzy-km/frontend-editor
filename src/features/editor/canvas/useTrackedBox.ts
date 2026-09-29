import { useEffect, useState } from 'react'
import { getNodeElement } from '../frame/frame.store'
import { sameBox, toOverlayBox, type Box, type FramePlacement } from './geometry'

/**
 * Follows a node's on-screen box every animation frame.
 * Measuring 1-2 elements per frame is cheap and it catches everything that
 * moves them: scrolling, images loading, fonts, CSS animations, edits.
 * React only re-renders when the box actually changes.
 */
export function useTrackedBox(id: string | null, placement: FramePlacement): Box | null {
  const [tracked, setTracked] = useState<{ id: string; box: Box | null } | null>(null)
  const { left, top, scale } = placement

  useEffect(() => {
    if (!id) return
    let frame = 0
    let last: Box | null = null
    const tick = () => {
      const element = getNodeElement(id)
      const next = element ? toOverlayBox(element, { left, top, scale }) : null
      if (!sameBox(last, next)) {
        last = next
        setTracked({ id, box: next })
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [id, left, top, scale])

  // A box measured for a previous id is never shown for the new one.
  return id && tracked?.id === id ? tracked.box : null
}
