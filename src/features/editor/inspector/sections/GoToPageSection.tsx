import { useMemo } from 'react'
import { setAttribute } from '../../actions/nodeActions'
import { GO_ATTR, listPages } from '../../model/pages'
import type { ElementNode } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { SelectControl } from '../controls/ChoiceControls'
import styles from '../controls/Controls.module.css'
import { Section } from '../Section'

/** Sites: clicking this box (a card, a banner, a picture…) opens a page. */
export function GoToPageSection({ node }: { node: ElementNode }) {
  const doc = useDocStore((state) => state.doc)
  const pages = useMemo(() => listPages(doc), [doc])
  if (pages.length === 0) return null
  const options = [{ value: '', label: 'Nothing (stays here)' }, ...pages.map((page) => ({ value: page.path, label: `${page.title} (${page.path})` }))]
  return (
    <Section title="Click goes to" icon="link" defaultOpen={Boolean(node.attrs[GO_ATTR])}>
      <div className={styles.row} title="Visitors can click anywhere on this box to open the page">
        <span className={styles.label}>Page</span>
        <SelectControl label="Click goes to page" value={node.attrs[GO_ATTR] ?? ''} options={options}
          onChange={(path) => setAttribute(node.id, GO_ATTR, path)} />
      </div>
    </Section>
  )
}
