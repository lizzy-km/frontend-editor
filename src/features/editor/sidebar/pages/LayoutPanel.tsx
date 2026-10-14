import { useState } from 'react'
import { Button, Switch } from '@/shared/ui'
import { createLayout, dropLayout } from '../../actions/pageActions'
import { layoutOf, ownHeader, type LayoutKind } from '../../model/layouts'
import { useDocStore } from '../../store/doc.store'
import styles from './Pages.module.css'

const CHOICES: { kind: LayoutKind; label: string; hint: string }[] = [
  { kind: 'top', label: 'Top bar', hint: 'A menu across the top' },
  { kind: 'side', label: 'Side menu', hint: 'A menu down the left' },
  { kind: 'both', label: 'Both', hint: 'Top bar with Log in, side menu for pages' },
]

/** Ready-made layouts: the menu is made from the pages and follows who can see them; on phones it becomes a ☰ button. */
export function LayoutPanel() {
  const current = useDocStore((state) => layoutOf(state.doc))
  const hasOwnHeader = useDocStore((state) => ownHeader(state.doc).length > 0)
  const [kind, setKind] = useState<LayoutKind>(current ?? 'top')
  const [replace, setReplace] = useState(true)

  return (
    <div className={styles.layout}>
      <p className={styles.layoutTitle}>Layout</p>
      <div className={styles.choices} role="group" aria-label="Layout">
        {CHOICES.map((choice) => (
          <button key={choice.kind} type="button" className={`${styles.choice} ${kind === choice.kind ? styles.chosen : ''}`}
            aria-pressed={kind === choice.kind} title={choice.hint} onClick={() => setKind(choice.kind)}>
            {choice.label}
          </button>
        ))}
      </div>
      {hasOwnHeader && <Switch label="Replace my current header" checked={replace} onChange={setReplace} />}
      <div className={styles.layoutActions}>
        <Button size="small" icon="layers" onClick={() => createLayout(kind, hasOwnHeader && replace)}>
          {current ? 'Update layout and menu' : 'Add layout'}
        </Button>
        {current && <Button size="small" icon="trash" variant="ghost" onClick={dropLayout}>Remove</Button>}
      </div>
      <p className={styles.note}>The menu lists your pages and follows who can see them. Add pages later, then press “Update layout and menu”.</p>
    </div>
  )
}
