import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/shared/ui'
import { accessOf, hasCondition, conditionOf, VISITOR, type Viewer } from '../model/conditions'
import { isElement } from '../model/types'
import { useDocStore } from '../store/doc.store'
import { useViewStore } from '../store/view.store'
import styles from './Toolbar.module.css'

const label = (viewer: Viewer) =>
  !viewer.signedIn ? 'Visitor' : viewer.roles.length ? viewer.roles.join(', ') : 'Signed in'

/**
 * "Viewing as": see the page the way a visitor, a signed-in member or an
 * admin would (with some flags on). The editor and Preview follow it.
 * Shown once something on the page has a "who can see this" setting.
 */
export function ViewerMenu() {
  const viewer = useViewStore((state) => state.viewer)
  const setViewer = useViewStore((state) => state.setViewer)
  const used = useDocStore((state) => Object.values(state.doc.nodes).some((node) => isElement(node) && hasCondition(conditionOf(node))))
  const access = useDocStore((state) => state.doc.access)
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => !wrap.current?.contains(event.target as Node) && setOpen(false)
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])
  if (!used && viewer === VISITOR) return null

  const { roles, flags } = accessOf({ access })
  const who = [{ key: 'visitor', text: 'Visitor (signed out)', viewer: { ...VISITOR, flags: viewer.flags } },
    { key: 'member', text: 'Signed in', viewer: { signedIn: true, roles: [], flags: viewer.flags } },
    ...roles.map((role) => ({ key: `role:${role}`, text: `Signed in as ${role}`, viewer: { signedIn: true, roles: [role], flags: viewer.flags } }))]
  const current = !viewer.signedIn ? 'visitor' : viewer.roles[0] ? `role:${viewer.roles[0]}` : 'member'
  const toggleFlag = (flag: string, on: boolean) => setViewer({ ...viewer, flags: on ? [...viewer.flags, flag] : viewer.flags.filter((f) => f !== flag) })

  return (
    <div className={styles.viewer} ref={wrap}>
      <button type="button" className={styles.viewerButton} aria-expanded={open} onClick={() => setOpen(!open)} title="See the page as different visitors see it">
        <Icon name="eye" size={15} /> Viewing as: <strong>{label(viewer)}</strong>
      </button>
      {open && (
        <div className={styles.viewerMenu} role="dialog" aria-label="Viewing as">
          <div role="radiogroup" aria-label="Who">
            {who.map((option) => (
              <label key={option.key} className={styles.viewerOption}>
                <input type="radio" name="viewer" checked={current === option.key} onChange={() => setViewer(option.viewer)} /> {option.text}
              </label>
            ))}
          </div>
          {flags.length > 0 && <p className={styles.viewerTitle}>Features switched on</p>}
          {flags.map((flag) => (
            <label key={flag} className={styles.viewerOption}>
              <input type="checkbox" checked={viewer.flags.includes(flag)} onChange={(event) => toggleFlag(flag, event.target.checked)} /> {flag}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
