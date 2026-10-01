import type { FrameBridge } from '@/features/editor/frame/bridge'
import { useFrameStore } from '@/features/editor/frame/frame.store'

type CaptureOptions = {
  /** 2 = sharp download (default); ~0.3 = small thumbnail. */
  pixelRatio?: number
  /** Only the top of the page, in a 16:10 card shape (for thumbnails). */
  topOnly?: boolean
}

/** Frames that already have the picture library (sent once per frame). */
const loaded = new WeakSet<FrameBridge>()

/**
 * The picture library goes into the frame as text the first time it's needed.
 * It's the app's own bundled copy (never page or user code); the frame runs it
 * in its sandbox, where the page's own scripts already run.
 */
async function loadPictureTool(bridge: FrameBridge) {
  if (loaded.has(bridge)) return
  const { default: code } = await import('html-to-image/dist/html-to-image.js?raw')
  await bridge.request('loadCapture', { code })
  loaded.add(bridge)
}

/**
 * Takes a picture of the whole page or one element, inside the live frame
 * (runtime/capture.js), so fonts, images and script-drawn parts match what
 * the user sees.
 */
export async function capturePng(id: string | null, { pixelRatio = 2, topOnly = false }: CaptureOptions = {}): Promise<Blob> {
  const bridge = useFrameStore.getState().bridge
  if (!bridge) throw new Error('The page is still loading — try again in a second.')
  await loadPictureTool(bridge)
  return bridge.request<Blob>('capture', { id, pixelRatio, topOnly })
}
