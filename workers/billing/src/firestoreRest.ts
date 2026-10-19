import { fromFields, toFields, type FsValue } from './firestoreValues'
import { ConflictError, type Doc, type Store, type Write } from './store'

type RestDoc = { name: string; fields?: Record<string, FsValue>; updateTime: string }

/** The real Store: Firestore's REST API, as the service account (so the security rules do not apply: this code is the trusted side). */
export function restStore(projectId: string, getToken: () => Promise<string>, fetchFn: typeof fetch = fetch): Store {
  const root = `projects/${projectId}/databases/(default)/documents`
  const base = `https://firestore.googleapis.com/v1/${root}`
  const call = async (url: string, body?: unknown) => {
    const response = await fetchFn(url, { method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${await getToken()}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
    return response
  }
  const toDoc = (item: RestDoc): Doc => ({ path: item.name.slice(root.length + 1), data: fromFields(item.fields ?? {}), updateTime: item.updateTime })

  return {
    async get(path) {
      const response = await call(`${base}/${path}`)
      if (response.status === 404) return null
      if (!response.ok) throw new Error(`Firestore read failed (${response.status})`)
      return toDoc((await response.json()) as RestDoc)
    },
    async commit(writes: Write[]) {
      const body = {
        writes: writes.map((write) => ({
          update: { name: `${root}/${write.path}`, fields: toFields(write.data) },
          ...(write.merge ? { updateMask: { fieldPaths: Object.keys(write.data).filter((key) => write.data[key] !== undefined).map((key) => `\`${key}\``) } } : {}),
          ...(write.expect ? { currentDocument: 'absent' in write.expect ? { exists: false } : { updateTime: write.expect.updateTime } } : {}),
        })),
      }
      const response = await call(`${base}:commit`, body)
      if (response.status === 409 || response.status === 400 || response.status === 412) {
        const text = await response.text()
        if (/ABORTED|FAILED_PRECONDITION|ALREADY_EXISTS/.test(text)) throw new ConflictError(text.slice(0, 200))
        throw new Error(`Firestore write failed (${response.status})`)
      }
      if (!response.ok) throw new Error(`Firestore write failed (${response.status})`)
    },
    async find(collection, field, value) {
      const query = { structuredQuery: { from: [{ collectionId: collection }], where: { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: toFields({ v: value }).v } }, limit: 200 } }
      const response = await call(`${base}:runQuery`, query)
      if (!response.ok) throw new Error(`Firestore query failed (${response.status})`)
      return ((await response.json()) as { document?: RestDoc }[]).flatMap((row) => (row.document ? [toDoc(row.document)] : []))
    },
  }
}
