import { track } from '@/features/analytics/track'
import { toast } from '@/shared/ui'
import { componentAround } from '../model/reuse/attrs'
import { detachInstance, instantiate, makeComponent, releaseComponent, renameComponent, resetInstance } from '../model/reuse/make'
import { indexInParent } from '../model/tree/queries'
import { insertSubtree } from '../model/tree/treeOps'
import { getDoc } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'
import { updateNodes } from './commit'
import { resolveInsertTarget } from './contentActions'

/** Reusable components: each action is one undo step. */

/** Makes the selected box a main component with a name. */
export function makeMain(id: string, name: string) {
  updateNodes((nodes) => makeComponent(nodes, id, name))
  track('add_block', { block: 'component-make' })
}

export const renameMain = (id: string, name: string) => updateNodes((nodes) => renameComponent(nodes, id, name), `component:${id}:name`)

/** Puts a new copy of a main component where Add would put it; next to the selected component when one is selected (never inside a component). */
export function addInstance(mainId: string): string | null {
  const nodes = getDoc().nodes
  const around = componentAround(nodes, useSelectionStore.getState().selectedId)
  const where = around?.root.parentId ? { parentId: around.root.parentId, index: indexInParent(nodes, around.root.id) + 1 } : resolveInsertTarget()
  if (componentAround(nodes, where.parentId)) {
    toast('Put copies on the page itself, not inside a component.', 'info')
    return null
  }
  const copy = instantiate(getDoc().nodes, mainId)
  updateNodes((nodes) => insertSubtree(nodes, copy.nodes, copy.topId, where.parentId, where.index))
  useSelectionStore.getState().select(copy.topId)
  track('add_block', { block: 'component-instance' })
  return copy.topId
}

/** The instance goes back to looking exactly like its main component (its data choice stays). */
export const resetOverrides = (instanceId: string) => updateNodes((nodes) => resetInstance(nodes, instanceId))

/** The instance becomes a normal box that no longer follows the main component. */
export const detach = (instanceId: string) => updateNodes((nodes) => detachInstance(nodes, instanceId))

/** The main component stops being one; its instances become normal boxes. */
export const releaseMain = (mainId: string) => updateNodes((nodes) => releaseComponent(nodes, mainId))
