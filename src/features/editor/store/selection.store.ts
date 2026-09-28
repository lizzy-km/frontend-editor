import { create } from 'zustand'

type SelectionState = {
  selectedId: string | null
  hoveredId: string | null
  /** Element whose text is open in the text editor right now. */
  editingTextId: string | null
  select: (id: string | null) => void
  hover: (id: string | null) => void
  editText: (id: string | null) => void
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedId: null,
  hoveredId: null,
  editingTextId: null,
  select: (id) => get().selectedId !== id && set({ selectedId: id, editingTextId: null }),
  hover: (id) => get().hoveredId !== id && set({ hoveredId: id }),
  editText: (id) => set({ editingTextId: id, selectedId: id ?? get().selectedId }),
}))

export const getSelectedId = () => useSelectionStore.getState().selectedId
