import { doc, getDoc, increment, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore/lite'
import { track } from '@/features/analytics/track'
import type { AppUser } from '@/features/auth/types'
import { ensureUserProfile } from '@/features/auth/userProfile'
import { planFor } from '@/features/billing/plans'
import type { PageDoc } from '@/features/editor/model/types'
import { firestore } from '@/lib/firebase'
import { serializeDoc } from './projectContent'
import { contentRef, projectRef, projectsCol, userRef } from './refs'
import { ProjectLimitError } from './types'

/**
 * Creates a project and counts it, in ONE batch. firestore.rules check the
 * count went up by exactly one for this project and stays within the plan.
 */
export async function createProject(user: AppUser, pageDoc: PageDoc, remixOf: string | null = null): Promise<string> {
  // The counter lives on the profile; without it the rules refuse the whole batch.
  await ensureUserProfile(user)
  const profile = (await getDoc(userRef(user.uid))).data() ?? {}
  const plan = planFor(profile.plan as string | undefined)
  if (Number(profile.projectCount ?? 0) >= plan.maxProjects) {
    track('page_limit_reached', { plan: plan.id })
    throw new ProjectLimitError(plan.maxProjects)
  }

  const id = doc(projectsCol()).id
  const now = serverTimestamp()
  const batch = writeBatch(firestore())
  batch.set(projectRef(id), {
    ownerId: user.uid,
    ownerName: user.displayName ?? user.email?.split('@')[0] ?? 'Someone',
    name: pageDoc.title || 'Untitled page',
    isPublic: false, thumbnailUrl: null, remixOf, createdAt: now, updatedAt: now,
  })
  batch.set(contentRef(id), { ownerId: user.uid, isPublic: false, doc: serializeDoc(pageDoc), updatedAt: now })
  batch.update(userRef(user.uid), { projectCount: increment(1), lastProjectOp: id })
  await batch.commit()
  track('page_create', { remix: Boolean(remixOf) })
  return id
}

/** Deletes a project and gives the page slot back. */
export async function deleteProject(uid: string, id: string): Promise<void> {
  const batch = writeBatch(firestore())
  batch.delete(contentRef(id))
  batch.delete(projectRef(id))
  batch.update(userRef(uid), { projectCount: increment(-1), lastProjectOp: id })
  await batch.commit()
  track('page_delete')
}

export async function renameProject(id: string, name: string): Promise<void> {
  await updateDoc(projectRef(id), { name: name.trim() || 'Untitled page', updatedAt: serverTimestamp() })
  track('page_rename')
}

/** Public = anyone with the link (and the gallery) can view and copy it. */
export async function setProjectPublic(id: string, isPublic: boolean): Promise<void> {
  const batch = writeBatch(firestore())
  batch.update(projectRef(id), { isPublic })
  batch.update(contentRef(id), { isPublic }) // mirrored so read rules need no extra lookup
  await batch.commit()
  track('share', { method: isPublic ? 'public' : 'private', content_type: 'page' })
}
