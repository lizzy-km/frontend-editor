import { useMemo } from 'react'
import { Switch } from '@/shared/ui'
import { setFlagClick } from '../../actions/flagActions'
import { renamePopup, setAsk, setCloses, setOpens } from '../../actions/popupActions'
import { accessOf } from '../../model/conditions'
import { FLAG_ATTR, FLAG_MODES, flagClickOf, type FlagMode } from '../../model/flagClicks'
import { ASK_ATTR, CLOSE_ATTR, MODAL_ATTR, OPEN_ATTR, popupsOf } from '../../model/popups'
import { getAncestorIds } from '../../model/tree/queries'
import type { ElementNode } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { SelectControl } from '../controls/ChoiceControls'
import styles from '../controls/Controls.module.css'
import { TextControl } from '../controls/TextControl'
import panel from '../Inspector.module.css'
import { Section } from '../Section'

/** The pop-up box itself: its name (what buttons point at). */
export function PopupSection({ node }: { node: ElementNode }) {
  return (
    <Section title="Pop-up" icon="box">
      <div className={styles.row} title="Buttons and links open this pop-up by its name">
        <span className={styles.label}>Name</span>
        <TextControl label="Pop-up name" value={node.attrs[MODAL_ATTR] ?? ''} onChange={(name) => renamePopup(node.id, name)} />
      </div>
      <p className={panel.note}>Visitors see this box over the page once something opens it: click a button, then choose “Opens pop-up” in its settings. It closes with a close button, the Esc key, or a click outside.</p>
    </Section>
  )
}

/** What clicking an element does with pop-ups, and asking first. */
export function ClickSection({ node }: { node: ElementNode }) {
  const nodes = useDocStore((state) => state.doc.nodes)
  const popups = useMemo(() => popupsOf(nodes), [nodes])
  const inPopup = useMemo(() => getAncestorIds(nodes, node.id).some((id) => MODAL_ATTR in ((nodes[id] as ElementNode | undefined)?.attrs ?? {})), [nodes, node.id])
  const flags = useDocStore((state) => accessOf(state.doc).flags)
  const flagClick = flagClickOf(node.attrs)
  const used = Boolean(node.attrs[FLAG_ATTR] || node.attrs[OPEN_ATTR] || node.attrs[ASK_ATTR] || CLOSE_ATTR in node.attrs)
  return (
    <Section title="When clicked" icon="pencil" defaultOpen={used}>
      {popups.length > 0 && (
        <div className={styles.row} title="Clicking this opens the pop-up">
          <span className={styles.label}>Opens</span>
          <SelectControl label="Opens pop-up" value={node.attrs[OPEN_ATTR] ?? ''} onChange={(name) => setOpens(node.id, name)}
            options={[{ value: '', label: 'Nothing' }, ...popups.map((popup) => ({ value: popup.name, label: popup.name }))]} />
        </div>
      )}
      {inPopup && <Switch label="Closes the pop-up" checked={CLOSE_ATTR in node.attrs} onChange={(on) => setCloses(node.id, on)} />}
      <div className={styles.row} title="Clicking changes a flag for the visitor. Boxes set to “Only when these flags are on” then appear or hide. Add flags under “Who can see this”.">
        <span className={styles.label}>Flag</span>
        <SelectControl label="Flag to change" value={flagClick?.flag ?? ''} onChange={(flag) => setFlagClick(node.id, flag, flagClick?.mode ?? 'toggle')}
          options={[{ value: '', label: flags.length ? 'Nothing' : 'None yet: add one under “Who can see this”' }, ...flags.map((flag) => ({ value: flag, label: flag }))]} />
      </div>
      {flagClick && (
        <div className={styles.row}>
          <span className={styles.label}>Then</span>
          <SelectControl label="What happens to the flag" value={flagClick.mode} onChange={(mode) => setFlagClick(node.id, flagClick.flag, mode as FlagMode)} options={FLAG_MODES} />
        </div>
      )}
      <div className={styles.row} title="A question visitors must say yes to before the click does anything. Empty = no question.">
        <span className={styles.label}>Ask first</span>
        <TextControl label="Ask first question" value={node.attrs[ASK_ATTR] ?? ''} placeholder="e.g. Are you sure?" onChange={(message) => setAsk(node.id, message)} />
      </div>
    </Section>
  )
}
