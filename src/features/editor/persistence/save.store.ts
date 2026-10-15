import { create } from 'zustand'

export type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'

type SaveState = {
  status: SaveStatus
  /** Plain-words place, e.g. "in this browser" or "to your account". */
  where: string
  /** Why saving failed, when it is something the person can fix (written for them). */
  problem: string | null
  setStatus: (status: SaveStatus, problem?: string | null) => void
  setWhere: (where: string) => void
}

/** Save state for the toolbar indicator. */
export const useSaveStore = create<SaveState>((set) => ({
  status: 'idle',
  where: '',
  problem: null,
  setStatus: (status, problem = null) => set({ status, problem }),
  setWhere: (where) => set({ where }),
}))
