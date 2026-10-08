import { useState } from 'react'
import { track } from '@/features/analytics/track'
import { LazyCodeEditor } from '@/shared/code/LazyCodeEditor'
import { Button, Icon, toast } from '@/shared/ui'
import { insertHtml } from '../actions/contentActions'
import { looksLikeHtml, stripCodeFences } from '../model/parse/cleanPaste'
import { BLOCKS } from './blocks'
import styles from './Sidebar.module.css'

/** Add a basic piece, or paste more code (e.g. "a pricing section" from an AI). */
export function AddPanel() {
  const [code, setCode] = useState('')

  const addCode = () => {
    if (!looksLikeHtml(code)) return toast("That doesn't look like HTML code.", 'error')
    // Only the <body> part is useful here; a full document's head is dropped.
    const body = stripCodeFences(code).match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? stripCodeFences(code)
    insertHtml(body)
    track('add_block', { block: 'pasted-code' })
    setCode('')
    toast('Added to your page', 'success')
  }

  return (
    <div className={styles.add}>
      <p className={styles.addHint}>New things go inside the selected box, or after the selected element.</p>
      <div className={styles.blocks}>
        {BLOCKS.map((block) => (
          <button key={block.id} type="button" className={styles.block} onClick={() => {
            insertHtml(block.html)
            track('add_block', { block: block.id })
          }}>
            <Icon name={block.icon} size={20} />
            <span>{block.label}</span>
          </button>
        ))}
      </div>
      <span className={styles.addLabel}>Paste more code</span>
      <LazyCodeEditor label="Paste more code" language="html" value={code} onChange={setCode} placeholder="e.g. a section your AI wrote…"
        foldTools={false} minHeight="110px" maxHeight="260px" />
      <Button size="small" icon="plus" disabled={!code.trim()} onClick={addCode}>Add this code</Button>
    </div>
  )
}
