import type { PageDoc } from '../model/types'
import { useDocStore } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'

/** Opens a page in the editor with a clean slate (no selection, no undo history). */
export function openDocument(doc: PageDoc) {
  const selection = useSelectionStore.getState()
  selection.editText(null)
  selection.select(null)
  selection.hover(null)
  useDocStore.getState().load(doc)
}
