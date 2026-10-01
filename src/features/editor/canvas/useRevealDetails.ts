import { useEffect } from 'react'
import { tellFrame } from '../frame/frame.store'
import { getAncestorIds, getElement } from '../model/tree/queries'
import { getDoc } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'

/** Fold-outs (<details>) around — or equal to — the selected element. */
function detailsAround(id: string): string[] {
  const nodes = getDoc().nodes
  return [id, ...getAncestorIds(nodes, id)].filter((nodeId) => getElement(nodes, nodeId)?.tag === 'details')
}

/**
 * A closed fold-out (FAQ answer) can't be seen or clicked while editing,
 * and the page's own "click to open" can't be reached (clicks go to the
 * overlay). So: selecting a question — or anything inside one — opens it in
 * the editor only. The saved page and the export keep their original
 * open/closed state (the model is never touched; the frame restores it).
 */
export function useRevealDetails() {
  const selectedId = useSelectionStore((state) => state.selectedId)

  useEffect(() => {
    if (!selectedId) return
    const opened = detailsAround(selectedId)
    for (const id of opened) tellFrame('mark', { id, name: 'open', on: true })
    return () => {
      for (const id of opened) tellFrame('mark', { id, name: 'open', on: false })
    }
  }, [selectedId])
}
