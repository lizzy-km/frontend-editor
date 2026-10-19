import type { Deps } from './deps'
import type { Env } from './http'
import { ConflictError, type Doc, type Store, type Write } from './store'

/** Shared by the worker's tests: an in-memory Store, a fake processor, and ready-made env and deps. */
export function memoryStore(): Store & { docs: Map<string, { data: Record<string, unknown>; version: number }> } {
  const docs = new Map<string, { data: Record<string, unknown>; version: number }>()
  const read = (path: string): Doc | null => { const item = docs.get(path); return item ? { path, data: { ...item.data }, updateTime: `v${item.version}` } : null }
  return {
    docs,
    async get(path) { return read(path) },
    async commit(writes: Write[]) {
      for (const write of writes) {
        const item = docs.get(write.path)
        if (write.expect && 'absent' in write.expect && item) throw new ConflictError('exists')
        if (write.expect && 'updateTime' in write.expect && item?.version !== Number(write.expect.updateTime.slice(1))) throw new ConflictError('changed')
      }
      for (const write of writes) {
        const item = docs.get(write.path)
        docs.set(write.path, { data: write.merge ? { ...(item?.data ?? {}), ...write.data } : { ...write.data }, version: (item?.version ?? 0) + 1 })
      }
    },
    async find(collection, field, value) {
      return [...docs.keys()].filter((path) => path.startsWith(`${collection}/`) && docs.get(path)!.data[field] === value).map((path) => read(path)!)
    },
  }
}

export const ENV: Env = {
  FIREBASE_PROJECT_ID: 'demo', ALLOWED_ORIGINS: 'http://app.test', APP_URL: 'http://app.test', WORKER_URL: 'http://worker.test',
  NOWPAYMENTS_SANDBOX: 'true', NOWPAYMENTS_API_KEY: 'key', NOWPAYMENTS_IPN_SECRET: 'secret', GOOGLE_SERVICE_ACCOUNT: '{}',
}

export const NOW = new Date('2026-10-20T10:00:00Z')

/** Deps with a fixed clock, counting ids, a signed-in person (or none) and a fake NOWPayments. */
export function testDeps(options: { uid?: string | null; invoiceOk?: boolean } = {}) {
  const store = memoryStore()
  const calls: { url: string; body: Record<string, unknown> }[] = []
  let count = 0
  const deps: Deps = {
    store, now: () => NOW, newId: () => `pay${String(++count).padStart(6, '0')}`,
    userOf: async () => (options.uid === undefined ? 'alice' : options.uid),
    fetchFn: (async (url: string, init?: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init?.body)) as Record<string, unknown> })
      return options.invoiceOk === false ? new Response('no', { status: 500 }) : new Response(JSON.stringify({ id: 'inv1', invoice_url: 'https://pay.test/inv1' }), { status: 200 })
    }) as typeof fetch,
  }
  return { deps, store, calls }
}
