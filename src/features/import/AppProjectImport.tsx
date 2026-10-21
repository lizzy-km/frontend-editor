import { useState } from 'react'
import type { PageDoc } from '@/features/editor/model/types'
import type { AppImport } from '@/features/importReact/importApp'
import { Button, Icon } from '@/shared/ui'
import { ImportProgress } from './ImportProgress'
import { advance, startProgress, type ProgressState } from './progressState'
import styles from './PasteScreen.module.css'

type Stage = { name: 'ask' } | { name: 'running'; progress: ProgressState } | { name: 'done'; result: Extract<AppImport, { ok: true }> } | { name: 'failed'; message: string }

/** A React project that Tweak did not make: explain what opening it means, run the import with progress, show what was found. */
export function AppProjectImport({ files, onOpen, onCancel }: { files: Record<string, string>; onOpen: (doc: PageDoc) => void; onCancel: () => void }) {
  const [stage, setStage] = useState<Stage>({ name: 'ask' })

  const start = async () => {
    setStage({ name: 'running', progress: startProgress() })
    const { importReactApp } = await import('@/features/importReact/importApp')
    const result = await importReactApp(files, (event) => setStage((current) => (current.name === 'running' ? { name: 'running', progress: advance(current.progress, event) } : current)))
    setStage(result.ok ? { name: 'done', result } : { name: 'failed', message: result.message })
  }

  if (stage.name === 'ask') {
    return (
      <div className={styles.note} role="alert">
        <Icon name="help" size={16} />
        <span>
          This React project was not made by Tweak. Tweak can still open it: it runs the project here, visits every page and turns what it sees into pages you can change by clicking.
          The look and the sample content carry over, but not the project’s own code (sign-in, data and forms): when you download again you get a new Tweak project.{' '}
          <Button size="small" variant="primary" onClick={start}>Open it as a Tweak site</Button>{' '}
          <button type="button" className={styles.link} onClick={onCancel}>Cancel</button>
        </span>
      </div>
    )
  }
  if (stage.name === 'running') return <ImportProgress state={stage.progress} />
  if (stage.name === 'failed') return <p className={styles.problem} role="alert"><Icon name="help" size={16} /> {stage.message} <button type="button" className={styles.link} onClick={onCancel}>Close</button></p>
  const { result } = stage
  return (
    <div className={styles.note} role="status">
      <Icon name="check" size={16} />
      <span>
        Found {result.pages.length} {result.pages.length === 1 ? 'page' : 'pages'}: {result.pages.map((page) => `${page.title}${page.private ? ' (members only)' : ''}`).join(', ')}.
        {result.warnings.length > 0 && <> Notes: {result.warnings.slice(0, 3).join(' ')}</>}{' '}
        <Button size="small" variant="primary" onClick={() => onOpen(result.doc)}>Open in the editor</Button>{' '}
        <button type="button" className={styles.link} onClick={onCancel}>Cancel</button>
      </span>
    </div>
  )
}
