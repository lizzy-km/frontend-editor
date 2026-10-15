import type { DataApi } from './types'

/** Asking a real API from the editor ("Test connection"), with answers a non-developer can act on. */
export type ApiTestResult = { ok: true; json: unknown; status: number } | { ok: false; message: string }

const TIMEOUT_MS = 12_000

/** What went wrong, in plain words. `status` is the HTTP status when the API answered. */
export function explainStatus(status: number): string {
  if (status === 401 || status === 403) return `The API says you're not allowed in (${status}). Check the key, and that it is sent the way this API expects.`
  if (status === 404) return 'Nothing at that address (404). Check the address for typos.'
  if (status === 429) return 'The API says too many requests (429). Wait a minute and test again.'
  if (status >= 500) return `The API had a problem (${status}). Try again later.`
  return `The API answered with an error (${status}).`
}

/** Does the text look like a web address we can call? */
export function checkAddress(url: string): string | null {
  try {
    const parsed = new URL(url.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? null : 'The address must start with https:// (or http://).'
  } catch {
    return 'That doesn’t look like a web address. It should start with https://, like https://api.example.com/products.'
  }
}

/** The headers a key adds: Authorization: Bearer <key>. */
export const authHeaders = (auth: DataApi['auth'], key: string): Record<string, string> =>
  auth && key.trim() ? { [auth.header || 'Authorization']: `${auth.prefix}${key.trim()}` } : {}

/** Asks the address (GET) and returns its JSON, or why it didn't work. The key is used for this test only. */
export async function testApi(url: string, auth: DataApi['auth'], key: string, request: typeof fetch = fetch): Promise<ApiTestResult> {
  const bad = checkAddress(url)
  if (bad) return { ok: false, message: bad }
  const control = new AbortController()
  const timer = setTimeout(() => control.abort(), TIMEOUT_MS)
  try {
    const answer = await request(url.trim(), { headers: { Accept: 'application/json', ...authHeaders(auth, key) }, signal: control.signal })
    if (!answer.ok) return { ok: false, message: explainStatus(answer.status) }
    try {
      return { ok: true, json: await answer.json(), status: answer.status }
    } catch {
      return { ok: false, message: 'The API answered, but not with JSON (data in the usual { } or [ ] form). Check that the address returns data, not a web page.' }
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') return { ok: false, message: 'The API took too long to answer (12 seconds). Check the address, or try again.' }
    return { ok: false, message: 'Couldn’t reach it from here. The address may be wrong, the server may be off, or it may not allow requests from web pages (CORS). Your own website is usually allowed even when this test isn’t: ask whoever runs the API to allow it.' }
  } finally {
    clearTimeout(timer)
  }
}
