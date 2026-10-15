import { embeddedPictures, replaceEmbedded } from '@/features/editor/model/embedded'
import { updateDoc } from '@/features/editor/actions/commit'
import { getDoc } from '@/features/editor/store/doc.store'
import { canUpload, uploadImage } from './uploadImage'

export type MoveResult = { moved: number; skipped: number }

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

/** A data:image/…;base64,… text as a picture file. */
async function toBlob(uri: string): Promise<Blob> {
  return (await fetch(uri)).blob()
}

/**
 * Uploads every picture pasted inside the code and puts its address in its place (one undo step).
 * Pictures over 5 MB are left (and counted as skipped). Throws when uploads aren't available.
 */
export async function movePicturesOut(): Promise<MoveResult> {
  if (!canUpload()) throw new Error('Pictures can’t be uploaded right now. Sign in, or give each picture as a link instead.')
  const found = embeddedPictures(getDoc())
  const map: Record<string, string> = {}
  let skipped = 0
  for (const uri of found) {
    const blob = await toBlob(uri)
    if (blob.size > MAX_UPLOAD_BYTES) { skipped++; continue }
    map[uri] = await uploadImage(blob, { kind: 'image' })
  }
  const moved = Object.keys(map).length
  if (moved) updateDoc((doc) => replaceEmbedded(doc, map))
  return { moved, skipped }
}
