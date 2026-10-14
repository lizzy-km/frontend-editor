import { Button } from '@/shared/ui'
import { updateDoc } from '../../actions/commit'
import { makeSite } from '../../actions/pageActions'
import { isMultiPage } from '../../model/pages'
import { useDocStore } from '../../store/doc.store'
import styles from '../controls/Controls.module.css'
import { TextControl } from '../controls/TextControl'
import { Section } from '../Section'

/** Settings for the whole page (shown when the page itself is selected). */
export function PageSection() {
  const title = useDocStore((state) => state.doc.title)
  const site = useDocStore((state) => isMultiPage(state.doc))
  return (
    <Section title="Page" icon="desktop">
      <div className={styles.row} title="Shown on the browser tab and in search results">
        <span className={styles.label}>Page title</span>
        <TextControl label="Page title" value={title} onChange={(value) => updateDoc((doc) => ({ ...doc, title: value }))} />
      </div>
      {!site && (
        <Button size="small" variant="ghost" icon="layers" onClick={makeSite}
          title="Your header and footer become shared by every page; this page becomes Home">
          Make this a website with several pages
        </Button>
      )}
    </Section>
  )
}
