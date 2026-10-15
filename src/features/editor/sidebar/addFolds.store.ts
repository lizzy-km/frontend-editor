import { create } from 'zustand'

type State = {
  /** Which folds of the Add panel the person opened or closed (others use their default). */
  open: Record<string, boolean>
  toggle: (id: string, current: boolean) => void
}

/** Remembers the folds of the Add panel while the editor is open (the panel is rebuilt when you switch tabs). */
export const useAddFolds = create<State>((set) => ({
  open: {},
  toggle: (id, current) => set((state) => ({ open: { ...state.open, [id]: !current } })),
}))
