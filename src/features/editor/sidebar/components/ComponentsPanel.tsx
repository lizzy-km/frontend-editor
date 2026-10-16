import { useMemo, useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import { addInstance, duplicateMain, editComponent, releaseMain, renameMain, showNode } from '../../actions/reuseActions'
import { describeNode } from '../../labels/elementLabels'
import { pageOfNode } from '../../model/pages'
import { componentList, type ComponentInfo } from '../../model/reuse/library'
import type { ElementNode, NodeMap } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { useSelectionStore } from '../../store/selection.store'
import { LooksBar } from './LooksBar'
import { NewComponent } from './NewComponent'
import panel from './Components.module.css'

function Row({ info, nodes, selected }: { info: ComponentInfo; nodes: NodeMap; selected: boolean }) {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [picked, setPicked] = useState(info.id)
  const lookId = info.looks.some((look) => look.id === picked) ? picked : info.id // the chosen look, while it exists
  return (
    <li className={panel.row} data-selected={selected}>
      <div className={panel.head}>
        <Icon name="component" size={18} />
        <input className={panel.rename} aria-label="Component name" defaultValue={info.name} key={info.name}
          onBlur={(event) => event.target.value.trim() && event.target.value !== info.name && renameMain(info.id, event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()} />
        <button type="button" className={panel.count} aria-expanded={open} onClick={() => setOpen(!open)} title="Where it is used">
          {info.copies.length} {info.copies.length === 1 ? 'copy' : 'copies'}
        </button>
      </div>
      <div className={panel.actions}>
        <Button size="small" variant="primary" icon="pencil" onClick={() => editComponent(lookId)}>Edit</Button>
        <Button size="small" icon="plus" onClick={() => addInstance(lookId)}>Add a copy</Button>
        <Button size="small" variant="ghost" onClick={() => showNode(lookId)}>Show it</Button>
        <Button size="small" variant="ghost" onClick={() => duplicateMain(info.id)}>Duplicate</Button>
        <Button size="small" variant="ghost" onClick={() => setConfirm(true)}>Delete</Button>
      </div>
      <LooksBar info={info} lookId={lookId} onPick={setPicked} />
      {confirm && (
        <p className={panel.confirm} role="alert">
          Delete “{info.name}”? Its {info.copies.length} {info.copies.length === 1 ? 'copy stays' : 'copies stay'} on your page as normal boxes.
          {' '}<Button size="small" variant="danger" onClick={() => { for (const look of info.looks) releaseMain(look.id); setConfirm(false) }}>Delete the component</Button>
          {' '}<Button size="small" variant="ghost" onClick={() => setConfirm(false)}>Keep it</Button>
        </p>
      )}
      {open && (
        <ul className={panel.used}>
          {info.copies.length === 0 && <li className={panel.muted}>Not used yet. Press Add a copy.</li>}
          {info.copies.map((id) => {
            const page = pageOfNode(nodes, id)
            return <li key={id}><button type="button" onClick={() => showNode(id)}>{describeNode(nodes, nodes[id] as ElementNode, 30)}{page ? ` · ${(nodes[page] as ElementNode).attrs['data-fe-title'] ?? 'page'}` : ''}</button></li>
          })}
        </ul>
      )}
    </li>
  )
}

/** The components of this page: create, rename, add copies, see where each is used, duplicate and delete. */
export function ComponentsPanel() {
  const nodes = useDocStore((state) => state.doc.nodes)
  const selectedId = useSelectionStore((state) => state.selectedId)
  const list = useMemo(() => componentList(nodes), [nodes])
  return (
    <div className={panel.panel}>
      <p className={panel.intro}>A component is a part you reuse. Change the main one and every copy follows. Main components are only for editing: they never show on your page.</p>
      <NewComponent />
      <p className={panel.title}>Your components <span>{list.length}</span></p>
      {list.length === 0
        ? <p className={panel.muted}>None yet. Make one above, or select a box and use Actions → Component.</p>
        : <ul className={panel.list}>{list.map((info) => <Row key={info.id} info={info} nodes={nodes} selected={selectedId === info.id} />)}</ul>}
    </div>
  )
}
