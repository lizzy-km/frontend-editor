import { Switch } from '@/shared/ui'
import { setAttribute, setAttributes } from '../../actions/nodeActions'
import { listPages } from '../../model/pages'
import type { ElementNode } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { SelectControl } from '../controls/ChoiceControls'
import { TextControl } from '../controls/TextControl'
import styles from '../controls/Controls.module.css'
import { Section } from '../Section'

/** Where a link or button-link goes. */
export function LinkSection({ node }: { node: ElementNode }) {
  const newTab = node.attrs.target === '_blank'
  const doc = useDocStore((state) => state.doc)
  const pages = listPages(doc)
  return (
    <Section title="Link" icon="link">
      {pages.length > 0 && (
        <div className={styles.row} title="Link to another page of this site">
          <span className={styles.label}>Go to a page</span>
          <SelectControl label="Link to a page" value={node.attrs.href ?? ''}
            options={pages.map((page) => ({ value: page.path, label: `${page.title} (${page.path})` }))}
            onChange={(path) => setAttributes(node.id, { href: path, target: '', rel: '' })} />
        </div>
      )}
      <div className={styles.row}>
        <span className={styles.label}>Goes to</span>
        <TextControl
          label="Link address" value={node.attrs.href ?? ''} placeholder="https://… or #section"
          onChange={(value) => setAttribute(node.id, 'href', value)}
        />
      </div>
      <Switch
        label="Open in a new tab" checked={newTab}
        onChange={(checked) => setAttributes(node.id, checked ? { target: '_blank', rel: 'noopener' } : { target: '', rel: '' })}
      />
    </Section>
  )
}
