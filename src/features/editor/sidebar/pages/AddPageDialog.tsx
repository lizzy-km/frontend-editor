import { useState } from 'react'
import { LazyCodeEditor } from '@/shared/code/LazyCodeEditor'
import { Button, Modal, TextField } from '@/shared/ui'
import { createPage } from '../../actions/pageActions'
import type { NewPage } from '../../model/pageOps'
import { slugify, type PageInfo } from '../../model/pages'
import { SegmentedControl } from '../../inspector/controls/ChoiceControls'
import styles from './Pages.module.css'

type From = NewPage['from']
type Props = { onClose: () => void; currentPage: PageInfo | null }

/** New page: a name, an address, and what it starts with (empty, pasted code, or a copy). */
export function AddPageDialog({ onClose, currentPage }: Props) {
  const [title, setTitle] = useState('')
  const [path, setPath] = useState('')
  const [pathEdited, setPathEdited] = useState(false)
  const [from, setFrom] = useState<From>('blank')
  const [code, setCode] = useState('')
  const shownPath = pathEdited ? path : `/${slugify(title || 'new page')}`

  const options = [
    { value: 'blank', label: 'Empty' },
    { value: 'code', label: 'Paste code' },
    ...(currentPage ? [{ value: 'copy', label: `Copy of ${currentPage.title}` }] : []),
  ]
  const ready = title.trim() && (from !== 'code' || code.trim())

  const add = () => {
    const base = { title: title.trim(), path: shownPath }
    if (from === 'code') createPage({ ...base, from, code })
    else if (from === 'copy' && currentPage) createPage({ ...base, from, pageId: currentPage.id })
    else createPage({ ...base, from: 'blank' })
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Add a page" width={640}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!ready} onClick={add}>Add page</Button></>}>
      <div className={styles.dialog}>
        <TextField label="Page name" value={title} autoFocus placeholder="e.g. About us" onChange={(event) => setTitle(event.target.value)} />
        <TextField label="Address" value={shownPath} hint="Where the page lives on your site." onChange={(event) => { setPath(event.target.value); setPathEdited(true) }} />
        <div className={styles.field}>
          <span>Start with</span>
          <SegmentedControl label="Start with" value={from} options={options} onChange={(value) => setFrom(value as From)} />
        </div>
        {from === 'code' && (
          <>
            <LazyCodeEditor label="Code for the new page" language="html" value={code} onChange={setCode} foldTools={false}
              placeholder="Paste the page your AI wrote. Its header and footer are left out: the site already has them." minHeight="220px" maxHeight="50vh" />
          </>
        )}
      </div>
    </Modal>
  )
}
