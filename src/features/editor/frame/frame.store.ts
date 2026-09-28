import { create } from 'zustand'
import type { FrameRenderer } from './frameRenderer'

type FrameState = {
  iframe: HTMLIFrameElement | null
  renderer: FrameRenderer | null
  setFrame: (iframe: HTMLIFrameElement | null, renderer: FrameRenderer | null) => void
}

/** Lets the overlay, text editor and exporters reach the live iframe. */
export const useFrameStore = create<FrameState>((set) => ({
  iframe: null,
  renderer: null,
  setFrame: (iframe, renderer) => set({ iframe, renderer }),
}))

/** The rendered DOM element for a node, or null if it isn't on screen. */
export function getNodeElement(id: string | null): Element | null {
  if (!id) return null
  const dom = useFrameStore.getState().renderer?.getDom(id)
  return dom instanceof Element || (dom && dom.nodeType === Node.ELEMENT_NODE) ? (dom as Element) : null
}
