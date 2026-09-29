import { useEffect } from 'react'
import { getAncestorIds } from '../model/tree/queries'
import { getDoc, useDocStore } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'
import { LayerRow, useElementChildren } from './LayerRow'
import { useLayersStore } from './layers.store'
import styles from './Sidebar.module.css'

/** Everything on the page as a tree. Opens itself to show the selected element. */
export function LayersPanel() {
  const rootId = useDocStore((state) => state.doc.rootId)
  const selectedId = useSelectionStore((state) => state.selectedId)
  const topLevel = useElementChildren(rootId)

  useEffect(() => {
    if (selectedId) useLayersStore.getState().expand(getAncestorIds(getDoc().nodes, selectedId))
  }, [selectedId])

  if (topLevel.length === 0) return <p className={styles.emptyNote}>Your page is empty. Use “Add” to put something on it.</p>
  return (
    <div role="tree" aria-label="Page layers" className={styles.tree}>
      {topLevel.map((id) => <LayerRow key={id} id={id} depth={0} />)}
    </div>
  )
}
