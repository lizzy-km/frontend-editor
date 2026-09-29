import { getNodeElement, useFrameStore } from '@/features/editor/frame/frame.store'
import { isTransparent } from '@/lib/color'

/** First non-transparent background going up the tree (pictures need a solid backdrop). */
function backgroundOf(element: Element): string {
  const view = element.ownerDocument.defaultView
  for (let current: Element | null = element; current && view; current = current.parentElement) {
    const color = view.getComputedStyle(current).backgroundColor
    if (color && !isTransparent(color)) return color
  }
  return '#ffffff'
}

/** Leave out things hidden in the editor (they show faded there). */
const notHidden = (node: HTMLElement) => !(node.hasAttribute?.('data-fe-hidden'))

type CaptureOptions = {
  /** 2 = sharp download (default); ~0.3 = small thumbnail. */
  pixelRatio?: number
  /** Only the top of the page, in a 16:10 card shape (for thumbnails). */
  topOnly?: boolean
}

/** How tall the picture should be: full page, a 16:10 top crop, or the element itself. */
function captureHeight(frameDoc: Document, isPage: boolean, topOnly: boolean): number | undefined {
  if (!isPage) return undefined
  const full = Math.max(frameDoc.body.scrollHeight, frameDoc.documentElement.scrollHeight)
  return topOnly ? Math.min(full, Math.round(frameDoc.body.clientWidth * 0.625)) : full
}

/**
 * Takes a picture of the whole page or one element, straight from the live
 * iframe (so fonts and images match what the user sees).
 */
export async function capturePng(id: string | null, { pixelRatio = 2, topOnly = false }: CaptureOptions = {}): Promise<Blob> {
  const frameDoc = useFrameStore.getState().iframe?.contentDocument
  if (!frameDoc) throw new Error('The page is still loading — try again in a second.')
  const element = (id ? getNodeElement(id) : frameDoc.body) as HTMLElement | null
  if (!element) throw new Error('Could not find that part of the page.')

  const { toBlob } = await import('html-to-image') // loaded only when needed
  const blob = await toBlob(element, {
    pixelRatio,
    cacheBust: true,
    backgroundColor: backgroundOf(element),
    filter: notHidden,
    height: captureHeight(frameDoc, element === frameDoc.body, topOnly),
  })
  if (!blob) throw new Error('The picture came out empty.')
  return blob
}
