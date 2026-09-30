import { setAttribute } from '../../actions/nodeActions'
import type { ElementNode } from '../../model/types'
import styles from '../controls/Controls.module.css'
import { TextControl } from '../controls/TextControl'
import { Section } from '../Section'

/** Tags whose grey hint text (placeholder) people want to change. */
export const HAS_PLACEHOLDER = new Set(['input', 'textarea'])

/** Hint text shown inside an empty input box. */
export function FormFieldSection({ node }: { node: ElementNode }) {
  return (
    <Section title="Input box" icon="box">
      <div className={styles.row} title="The grey example text shown before someone types">
        <span className={styles.label}>Hint text</span>
        <TextControl
          label="Hint text" value={node.attrs.placeholder ?? ''} placeholder="e.g. Your email"
          onChange={(value) => setAttribute(node.id, 'placeholder', value)}
        />
      </div>
    </Section>
  )
}
