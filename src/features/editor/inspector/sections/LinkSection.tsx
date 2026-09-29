import { Switch } from '@/shared/ui'
import { setAttribute, setAttributes } from '../../actions/nodeActions'
import type { ElementNode } from '../../model/types'
import { TextControl } from '../controls/TextControl'
import styles from '../controls/Controls.module.css'
import { Section } from '../Section'

/** Where a link or button-link goes. */
export function LinkSection({ node }: { node: ElementNode }) {
  const newTab = node.attrs.target === '_blank'
  return (
    <Section title="Link" icon="link">
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
