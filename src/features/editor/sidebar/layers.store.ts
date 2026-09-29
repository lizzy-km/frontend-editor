import { create } from 'zustand'

type LayersState = {
  /** Ids of rows whose children are shown. */
  expanded: Set<string>
  toggle: (id: string) => void
  /** Opens every row in `ids` (used to reveal the selected element). */
  expand: (ids: string[]) => void
}

export const useLayersStore = create<LayersState>((set, get) => ({
  expanded: new Set(),
  toggle: (id) => {
    const expanded = new Set(get().expanded)
    if (expanded.has(id)) expanded.delete(id)
    else expanded.add(id)
    set({ expanded })
  },
  expand: (ids) => {
    const current = get().expanded
    if (ids.every((id) => current.has(id))) return
    set({ expanded: new Set([...current, ...ids]) })
  },
}))
