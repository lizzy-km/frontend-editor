import { useState, type ReactNode } from 'react'
import { Icon } from '@/shared/ui'
import styles from './CodeSection.module.css'

const STORAGE_KEY = 'tweak:code-sections'

/** Remembered open/closed state per box, in this browser only (safe if storage is blocked). */
function readSaved(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, boolean> } catch { return {} }
}

function save(id: string, open: boolean) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readSaved(), [id]: open })) } catch { /* optional */ }
}

type Props = {
  /** Stable key for remembering open/closed (e.g. "html", "css", "script-0"). */
  id: string
  title: string
  /** Short info next to the title, e.g. "42 lines". */
  info?: string
  defaultOpen?: boolean
  children: ReactNode
}

/**
 * A code box that can be collapsed/expanded from its header.
 * The editor loads the first time it's opened, and afterwards is only hidden
 * when collapsed — so code typed but not applied yet is never thrown away.
 */
export function CodeSection({ id, title, info, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(() => readSaved()[id] ?? defaultOpen)
  const [everOpened, setEverOpened] = useState(open)

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) setEverOpened(true)
    save(id, next)
  }

  return (
    <section className={styles.section}>
      <button type="button" className={styles.header} aria-expanded={open} onClick={toggle}>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={16} />
        <span className={styles.title}>{title}</span>
        {info && <span className={styles.info}>{info}</span>}
      </button>
      {everOpened && <div className={styles.body} hidden={!open}>{children}</div>}
    </section>
  )
}

/** "1 line" / "42 lines" for a piece of code. */
export const lineCount = (code: string) => {
  const lines = code ? code.split('\n').length : 0
  return `${lines} line${lines === 1 ? '' : 's'}`
}
