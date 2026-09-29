import { useEffect, useState } from 'react'
import { getNodeElement } from '../frame/frame.store'
import { useDocStore } from '../store/doc.store'
import { useViewStore } from '../store/view.store'

export type ComputedStyles = Record<string, string>

/**
 * What the element really looks like right now (after all CSS), refreshed
 * after every edit and screen-size change. Controls show these values so
 * people see real numbers, not blanks.
 */
export function useComputedStyle(id: string | null): ComputedStyles | null {
  const version = useDocStore((state) => state.version)
  const breakpoint = useViewStore((state) => state.breakpoint)
  const [snapshot, setSnapshot] = useState<{ id: string; styles: ComputedStyles } | null>(null)

  useEffect(() => {
    if (!id) return
    // Wait one frame so the iframe has re-laid out after the change.
    const frame = requestAnimationFrame(() => {
      const element = getNodeElement(id)
      const computed = element?.ownerDocument.defaultView?.getComputedStyle(element)
      if (!computed) return
      const styles: ComputedStyles = {}
      for (const property of computed) styles[property] = computed.getPropertyValue(property)
      for (const shorthand of ['border-radius', 'border-width', 'border-color', 'border-style']) {
        styles[shorthand] = computed.getPropertyValue(shorthand)
      }
      setSnapshot({ id, styles })
    })
    return () => cancelAnimationFrame(frame)
  }, [id, version, breakpoint])

  return snapshot?.id === id ? snapshot.styles : null
}
