/**
 * Firestore collection names. Prefixed so this app never collides with other
 * apps sharing the same Firebase project. Change a name here AND in
 * firestore.rules / firestore.indexes.json (they can't import this file).
 */
export const COLLECTIONS = {
  users: 'tweak_users',
  projects: 'tweaks_projects',
  projectContent: 'tweaks_project_content',
} as const
