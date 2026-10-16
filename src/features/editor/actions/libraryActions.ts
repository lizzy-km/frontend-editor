import { track } from '@/features/analytics/track'
import { useAuthStore } from '@/features/auth/auth.store'
import { toast } from '@/shared/ui'
import { addEntry, entryFromComponent, keyLooks, linkOf, updateFromEntry } from '../model/reuse/entry'
import { LIBRARY_ATTR, looksOf } from '../model/reuse/attrs'
import type { ElementNode } from '../model/types'
import { getDoc } from '../store/doc.store'
import { useLibraryStore } from '../store/library.store'
import { useSelectionStore } from '../store/selection.store'
import { updateDoc, updateNodes } from './commit'
import { leaveComponent, pageEnd } from './reuseActions'
import { patchNode } from '../model/tree/treeOps'

/** The account library: components saved to your account, usable in any page. Firebase loads only when one of these runs. */
const api = () => import('@/features/workspace/api/componentLibrary')
const uid = () => useAuthStore.getState().user?.uid ?? null

/** Can this person use the library (signed in, with accounts set up)? */
export const libraryAvailable = () => useAuthStore.getState().status === 'signedIn'

const set = (state: Partial<ReturnType<typeof useLibraryStore.getState>>) => useLibraryStore.setState(state)
const problem = (error: unknown) => toast((error as { friendly?: boolean }).friendly ? (error as Error).message : 'The library could not be reached. Check your connection and try again.', 'error')

/** Runs one library step with a busy flag and a friendly error. */
async function run<T>(step: (id: string, library: Awaited<ReturnType<typeof api>>) => Promise<T>): Promise<T | null> {
  const id = uid()
  if (!id || useLibraryStore.getState().busy) return null
  set({ busy: true })
  try { return await step(id, await api()) } catch (error) { problem(error); return null } finally { set({ busy: false }) }
}

/** Reads the library (again). */
export async function loadLibrary() {
  const id = uid()
  if (!id) return
  set({ status: 'loading' })
  try { set({ items: await (await api()).listLibrary(id), status: 'ready' }) } catch { set({ status: 'error' }) }
}

const stamp = (mainId: string, link: string) => updateNodes((nodes) => looksOf(nodes, nodes[mainId] as ElementNode).reduce((next, look) => patchNode<ElementNode>(next, look.id, (node) => ({ ...node, attrs: { ...node.attrs, [LIBRARY_ATTR]: link } })), nodes))

/** Saves the component to the library: a new entry, or (when it came from the library) a newer version of that entry. */
export async function saveToMyLibrary(mainId: string, asNew = false) {
  if (!asNew && linkOf(getDoc().nodes[mainId] as ElementNode)) await loadLibrary() // another page may have saved a newer version
  updateNodes((nodes) => keyLooks(nodes, mainId))
  const entry = entryFromComponent(getDoc(), mainId)
  const link = asNew ? null : linkOf(getDoc().nodes[mainId] as ElementNode)
  const known = link && useLibraryStore.getState().items.find((item) => item.id === link.id)
  const saved = await run(async (id, library) => (known ? { id: known.id, version: await library.updateLibraryEntry(known.id, entry, known.version) } : { id: await library.saveToLibrary(id, entry), version: 1 }))
  if (!saved) return
  stamp(mainId, `${saved.id}@${saved.version}`)
  await loadLibrary()
  toast(known ? `“${entry.name}” updated in your library.` : `“${entry.name}” saved to your library.`, 'success')
  track('add_block', { block: 'component-library-save' })
}

/** Puts a library component on this page as a main component (at the end of the page). */
export function addFromLibrary(itemId: string) {
  const item = useLibraryStore.getState().items.find((one) => one.id === itemId)
  if (!item) return
  leaveComponent()
  const parentId = pageEnd()
  const added = addEntry(getDoc(), item.entry, item.id, item.version, parentId, (getDoc().nodes[parentId] as ElementNode).children.length)
  if (!added) return toast('That component could not be added.', 'error')
  updateDoc(() => added.doc)
  useSelectionStore.getState().select(added.id)
  toast(`“${item.entry.name}” added. It sits at the end of your page; press Add a copy to use it.`, 'success')
  track('add_block', { block: 'component-library-add' })
}

/** The library has a newer version than this page's component? */
export function newerInLibrary(mainId: string): boolean {
  const link = linkOf(getDoc().nodes[mainId] as ElementNode)
  const item = link && useLibraryStore.getState().items.find((one) => one.id === link.id)
  return Boolean(item && link && item.version > link.version)
}

/** Brings the page's component up to the library's version (its copies follow). */
export function updateFromLibrary(mainId: string) {
  const link = linkOf(getDoc().nodes[mainId] as ElementNode)
  const item = link && useLibraryStore.getState().items.find((one) => one.id === link.id)
  if (!item) return toast('This component is not in your library any more.', 'info')
  updateDoc((doc) => updateFromEntry(doc, mainId, item.entry, item.id, item.version))
  toast(`Updated to version ${item.version}.`, 'success')
  track('add_block', { block: 'component-library-update' })
}

/** Removes a component from the library (pages that already use it keep their copy). */
export async function removeFromLibrary(itemId: string) {
  if (await run((_id, library) => library.deleteLibraryEntry(itemId).then(() => true))) await loadLibrary()
}
