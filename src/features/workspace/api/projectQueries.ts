import { getDoc, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore/lite'
import { projectRef, projectsCol, toProjectMeta, userRef } from './refs'
import type { ProjectMeta } from './types'

/**
 * The signed-in person's pages, newest change first.
 * Sorted here, not by Firestore: someone has at most a plan's worth of pages,
 * and a plain filter needs no custom index (one less setup step).
 */
export async function listMyProjects(uid: string): Promise<ProjectMeta[]> {
  const snapshot = await getDocs(query(projectsCol(), where('ownerId', '==', uid)))
  return snapshot.docs.map(toProjectMeta).sort((a, b) => b.updatedAt - a.updatedAt)
}

export type PublicPage = { projects: ProjectMeta[]; nextCursor: number | null }

const PAGE_SIZE = 24

/** Public pages for the gallery, newest first, 24 at a time. */
export async function listPublicProjects(afterUpdatedAt: number | null = null): Promise<PublicPage> {
  const base = [where('isPublic', '==', true), orderBy('updatedAt', 'desc')]
  const constraints = afterUpdatedAt ? [...base, startAfter(new Date(afterUpdatedAt)), limit(PAGE_SIZE)] : [...base, limit(PAGE_SIZE)]
  const snapshot = await getDocs(query(projectsCol(), ...constraints))
  const projects = snapshot.docs.map(toProjectMeta)
  return { projects, nextCursor: projects.length === PAGE_SIZE ? projects.at(-1)!.updatedAt : null }
}

/** One project's metadata, or null if missing / not allowed. */
export async function getProjectMeta(id: string): Promise<ProjectMeta | null> {
  try {
    const snapshot = await getDoc(projectRef(id))
    return snapshot.exists() ? toProjectMeta(snapshot) : null
  } catch {
    return null // permission denied = private project of someone else
  }
}

/** How many pages this person has saved, and their plan. */
export async function getUsage(uid: string): Promise<{ count: number; plan: string }> {
  const snapshot = await getDoc(userRef(uid))
  const data = snapshot.data() ?? {}
  return { count: Number(data.projectCount ?? 0), plan: String(data.plan ?? 'free') }
}
