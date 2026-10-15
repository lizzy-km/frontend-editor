import { getDoc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore/lite'
import { sizeReport, tooBigAdvice } from '@/features/editor/model/embedded'
import type { PageDoc } from '@/features/editor/model/types'
import { firestore } from '@/lib/firebase'
import { contentRef, projectRef } from './refs'
import { packDoc, unpackDoc } from './packDoc'
import { ProjectTooBigError } from './types'

/** Firestore documents max out at 1 MiB; keep room for the other fields. */
const MAX_DOC_CHARS = 900_000

/** The page is stored as one string (its JSON, squeezed when possible): flat, fast, and immune to Firestore's nested-map rules. */
export async function serializeDoc(doc: PageDoc): Promise<string> {
  const packed = await packDoc(doc)
  if (packed.length > MAX_DOC_CHARS) throw new ProjectTooBigError(tooBigAdvice(sizeReport(doc)))
  return packed
}

export async function loadProjectContent(id: string): Promise<PageDoc | null> {
  try {
    const snapshot = await getDoc(contentRef(id))
    const raw = snapshot.data()?.doc
    return typeof raw === 'string' ? await unpackDoc(raw) : null
  } catch {
    return null
  }
}

/** Autosave target: content + the project's "last changed" time, together. */
export async function saveProjectContent(id: string, doc: PageDoc): Promise<void> {
  const batch = writeBatch(firestore())
  batch.update(contentRef(id), { doc: await serializeDoc(doc), updatedAt: serverTimestamp() })
  batch.update(projectRef(id), { name: doc.title || 'Untitled page', updatedAt: serverTimestamp() })
  await batch.commit()
}

/** Stores the address of the project's preview picture. */
export async function setProjectThumbnail(id: string, thumbnailUrl: string): Promise<void> {
  await updateDoc(projectRef(id), { thumbnailUrl })
}
