import { track } from '@/features/analytics/track'
import { toast } from '@/shared/ui'
import { addCodeToDoc } from '../model/addCode'
import { htmlToChildNodes } from '../model/parse/domToNodes'
import type { PastedCode } from '../model/parse/cleanPaste'
import { resolvePage, pageOfNode } from '../model/pages'
import { duplicateComponent } from '../model/reuse/library'
import type { NodeMap } from '../model/types'
import { useViewStore } from '../store/view.store'
import { componentAround } from '../model/reuse/attrs'
import { detachInstance, instantiate, makeComponent, releaseComponent, renameComponent, resetInstance } from '../model/reuse/make'
import { indexInParent } from '../model/tree/queries'
import { insertSubtree } from '../model/tree/treeOps'
import { getDoc } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'
import { updateDoc, updateNodes } from './commit'
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

/** Where a new component goes: the end of the page being edited. */
const pageEnd = () => resolvePage(getDoc(), useViewStore.getState().pageId)?.id ?? getDoc().rootId

/** Goes to a box wherever it is (switching to its page on a website) and selects it. */
export function showNode(id: string) {
  const page = pageOfNode(getDoc().nodes, id)
  if (page) useViewStore.getState().setPageId(page)
  useSelectionStore.getState().select(id)
}

/** A new main component from a ready start (see COMPONENT_STARTS). It sits at the end of this page and is not part of the output. */
export function createComponent(html: string, name: string): string | null {
  leaveComponent()
  const parentId = pageEnd()
  const created: NodeMap = {}
  const top = htmlToChildNodes(html, parentId, created).find((id) => created[id]?.kind === 'element')
  if (!top) return null
  updateNodes((nodes) => makeComponent(insertSubtree(nodes, created, top, parentId), top, name))
  useSelectionStore.getState().select(top)
  track('add_block', { block: 'component-new' })
  return top
}

/** A new main component from pasted HTML, CSS and JavaScript (its styles and scripts join the page). Returns the problem when the code can't be used. */
export function createComponentFromCode(parts: PastedCode, name: string): { ok: true; id: string } | { ok: false; problem: string } {
  leaveComponent()
  const result = addCodeToDoc(getDoc(), parts, { parentId: pageEnd() }, true)
  if (!result.ok) return result
  if (!result.firstId) return { ok: false, problem: 'Add some HTML: a component needs at least one box.' }
  updateDoc(() => ({ ...result.doc, nodes: makeComponent(result.doc.nodes, result.firstId!, name) }))
  useSelectionStore.getState().select(result.firstId)
  track('add_block', { block: 'component-code' })
  return { ok: true, id: result.firstId }
}

/** Makes another main component like this one. */
export function duplicateMain(mainId: string) {
  const made = duplicateComponent(getDoc().nodes, mainId)
  if (!made) return
  updateNodes(() => made.nodes)
  useSelectionStore.getState().select(made.id)
}

/** Edits a main component on its own: the rest of the page steps aside until you press Done. */
export function editComponent(mainId: string) {
  showNode(mainId)
  useViewStore.getState().setFocus(mainId)
  track('add_block', { block: 'component-edit' })
}

/** Back to the whole page. */
export const leaveComponent = () => useViewStore.getState().setFocus(null)
