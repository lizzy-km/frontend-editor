import { useRef, useState } from 'react'
import type { Where } from '@/features/analytics/events'
import { track } from '@/features/analytics/track'
import { readSnapshot } from '@/features/export/react/snapshot'
import type { PageDoc } from '@/features/editor/model/types'
import { Button, Icon } from '@/shared/ui'
import { readFolder, readZip } from './readProject'
import styles from './PasteScreen.module.css'

type Waiting = { doc: PageDoc; changed: string[] }

/**
 * "Open a React project": a .zip or folder that Tweak downloaded earlier. The hidden
 * .tweak file inside brings the page back exactly; files edited elsewhere are listed first.
 */
export function ReactProjectOpener({ onOpen, where }: { onOpen: (doc: PageDoc) => void; where: Where }) {
  const zipInput = useRef<HTMLInputElement>(null)
  const folderInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')
  const [waiting, setWaiting] = useState<Waiting | null>(null)

  const open = (doc: PageDoc, changed: number) => {
    track('react_project_open', { where, changed })
    onOpen(doc)
  }

  const load = async (read: () => Promise<Record<string, string>>) => {
    setBusy(true); setProblem(''); setWaiting(null)
    try {
      const result = readSnapshot(await read())
      if (!result.ok) setProblem(result.problem)
      else if (result.changed.length) setWaiting({ doc: result.doc, changed: result.changed })
      else open(result.doc, 0)
    } catch (error) {
      setProblem(error instanceof Error ? error.message : 'Couldn’t read that project.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.opener}>
      <p><strong>Already have a React project from Tweak?</strong> Open it again to keep editing by clicking.</p>
      <div className={styles.openerRow}>
        <Button icon="upload" disabled={busy} onClick={() => zipInput.current?.click()}>Open a .zip</Button>
        <Button icon="layers" variant="ghost" disabled={busy} onClick={() => folderInput.current?.click()}>Choose a folder</Button>
        {busy && <span className={styles.note}>Reading your project…</span>}
      </div>
      <input ref={zipInput} type="file" accept=".zip" hidden aria-label="React project .zip"
        onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void load(() => readZip(file)) }} />
      <input ref={folderInput} type="file" hidden aria-label="React project folder" {...{ webkitdirectory: '' }}
        onChange={(event) => { const list = event.target.files; if (list?.length) void load(() => readFolder(list)) }} />
      {problem && <p className={styles.problem} role="alert"><Icon name="help" size={16} /> {problem}</p>}
      {waiting && (
        <div className={styles.note} role="alert">
          <Icon name="help" size={16} />
          <span>
            {waiting.changed.length === 1 ? 'A file was' : `${waiting.changed.length} files were`} changed outside Tweak
            ({waiting.changed.slice(0, 4).join(', ')}{waiting.changed.length > 4 ? '…' : ''}). Tweak rebuilds the project from the page,
            so those changes won’t carry over when you download again.{' '}
            <button type="button" className={styles.link} onClick={() => open(waiting.doc, waiting.changed.length)}>Open anyway</button>
            {' · '}
            <button type="button" className={styles.link} onClick={() => setWaiting(null)}>Cancel</button>
          </span>
        </div>
      )}
    </div>
  )
}
