import { Fragment, type ReactNode } from 'react'
import type { Block } from './guideTypes'
import styles from './Guide.module.css'

/** **bold** for names on screen, `code` for things typed or shown in code. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return (
    <>
      {parts.map((part, index): ReactNode => {
        if (part.startsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>
        if (part.startsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>
        return <Fragment key={index}>{part}</Fragment>
      })}
    </>
  )
}

/** One piece of a topic: a paragraph, steps, a list, a tip, a note or a table. */
export function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'p': return <p className={styles.p}><Rich text={block.text} /></p>
    case 'steps': return <ol className={styles.steps}>{block.items.map((item) => <li key={item}><Rich text={item} /></li>)}</ol>
    case 'list': return <ul className={styles.list}>{block.items.map((item) => <li key={item}><Rich text={item} /></li>)}</ul>
    case 'tip': return <p className={`${styles.callout} ${styles.tip}`}><b>Tip</b><span><Rich text={block.text} /></span></p>
    case 'note': return <p className={`${styles.callout} ${styles.note}`}><b>Good to know</b><span><Rich text={block.text} /></span></p>
    case 'figure': return (
      <figure className={styles.figure}>
        <img src={block.src} alt={block.alt} loading="lazy" />
        <figcaption>{block.caption}</figcaption>
      </figure>
    )
    case 'table': return (
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr>{block.head.map((cell, index) => <th key={index}>{cell}</th>)}</tr></thead>
          <tbody>{block.rows.map((row, index) => <tr key={index}>{row.map((cell, i) => <td key={i}><Rich text={cell} /></td>)}</tr>)}</tbody>
        </table>
      </div>
    )
  }
}
