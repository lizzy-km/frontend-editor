import { updateDoc } from '../../actions/commit'
import { useDocStore } from '../../store/doc.store'
import styles from '../controls/Controls.module.css'
import { TextControl } from '../controls/TextControl'
import { Section } from '../Section'

/** Settings for the whole page (shown when the page itself is selected). */
export function PageSection() {
  const title = useDocStore((state) => state.doc.title)
  return (
    <Section title="Page" icon="desktop">
      <div className={styles.row} title="Shown on the browser tab and in search results">
        <span className={styles.label}>Page title</span>
        <TextControl label="Page title" value={title} onChange={(value) => updateDoc((doc) => ({ ...doc, title: value }))} />
      </div>
    </Section>
  )
}
