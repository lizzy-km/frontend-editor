import { corsHeaders, json, type Env } from './http'
import { handleUpload } from './upload'

/** Serves a stored file. Locked down so a file can never act like a web page. */
async function serveAsset(env: Env, key: string): Promise<Response> {
  const object = await env.ASSETS.get(key)
  if (!object) return new Response('Not found', { status: 404 })
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('ETag', object.httpEtag)
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('Content-Security-Policy', "default-src 'none'; img-src 'self'")
  headers.set('Access-Control-Allow-Origin', '*') // images are public; lets html-to-image embed them
  return new Response(object.body, { headers })
}

/**
 * Tweak assets worker (Cloudflare R2).
 *   POST /upload  -> store a picture for the signed-in user
 *   GET  /a/<key> -> read it back
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request, env) })
    if (request.method === 'POST' && url.pathname === '/upload') return handleUpload(request, env, url)
    if (request.method === 'GET' && url.pathname.startsWith('/a/')) return serveAsset(env, decodeURIComponent(url.pathname.slice(3)))

    return json({ error: 'Not found' }, 404, corsHeaders(request, env))
  },
} satisfies ExportedHandler<Env>
