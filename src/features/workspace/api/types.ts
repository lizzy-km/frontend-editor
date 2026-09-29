/** projects/{id} — small, listable metadata (the dashboard and gallery read only this). */
export type ProjectMeta = {
  id: string
  ownerId: string
  ownerName: string
  name: string
  isPublic: boolean
  thumbnailUrl: string | null
  /** Id of the public project this was copied from, if any. */
  remixOf: string | null
  createdAt: number
  updatedAt: number
}

/** Thrown when the plan's page limit is reached, so the UI can explain it nicely. */
export class ProjectLimitError extends Error {
  constructor(public readonly max: number) {
    super(`You've reached ${max} saved pages.`)
  }
}

/** Thrown when a page is too big for one Firestore document. */
export class ProjectTooBigError extends Error {
  constructor() {
    super('This page is too big to save to your account (usually because of pictures pasted inside the code). You can still download it.')
  }
}
