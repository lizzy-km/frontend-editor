import { verifyFirebaseUser } from './auth'
import { corsHeaders, json, type Env } from './http'

const MAX_BYTES = 5 * 1024 * 1024

/** Raster images only. SVG is refused: it can carry scripts. */
const EXTENSIONS: Record<string, string> = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif',
}

const randomName = () => crypto.randomUUID().replace(/-/g, '')

/** Only letters, digits, - and _ may appear in a key segment. */
const safeSegment = (value: string | null) => (value && /^[A-Za-z0-9_-]{1,64}$/.test(value) ? value : null)

/**
 * POST /upload?kind=image
 * POST /upload?kind=thumbnail&project=<projectId>
 * Body: the raw image bytes. Header: Authorization: Bearer <Firebase ID token>.
 */
export async function handleUpload(request: Request, env: Env, url: URL): Promise<Response> {
  const cors = corsHeaders(request, env)
  const uid = await verifyFirebaseUser(request, env.FIREBASE_PROJECT_ID)
  if (!uid) return json({ error: 'Please sign in again.' }, 401, cors)

  const type = (request.headers.get('Content-Type') ?? '').split(';')[0]!.trim()
  const extension = EXTENSIONS[type]
  if (!extension) return json({ error: 'Only PNG, JPG, WebP, GIF or AVIF pictures.' }, 415, cors)
  if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BYTES) return json({ error: 'Pictures can be up to 5 MB.' }, 413, cors)

  const bytes = await request.arrayBuffer()
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) return json({ error: 'Pictures can be up to 5 MB.' }, 413, cors)

  const kind = url.searchParams.get('kind')
  const project = safeSegment(url.searchParams.get('project'))
  if (kind === 'thumbnail' && !project) return json({ error: 'Missing project.' }, 400, cors)
  const key = kind === 'thumbnail' ? `thumbs/${uid}/${project}.${extension}` : `u/${uid}/${randomName()}.${extension}`

  await env.ASSETS.put(key, bytes, {
    httpMetadata: { contentType: type, cacheControl: kind === 'thumbnail' ? 'public, max-age=300' : 'public, max-age=31536000, immutable' },
  })
  const version = kind === 'thumbnail' ? `?v=${Date.now()}` : ''
  return json({ url: `${url.origin}/a/${key}${version}` }, 201, cors)
}
