import { useEffect } from 'react'
import { getNodeElement } from '../frame/frame.store'
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
 * and the page's own "click to open" is off. So: selecting a question — or
 * anything inside one — opens it in the editor only. The saved page and the
 * export keep their original open/closed state (the model is never touched).
 */
export function useRevealDetails() {
  const selectedId = useSelectionStore((state) => state.selectedId)

  useEffect(() => {
    if (!selectedId) return
    const opened: Element[] = []
    for (const id of detailsAround(selectedId)) {
      const element = getNodeElement(id)
      if (element && !element.hasAttribute('open')) {
        element.setAttribute('open', '')
        opened.push(element)
      }
    }
    return () => {
      for (const element of opened) {
        const id = element.getAttribute('data-fe-id')
        const keepOpen = id ? 'open' in (getElement(getDoc().nodes, id)?.attrs ?? {}) : false
        if (!keepOpen) element.removeAttribute('open')
      }
    }
  }, [selectedId])
}
