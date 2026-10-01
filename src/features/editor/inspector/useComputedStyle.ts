import { useEffect, useState } from 'react'
import { askFrame } from '../frame/frame.store'
import { useDocStore } from '../store/doc.store'
import { useViewStore } from '../store/view.store'

export type ComputedStyles = Record<string, string>

/**
 * What the element really looks like right now (after all CSS), refreshed
 * after every edit and screen-size change. Controls show these values so
 * people see real numbers, not blanks. Asked from the frame, which gets the
 * edit first (messages arrive in order), so the answer is never stale.
 */
export function useComputedStyle(id: string | null): ComputedStyles | null {
  const version = useDocStore((state) => state.version)
  const breakpoint = useViewStore((state) => state.breakpoint)
  const [snapshot, setSnapshot] = useState<{ id: string; styles: ComputedStyles } | null>(null)

  useEffect(() => {
    if (!id) return
    let current = true
    // Wait one frame so a screen-size change has resized the frame first.
    const frame = requestAnimationFrame(() => {
      void askFrame<ComputedStyles>('computed', { id }).then((styles) => {
        if (current && styles) setSnapshot({ id, styles })
      })
    })
    return () => {
      current = false
      cancelAnimationFrame(frame)
    }
  }, [id, version, breakpoint])

  return snapshot?.id === id ? snapshot.styles : null
}
