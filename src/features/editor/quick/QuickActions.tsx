import { useState } from 'react'
import { Icon, type IconName } from '@/shared/ui'
import { deleteNode, duplicateNode, nudgeNode, selectParent } from '../actions/nodeActions'
import type { FramePlacement } from '../canvas/geometry'
import { useTrackedBox } from '../canvas/useTrackedBox'
import { getElement } from '../model/tree/queries'
import { isTextEditable } from '../model/tree/textRules'
import { useDocStore } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'
import { ChangePictureDialog } from './ChangePictureDialog'
import styles from './QuickActions.module.css'

type Action = { icon: IconName; label: string; run: () => void; primary?: boolean }

/** Decides which buttons make sense for the selected element. */
function useActions(id: string, openPicture: () => void): Action[] {
  const kind = useDocStore((state) => {
    const node = getElement(state.doc.nodes, id)
    if (!node) return 'none'
    if (node.tag === 'img') return 'picture'
    return isTextEditable(state.doc.nodes, id) ? 'text' : 'box'
  })
  const actions: Action[] = []
  if (kind === 'text') actions.push({ icon: 'pencil', label: 'Edit text', primary: true, run: () => useSelectionStore.getState().editText(id) })
  if (kind === 'picture') actions.push({ icon: 'image', label: 'Change picture', primary: true, run: openPicture })
  actions.push(
    { icon: 'arrowUp', label: 'Move up', run: () => nudgeNode(id, -1) },
    { icon: 'chevronDown', label: 'Move down', run: () => nudgeNode(id, 1) },
    { icon: 'layers', label: 'Select the box around it', run: () => selectParent(id) },
    { icon: 'copy', label: 'Duplicate', run: () => duplicateNode(id) },
    { icon: 'trash', label: 'Delete', run: () => deleteNode(id) },
  )
  return actions
}

function ActionBar({ id, placement }: { id: string; placement: FramePlacement }) {
  const box = useTrackedBox(id, placement)
  const [pictureOpen, setPictureOpen] = useState(false)
  const actions = useActions(id, () => setPictureOpen(true))
  if (!box) return null

  // Above the element's right edge (the name tag sits on the left);
  // flipped below when there's no room at the top.
  const top = box.y > 60 ? box.y - 46 : box.y + box.height + 8
  return (
    <>
      <div
        className={styles.bar} role="toolbar" aria-label="Quick actions"
        style={{ left: box.x + box.width, top, transform: 'translateX(-100%)' }}
      >
        {actions.map((action) => (
          <button
            key={action.label} type="button" title={action.label} aria-label={action.label}
            className={action.primary ? styles.primary : styles.action} onClick={action.run}
          >
            <Icon name={action.icon} size={16} />
            {action.primary && <span>{action.label}</span>}
          </button>
        ))}
      </div>
      <ChangePictureDialog id={id} open={pictureOpen} onClose={() => setPictureOpen(false)} />
    </>
  )
}

/** Floating buttons next to the selected element — the fastest way to act on it. */
export function QuickActions({ placement }: { placement: FramePlacement }) {
  const selectedId = useSelectionStore((state) => state.selectedId)
  const editing = useSelectionStore((state) => state.editingTextId !== null)
  const isRoot = useDocStore((state) => state.doc.rootId === selectedId)
  if (!selectedId || editing || isRoot) return null
  return <ActionBar key={selectedId} id={selectedId} placement={placement} />
}
