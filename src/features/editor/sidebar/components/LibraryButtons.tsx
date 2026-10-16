import { Button } from '@/shared/ui'
import { libraryAvailable, newerInLibrary, saveToMyLibrary, updateFromLibrary } from '../../actions/libraryActions'
import { linkOf } from '../../model/reuse/entry'
import type { ElementNode, NodeMap } from '../../model/types'
import { useLibraryStore } from '../../store/library.store'
import panel from './Components.module.css'

/** On one component: save it to the account library, update the library, or pick up a newer version from it. */
export function LibraryButtons({ mainId, nodes }: { mainId: string; nodes: NodeMap }) {
  const items = useLibraryStore((state) => state.items)
  const busy = useLibraryStore((state) => state.busy)
  if (!libraryAvailable()) return null
  const link = linkOf(nodes[mainId] as ElementNode)
  const source = link && items.find((item) => item.id === link.id)
  return (
    <div className={panel.actions}>
      {newerInLibrary(mainId) && <Button size="small" variant="primary" disabled={busy} onClick={() => updateFromLibrary(mainId)} title="Your library has a newer version. Your copies follow it.">Get the newer version</Button>}
      <Button size="small" variant="ghost" disabled={busy} onClick={() => saveToMyLibrary(mainId)} title="Keep it in your account to use in other pages">{source ? 'Update my library' : 'Save to my library'}</Button>
      {source && <Button size="small" variant="ghost" disabled={busy} onClick={() => saveToMyLibrary(mainId, true)} title="Keep it as a separate library component">Save as new</Button>}
    </div>
  )
}
