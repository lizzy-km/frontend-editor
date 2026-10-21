import { Icon } from '@/shared/ui'
import type { ReadProgress } from './readProject'
import styles from './UploadProgress.module.css'

const SHOWN_NAME = 38

/** A short, readable end of a long path ("…/components/Header.tsx"). */
const tail = (path: string) => (path.length > SHOWN_NAME ? `…${path.slice(-SHOWN_NAME)}` : path)

/** The animation shown while a .zip or folder is being read: files fly into a box, a bar fills and the file being read scrolls by. */
export function UploadProgress({ kind, name, progress }: { kind: 'zip' | 'folder'; name: string; progress: ReadProgress | null }) {
  const percent = progress && progress.total > 0 ? Math.min(100, Math.round((progress.done / progress.total) * 100)) : 0
  return (
    <section className={styles.card} aria-label="Reading your project" role="status">
      <div className={styles.stage} aria-hidden="true">
        <span className={styles.file} style={{ animationDelay: '0s' }}><Icon name="code" size={16} /></span>
        <span className={styles.file} style={{ animationDelay: '0.5s' }}><Icon name="code" size={16} /></span>
        <span className={styles.file} style={{ animationDelay: '1s' }}><Icon name="code" size={16} /></span>
        <span className={styles.box}><Icon name={kind === 'zip' ? 'upload' : 'layers'} size={26} /></span>
      </div>
      <div className={styles.text}>
        <strong>{kind === 'zip' ? 'Opening your .zip' : 'Reading your folder'}{name ? ` “${name}”` : ''}</strong>
        <small className={styles.current}>{progress?.current ? tail(progress.current) : 'Getting ready…'}</small>
        <div className={styles.meter} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{ width: `${Math.max(percent, 6)}%` }} /></div>
        <small>{percent}%{kind === 'folder' && progress ? ` · ${progress.done} of ${progress.total} files` : ''}</small>
      </div>
    </section>
  )
}
