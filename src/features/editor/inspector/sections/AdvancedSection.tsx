import { Button } from '@/shared/ui'
import { changeTag, setAttribute } from '../../actions/nodeActions'
import { resetStyles } from '../../actions/styleActions'
import type { ElementNode } from '../../model/types'
import { useViewStore } from '../../store/view.store'
import { SelectControl } from '../controls/ChoiceControls'
import styles from '../controls/Controls.module.css'
import { TextControl } from '../controls/TextControl'
import { Section } from '../Section'
import { CustomCssList } from './CustomCssList'

/** Tags an element may safely switch between (same "family"). */
const TAG_FAMILIES = [
  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'],
  ['div', 'section', 'header', 'footer', 'main', 'article', 'aside', 'nav'],
  ['ul', 'ol'],
  ['span', 'strong', 'em', 'small'],
]
const TAG_LABELS: Record<string, string> = { h1: 'Heading 1 (biggest)', h2: 'Heading 2', h3: 'Heading 3', h4: 'Heading 4', h5: 'Heading 5', h6: 'Heading 6', p: 'Paragraph', ul: 'Bullet list', ol: 'Numbered list' }

/** For people who know a bit of code: element type, class, id, raw CSS. */
export function AdvancedSection({ node }: { node: ElementNode }) {
  const breakpoint = useViewStore((state) => state.breakpoint)
  const family = TAG_FAMILIES.find((tags) => tags.includes(node.tag))
  const overrides = node.styles[breakpoint] ?? {}

  return (
    <Section title="Advanced" icon="code" defaultOpen={false}>
      {family && (
        <div className={styles.row}>
          <span className={styles.label}>Element type</span>
          <SelectControl label="Element type" value={node.tag} onChange={(tag) => changeTag(node.id, tag)} options={family.map((tag) => ({ value: tag, label: TAG_LABELS[tag] ?? `<${tag}>` }))} />
        </div>
      )}
      <div className={styles.row}>
        <span className={styles.label}>Class</span>
        <TextControl label="CSS class" value={node.attrs.class ?? ''} onChange={(value) => setAttribute(node.id, 'class', value)} />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>ID</span>
        <TextControl label="HTML id" value={node.attrs.id ?? ''} onChange={(value) => setAttribute(node.id, 'id', value.replace(/\s+/g, '-'))} />
      </div>
      <p className={styles.label}>My CSS on this screen size</p>
      <CustomCssList id={node.id} overrides={overrides} />
      {Object.keys(overrides).length > 0 && (
        <Button size="small" variant="ghost" icon="undo" onClick={() => resetStyles(node.id)}>Undo all my changes here</Button>
      )}
    </Section>
  )
}
