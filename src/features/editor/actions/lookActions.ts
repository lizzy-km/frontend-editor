import { track } from '@/features/analytics/track'
import { addLook, deleteLook, renameLook, setPartName, setPartShown, swapLook } from '../model/reuse/looks'
import { useSelectionStore } from '../store/selection.store'
import { getDoc } from '../store/doc.store'
import { updateNodes } from './commit'

/** Looks (variants) and options of a component. Each is one undo step. */

/** Adds a look (a second design) to a component and selects it. Returns its id. */
export function addLookTo(mainId: string, name: string): string | null {
  const made = addLook(getDoc().nodes, mainId, name)
  if (!made) return null
  updateNodes(() => made.nodes)
  useSelectionStore.getState().select(made.id)
  track('add_block', { block: 'component-look' })
  return made.id
}

export const renameLookOf = (mainId: string, name: string) => updateNodes((nodes) => renameLook(nodes, mainId, name), `look:${mainId}:name`)

/** Removes a look; the copies that used it switch to the default look. */
export const removeLook = (mainId: string) => updateNodes((nodes) => deleteLook(nodes, mainId))

/** A copy switches to another look and keeps what it changed itself. */
export function switchLook(copyId: string, mainId: string) {
  updateNodes((nodes) => swapLook(nodes, copyId, mainId))
  track('add_block', { block: 'component-switch-look' })
}

/** Names a box of a main component as an option (empty = not an option). */
export const nameOption = (id: string, name: string) => updateNodes((nodes) => setPartName(nodes, id, name), `part:${id}`)

/** Shows or hides an option in one copy. */
export const showOption = (copyId: string, partId: string, shown: boolean) => updateNodes((nodes) => setPartShown(nodes, copyId, partId, shown))
