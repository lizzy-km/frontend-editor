import { create } from 'zustand'
import type { FrameBridge } from './bridge'

/** A box in frame-viewport pixels (before canvas zoom). */
export type FrameRect = { x: number; y: number; width: number; height: number }

type FrameState = {
  bridge: FrameBridge | null
  /** Live boxes of the watched nodes, streamed by the frame every animation frame. */
  rects: Record<string, FrameRect | null>
  setBridge: (bridge: FrameBridge | null) => void
}

/** How many hooks watch each node (hover box, selection box, text editor…). */
const watchers = new Map<string, number>()

const sendWatchList = (bridge: FrameBridge | null) => bridge?.send('watch', { ids: [...watchers.keys()] })

/** Lets the overlay, text editor and exporters reach the live frame. */
export const useFrameStore = create<FrameState>((set) => ({
  bridge: null,
  rects: {},
  setBridge: (bridge) => {
    set({ bridge, rects: {} })
    if (!bridge) return
    bridge.on('rects', (changed) => set((state) => ({ rects: { ...state.rects, ...(changed as FrameState['rects']) } })))
    sendWatchList(bridge)
  },
}))

/** Starts streaming a node's box; call the returned function to stop. */
export function watchNode(id: string): () => void {
  watchers.set(id, (watchers.get(id) ?? 0) + 1)
  sendWatchList(useFrameStore.getState().bridge)
  return () => {
    const count = (watchers.get(id) ?? 1) - 1
    if (count > 0) watchers.set(id, count)
    else watchers.delete(id)
    sendWatchList(useFrameStore.getState().bridge)
  }
}

/** Asks the frame something; null when it isn't loaded (or couldn't answer). */
export async function askFrame<T>(type: string, payload?: unknown): Promise<T | null> {
  const bridge = useFrameStore.getState().bridge
  if (!bridge) return null
  try {
    return await bridge.request<T>(type, payload)
  } catch {
    return null
  }
}

/** Tells the frame something (no answer needed). */
export function tellFrame(type: string, payload?: unknown): void {
  useFrameStore.getState().bridge?.send(type, payload)
}
