import { getDoc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore/lite'
import type { PageDoc } from '@/features/editor/model/types'
import { firestore } from '@/lib/firebase'
import { contentRef, projectRef } from './refs'
import { ProjectTooBigError } from './types'

/** Firestore documents max out at 1 MiB; keep room for the other fields. */
const MAX_DOC_CHARS = 900_000

/** The page is stored as a JSON string: flat, fast, and immune to Firestore's nested-map rules. */
export function serializeDoc(doc: PageDoc): string {
  const json = JSON.stringify(doc)
  if (json.length > MAX_DOC_CHARS) throw new ProjectTooBigError()
  return json
}

export async function loadProjectContent(id: string): Promise<PageDoc | null> {
  try {
    const snapshot = await getDoc(contentRef(id))
    const raw = snapshot.data()?.doc
    return typeof raw === 'string' ? (JSON.parse(raw) as PageDoc) : null
  } catch {
    return null
  }
}

/** Autosave target: content + the project's "last changed" time, together. */
export async function saveProjectContent(id: string, doc: PageDoc): Promise<void> {
  const batch = writeBatch(firestore())
  batch.update(contentRef(id), { doc: serializeDoc(doc), updatedAt: serverTimestamp() })
  batch.update(projectRef(id), { name: doc.title || 'Untitled page', updatedAt: serverTimestamp() })
  await batch.commit()
}

/** Stores the address of the project's preview picture. */
export async function setProjectThumbnail(id: string, thumbnailUrl: string): Promise<void> {
  await updateDoc(projectRef(id), { thumbnailUrl })
}
