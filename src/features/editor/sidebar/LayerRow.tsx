import { memo, useEffect, useRef } from 'react'
import { Icon } from '@/shared/ui'
import { toggleHidden } from '../actions/nodeActions'
import { describeNode, labelForNode } from '../labels/elementLabels'
import { isElement } from '../model/types'
import { useDocStore } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'
import { useLayersStore } from './layers.store'
import styles from './Sidebar.module.css'

/** Element children only — whitespace and text pieces are not layers. */
export function useElementChildren(id: string): string[] {
  const children = useDocStore((state) => {
    const node = state.doc.nodes[id]
    return isElement(node) ? node.children : undefined
  })
  const nodes = useDocStore.getState().doc.nodes
  return (children ?? []).filter((childId) => isElement(nodes[childId]))
}

/** One row in the layers tree, plus its children when expanded. */
export const LayerRow = memo(function LayerRow({ id, depth }: { id: string; depth: number }) {
  // Selectors return strings/booleans so a row re-renders only when ITS look changes.
  const name = useDocStore((state) => { const n = state.doc.nodes[id]; return isElement(n) ? describeNode(state.doc.nodes, n, 28) : '' })
  const icon = useDocStore((state) => { const n = state.doc.nodes[id]; return isElement(n) ? labelForNode(n).icon : 'box' })
  const hidden = useDocStore((state) => { const n = state.doc.nodes[id]; return isElement(n) && Boolean(n.hidden) })
  const selected = useSelectionStore((state) => state.selectedId === id)
  const hovered = useSelectionStore((state) => state.hoveredId === id)
  const open = useLayersStore((state) => state.expanded.has(id))
  const children = useElementChildren(id)
  const row = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selected) row.current?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  const { select, hover } = useSelectionStore.getState()
  return (
    <>
      <div
        ref={row} role="treeitem" aria-selected={selected} aria-expanded={children.length ? open : undefined}
        className={`${styles.layer} ${selected ? styles.selected : ''} ${hovered ? styles.hovered : ''} ${hidden ? styles.hiddenLayer : ''}`}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => select(id)} onMouseEnter={() => hover(id)} onMouseLeave={() => hover(null)}
      >
        <button type="button" className={styles.twisty} aria-label={open ? 'Collapse' : 'Expand'}
          style={{ visibility: children.length ? 'visible' : 'hidden' }}
          onClick={(event) => { event.stopPropagation(); useLayersStore.getState().toggle(id) }}>
          <Icon name={open ? 'chevronDown' : 'chevronRight'} size={14} />
        </button>
        <Icon name={icon} size={15} className={styles.layerIcon} />
        <span className={styles.layerName}>{name}</span>
        <button type="button" className={styles.eye} aria-label={hidden ? 'Show' : 'Hide'} title={hidden ? 'Show again' : 'Hide from the page'}
          onClick={(event) => { event.stopPropagation(); toggleHidden(id) }}>
          <Icon name={hidden ? 'hidden' : 'eye'} size={14} />
        </button>
      </div>
      {open && children.map((childId) => <LayerRow key={childId} id={childId} depth={depth + 1} />)}
    </>
  )
})
