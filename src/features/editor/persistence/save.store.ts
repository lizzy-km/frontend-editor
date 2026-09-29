import { create } from 'zustand'

export type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'

type SaveState = {
  status: SaveStatus
  /** Plain-words place, e.g. "in this browser" or "to your account". */
  where: string
  setStatus: (status: SaveStatus) => void
  setWhere: (where: string) => void
}

/** Save state for the toolbar indicator. */
export const useSaveStore = create<SaveState>((set) => ({
  status: 'idle',
  where: '',
  setStatus: (status) => set({ status }),
  setWhere: (where) => set({ where }),
}))
