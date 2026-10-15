import { useState } from 'react'
import { LazyCodeEditor } from '@/shared/code/LazyCodeEditor'
import { Button, Modal, TextField } from '@/shared/ui'
import { createPage } from '../../actions/pageActions'
import { detailPageHtml, detailPath, detailTitle } from '../../model/detailPage'
import type { NewPage } from '../../model/pageOps'
import { slugify, type PageInfo } from '../../model/pages'
import { SegmentedControl, SelectControl } from '../../inspector/controls/ChoiceControls'
import { useDocStore } from '../../store/doc.store'
import styles from './Pages.module.css'

type From = NewPage['from'] | 'detail'
type Props = { onClose: () => void; currentPage: PageInfo | null }

/** New page: a name, an address, and what it starts with (empty, pasted code, or a copy). */
export function AddPageDialog({ onClose, currentPage }: Props) {
  const [title, setTitle] = useState('')
  const [path, setPath] = useState('')
  const [pathEdited, setPathEdited] = useState(false)
  const [from, setFrom] = useState<From>('blank')
  const [code, setCode] = useState('')
  const sources = useDocStore((state) => state.doc.data) ?? []
  const [sourceName, setSourceName] = useState('')
  const source = sources.find((item) => item.name === sourceName) ?? sources[0]
  const detail = from === 'detail' && source
  const shownTitle = title.trim() || (detail ? detailTitle(source) : '')
  const shownPath = pathEdited ? path : detail ? detailPath(source) : `/${slugify(title || 'new page')}`

  const options = [
    { value: 'blank', label: 'Empty' },
    { value: 'code', label: 'Paste code' },
    ...(sources.length ? [{ value: 'detail', label: 'Detail page' }] : []),
    ...(currentPage ? [{ value: 'copy', label: `Copy of ${currentPage.title}` }] : []),
  ]
  const ready = shownTitle && (from !== 'code' || code.trim())

  const add = () => {
    const base = { title: shownTitle, path: shownPath }
    if (detail) createPage({ ...base, from: 'code', code: detailPageHtml(source) })
    else if (from === 'code') createPage({ ...base, from, code })
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
        {detail && (
          <div className={styles.field}>
            <span>Shows one item of</span>
            <SelectControl label="Data for the detail page" value={source.name} options={sources.map((item) => ({ value: item.name, label: item.name }))} onChange={setSourceName} />
            <p className={styles.hint}>One page for every item: <code>{shownPath.replace(':id', '3')}</code> shows item 3, <code>{shownPath.replace(':id', '4')}</code> shows item 4. To open it, select your list and choose “Open page” under “On click”.</p>
          </div>
        )}
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
