import { track } from '@/features/analytics/track'
import { addCodeToDoc, type AddCodeResult } from '../model/addCode'
import type { PastedCode } from '../model/parse/cleanPaste'
import { getDoc } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'
import { updateDoc } from './commit'
import { resolveInsertTarget } from './contentActions'

/** Adds pasted HTML, CSS and JavaScript to the page in one undo step. Returns what was found, or the problem. */
export function addCodeToPage(parts: PastedCode): AddCodeResult {
  const result = addCodeToDoc(getDoc(), parts, resolveInsertTarget())
  if (!result.ok) return result
  updateDoc(() => result.doc)
  track('add_block', { block: 'pasted-code' })
  if (result.firstId) useSelectionStore.getState().select(result.firstId)
  return result
}
