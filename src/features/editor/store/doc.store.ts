import { create } from 'zustand'
import { HISTORY_LIMIT } from '@/config/app.config'
import { track } from '@/features/analytics/track'
import { createEmptyDoc } from '../model/parse/parseDocument'
import type { PageDoc } from '../model/types'

/** Edits with the same key this close together become ONE undo step (e.g. dragging a slider). */
const COALESCE_MS = 800

type DocState = {
  doc: PageDoc
  past: PageDoc[]
  future: PageDoc[]
  /** Bumps on every change; autosave watches it. */
  version: number
  lastEdit: { key: string; at: number } | null
  load: (doc: PageDoc) => void
  commit: (next: PageDoc, coalesceKey?: string) => void
  undo: () => void
  redo: () => void
}

export const useDocStore = create<DocState>((set, get) => ({
  doc: createEmptyDoc(),
  past: [],
  future: [],
  version: 0,
  lastEdit: null,

  load: (doc) => set({ doc, past: [], future: [], version: 0, lastEdit: null }),

  commit: (next, coalesceKey) => {
    const { doc, past, lastEdit, version } = get()
    if (next === doc) return
    const now = Date.now()
    const merge = Boolean(coalesceKey && lastEdit?.key === coalesceKey && now - lastEdit.at < COALESCE_MS)
    set({
      doc: next,
      past: merge ? past : [...past, doc].slice(-HISTORY_LIMIT),
      future: [],
      version: version + 1,
      lastEdit: coalesceKey ? { key: coalesceKey, at: now } : null,
    })
  },

  undo: () => {
    const { doc, past, future, version } = get()
    const previous = past.at(-1)
    if (!previous) return
    track('undo')
    set({ doc: previous, past: past.slice(0, -1), future: [doc, ...future], version: version + 1, lastEdit: null })
  },

  redo: () => {
    const { doc, past, future, version } = get()
    const next = future[0]
    if (!next) return
    track('redo')
    set({ doc: next, past: [...past, doc], future: future.slice(1), version: version + 1, lastEdit: null })
  },
}))

/** Read the current page outside React (event handlers, actions). */
export const getDoc = () => useDocStore.getState().doc
