import { features } from '@/config/features.config'
import { authService, useAuthStore } from '@/features/auth/auth.store'

const ASSETS_URL = (import.meta.env.VITE_ASSETS_URL ?? '').replace(/\/$/, '')

/** Pictures this small can live inside the page itself when uploads aren't available. */
export const MAX_EMBED_BYTES = 400 * 1024
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const PICTURE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']

/** Uploads work when the worker is configured AND someone is signed in. */
export const canUpload = () => features.enable_uploads && useAuthStore.getState().status === 'signedIn'

type UploadOptions = { kind: 'image' } | { kind: 'thumbnail'; projectId: string }

/** Sends a picture to the R2 worker and returns its public address. */
export async function uploadImage(file: Blob, options: UploadOptions): Promise<string> {
  const token = await (await authService()).getIdToken()
  if (!token) throw new Error('Please sign in again to upload pictures.')
  const query = options.kind === 'thumbnail' ? `kind=thumbnail&project=${encodeURIComponent(options.projectId)}` : 'kind=image'

  const response = await fetch(`${ASSETS_URL}/upload?${query}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': file.type },
    body: file,
  })
  const body = (await response.json().catch(() => ({}))) as { url?: string; error?: string }
  if (!response.ok || !body.url) throw new Error(body.error ?? 'The upload didn’t work. Please try again.')
  return body.url
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Couldn’t read that file.'))
    reader.readAsDataURL(file)
  })
}

/**
 * A picture from the user's computer -> an address the page can use.
 * Uploads when possible; otherwise small pictures are embedded in the page.
 */
export async function pictureFromFile(file: File): Promise<string> {
  if (!PICTURE_TYPES.includes(file.type)) throw new Error('Please choose a PNG, JPG, WebP, GIF or AVIF picture.')
  if (canUpload()) {
    if (file.size > MAX_UPLOAD_BYTES) throw new Error('Pictures can be up to 5 MB.')
    return uploadImage(file, { kind: 'image' })
  }
  if (file.size > MAX_EMBED_BYTES) {
    throw new Error('That picture is too big to add here. Make it smaller (under 400 KB) or paste a picture link instead.')
  }
  return readAsDataUrl(file)
}
