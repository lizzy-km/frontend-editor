import { useCallback, useRef } from 'react'
import { canUpload, uploadImage } from '@/features/assets/uploadImage'
import { capturePng } from '@/features/export/capturePng'
import { setProjectThumbnail } from './api/projectContent'

/** Don't re-draw the card picture more often than this. */
const MIN_GAP_MS = 2 * 60 * 1000

/**
 * Returns `refresh()`: takes a small picture of the top of the page and
 * stores it as the project's card picture. Throttled, quiet on failure
 * (a missing thumbnail is never worth bothering the user about).
 */
export function useThumbnail(projectId: string) {
  const last = useRef(0)

  return useCallback(async (force = false) => {
    if (!canUpload()) return
    const now = Date.now()
    if (!force && now - last.current < MIN_GAP_MS) return
    last.current = now
    try {
      const picture = await capturePng(null, { pixelRatio: 0.35, topOnly: true })
      const url = await uploadImage(picture, { kind: 'thumbnail', projectId })
      await setProjectThumbnail(projectId, url)
    } catch (error) {
      console.warn('Thumbnail skipped:', error)
    }
  }, [projectId])
}
