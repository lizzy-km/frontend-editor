import { useState } from 'react'
import { Button, Modal, toast } from '@/shared/ui'
import { createComponent, createComponentFromCode } from '../../actions/reuseActions'
import { COMPONENT_STARTS } from '../../model/reuse/library'
import { CodePartsBox, EMPTY_PARTS, hasCode } from '../CodePartsBox'
import styles from '../Sidebar.module.css'
import panel from './Components.module.css'

/** "New component": pick a start, or build one from your own HTML, CSS and JavaScript. */
export function NewComponent() {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState(EMPTY_PARTS)
  const [name, setName] = useState('')

  const fromCode = () => {
    const result = createComponentFromCode(code, name.trim() || 'My component')
    if (!result.ok) return toast(result.problem, 'error')
    setCode(EMPTY_PARTS); setName(''); setOpen(false)
    toast('Component made. It sits at the end of your page and is only for editing.', 'success')
  }

  return (
    <section className={panel.new}>
      <p className={styles.addLabel}>New component</p>
      <div className={styles.blocks}>
        {COMPONENT_STARTS.map((start) => (
          <button key={start.id} type="button" className={styles.block} title={start.hint} onClick={() => createComponent(start.html, start.name)}>
            <span>{start.label}</span>
          </button>
        ))}
        <button type="button" className={styles.block} title="Paste HTML, CSS and JavaScript" onClick={() => setOpen(true)}><span>From my code…</span></button>
      </div>
      <Modal open={open} title="Component from my code" onClose={() => setOpen(false)} width={640}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" disabled={!hasCode(code)} onClick={fromCode}>Make the component</Button></>}>
        <label className={panel.nameRow}>Name <input className={panel.input} value={name} placeholder="e.g. Pricing card" onChange={(event) => setName(event.target.value)} /></label>
        <p className={panel.hint}>Paste the part you want to reuse. Several top-level boxes are put into one box. Its styles and scripts join the page.</p>
        <CodePartsBox value={code} onChange={setCode} />
      </Modal>
    </section>
  )
}
