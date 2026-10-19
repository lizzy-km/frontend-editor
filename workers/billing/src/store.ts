/**
 * The worker's view of Firestore: read a document, and commit several writes at once. The real one talks to
 * Firestore's REST API (firestoreRest.ts); the tests use a small in-memory one.
 */
export type Doc = { path: string; data: Record<string, unknown>; updateTime: string }

export type Write = {
  path: string
  /** Fields to write. With `merge`, only these fields change; otherwise the document is replaced. */
  data: Record<string, unknown>
  merge?: boolean
  /** Fail (ConflictError) unless the document is still as it was read (`updateTime`) or does not exist yet (`absent`). */
  expect?: { updateTime: string } | { absent: true }
}

export interface Store {
  get(path: string): Promise<Doc | null>
  /** All the writes happen together or not at all. Throws ConflictError when an `expect` no longer holds. */
  commit(writes: Write[]): Promise<void>
  /** Documents of a collection whose field equals a value (small lists only). */
  find(collection: string, field: string, value: string | number | boolean): Promise<Doc[]>
}

/** Someone else changed the document first: try again (a webhook answers with an error so the processor retries). */
export class ConflictError extends Error {}
