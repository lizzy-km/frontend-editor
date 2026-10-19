export type Env = {
  FIREBASE_PROJECT_ID: string
  /** Comma-separated list, e.g. "https://tweak.app,http://localhost:5173" */
  ALLOWED_ORIGINS: string
  /** The app's address (people come back here after paying) and this worker's own address (the processor's webhook). */
  APP_URL: string
  WORKER_URL: string
  /** "true" = the processor's sandbox (no real money). */
  NOWPAYMENTS_SANDBOX: string
  NOWPAYMENTS_API_KEY: string
  NOWPAYMENTS_IPN_SECRET: string
  /** The whole service-account JSON. */
  GOOGLE_SERVICE_ACCOUNT: string
}

const trimmed = (url: string) => url.trim().replace(/\/+$/, '')

/** The address of this worker, without a trailing slash (the processor calls back here). */
export const workerUrl = (env: Pick<Env, 'WORKER_URL'>) => trimmed(env.WORKER_URL)

/**
 * Where people come back to after paying: the app address that asked (when it is one of the allowed origins, so a local copy and the
 * live site both work), else APP_URL. Never has a trailing slash.
 */
export function appUrlFor(request: Request, env: Pick<Env, 'ALLOWED_ORIGINS' | 'APP_URL'>): string {
  const origin = request.headers.get('Origin') ?? ''
  const allowed = env.ALLOWED_ORIGINS.split(',').map((item) => trimmed(item))
  return allowed.includes(trimmed(origin)) && origin ? trimmed(origin) : trimmed(env.APP_URL.split(';')[0] ?? '')
}

/** CORS headers for the app's own origins only. */
export function corsHeaders(request: Request, env: Pick<Env, 'ALLOWED_ORIGINS'>): Record<string, string> {
  const origin = request.headers.get('Origin') ?? ''
  const allowed = env.ALLOWED_ORIGINS.split(',').map((item) => item.trim())
  if (!allowed.includes(origin)) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

export function json(body: unknown, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } })
}
