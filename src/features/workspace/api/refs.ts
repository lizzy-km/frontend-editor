import { collection, doc, Timestamp, type DocumentData, type DocumentSnapshot } from 'firebase/firestore/lite'
import { firestore } from '@/lib/firebase'
import type { ProjectMeta } from './types'

/** Firestore paths in one place. */
export const projectsCol = () => collection(firestore(), 'projects')
export const projectRef = (id: string) => doc(firestore(), 'projects', id)
export const contentRef = (id: string) => doc(firestore(), 'projectContent', id)
export const userRef = (uid: string) => doc(firestore(), 'users', uid)

const toMillis = (value: unknown) => (value instanceof Timestamp ? value.toMillis() : Date.now())

/** Firestore document -> ProjectMeta (timestamps become plain milliseconds). */
export function toProjectMeta(snapshot: DocumentSnapshot<DocumentData>): ProjectMeta {
  const data = snapshot.data() ?? {}
  return {
    id: snapshot.id,
    ownerId: String(data.ownerId ?? ''),
    ownerName: String(data.ownerName ?? ''),
    name: String(data.name ?? 'Untitled page'),
    isPublic: Boolean(data.isPublic),
    thumbnailUrl: typeof data.thumbnailUrl === 'string' ? data.thumbnailUrl : null,
    remixOf: typeof data.remixOf === 'string' ? data.remixOf : null,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  }
}
