import type { PageDoc } from '../model/types'

const KEY = 'tweak:try-draft'

/**
 * The "Try it" page is kept in this browser only, so a refresh doesn't lose
 * work. Storage can be missing or full (private mode) — never throw.
 */
export function loadLocalDraft(): PageDoc | null {
  try {
    const raw = localStorage.getItem(KEY)
    const doc = raw ? (JSON.parse(raw) as PageDoc) : null
    return doc?.rootId && doc.nodes?.[doc.rootId] ? doc : null
  } catch {
    return null
  }
}

export function saveLocalDraft(doc: PageDoc) {
  try {
    localStorage.setItem(KEY, JSON.stringify(doc))
  } catch {
    throw new Error('This browser could not keep your page (storage full or private mode).')
  }
}

export function clearLocalDraft() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // nothing to clear
  }
}
