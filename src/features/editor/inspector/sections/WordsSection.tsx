import { setText } from '../../actions/contentActions'
import { collectTextPieces } from '../../model/tree/textRules'
import { isText, type NodeMap } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import styles from '../Inspector.module.css'
import { Section } from '../Section'

const MAX_PIECES = 12

/**
 * For boxes that mix text with icons or pictures (the text editor can't open
 * them safely): every piece of text gets its own box. Formatting stays intact.
 */
export function WordsSection({ id }: { id: string }) {
  const nodes = useDocStore((state) => state.doc.nodes)
  const pieces = collectTextPieces(nodes, id).slice(0, MAX_PIECES)
  if (pieces.length === 0) return null

  return (
    <Section title="Words" icon="text">
      {pieces.map((textId) => <WordInput key={textId} nodes={nodes} textId={textId} />)}
    </Section>
  )
}

function WordInput({ nodes, textId }: { nodes: NodeMap; textId: string }) {
  const node = nodes[textId]
  if (!isText(node)) return null
  const lead = node.text.match(/^\s*/)?.[0] ?? ''
  const tail = node.text.match(/\s*$/)?.[0] ?? ''
  return (
    <textarea
      className={styles.words} rows={1} value={node.text.trim()} aria-label="Text"
      // Keep the original surrounding spaces so words don't glue together.
      onChange={(event) => setText(textId, `${lead}${event.target.value}${tail}`)}
    />
  )
}
