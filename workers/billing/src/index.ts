import { handleCheckout } from './checkout'
import { realDeps } from './deps'
import { corsHeaders, json, type Env } from './http'
import { handleWebhook } from './webhook'

/**
 * Tweak billing worker. The only place money turns into plans and purchases.
 *   POST /checkout             start a hosted crypto checkout for the signed-in person
 *   POST /webhook/nowpayments  the processor's callback (signed); confirms payments
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request, env) })
    try {
      if (request.method === 'POST' && url.pathname === '/checkout') return await handleCheckout(request, env, realDeps(env))
      if (request.method === 'POST' && url.pathname === '/webhook/nowpayments') return await handleWebhook(request, env, realDeps(env))
    } catch (error) {
      console.error('billing error', (error as Error).message)
      return json({ error: 'Something went wrong. Please try again.' }, 500, corsHeaders(request, env))
    }
    return json({ error: 'Not found' }, 404, corsHeaders(request, env))
  },
} satisfies ExportedHandler<Env>
