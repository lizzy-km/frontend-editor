import { useEffect, useMemo, useState } from 'react'
import { DIAGRAM_PNG } from './docsFiles'
import { BlockView, parseMarkdown } from './markdown'
import styles from './dev.module.css'

/** A Markdown file from the repository, with a table of contents. Links between docs call `onNavigate` ("ARCHITECTURE.md"). */
export function DocView({ load, onNavigate }: { load: () => Promise<string>; onNavigate: (target: string) => void }) {
  const [text, setText] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    load().then((value) => { if (alive) setText(value) })
    return () => { alive = false }
  }, [load])

  const blocks = useMemo(() => (text ? parseMarkdown(text) : []), [text])
  const headings = blocks.filter((block) => block.kind === 'heading' && block.level >= 2 && block.level <= 3) as Extract<(typeof blocks)[number], { kind: 'heading' }>[]
  const render = useMemo(() => ({
    onLink: (target: string) => {
      if (target.startsWith('#')) document.getElementById(target.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else onNavigate(target.split('#')[0]!)
    },
    image: (src: string) => DIAGRAM_PNG[src.split('/').pop()!.replace(/\.\w+$/, '')] ?? src,
  }), [onNavigate])

  if (text === null) return <p className={styles.muted}>Loading…</p>
  return (
    <div className={styles.docLayout}>
      <article className={styles.doc}>{blocks.map((block, index) => <BlockView key={index} block={block} render={render} />)}</article>
      <nav className={styles.toc} aria-label="On this page">
        {headings.map((heading) => (
          <a key={heading.id + heading.text} href={`#${heading.id}`} className={heading.level === 3 ? styles.sub : ''} onClick={(event) => { event.preventDefault(); render.onLink(`#${heading.id}`) }}>{heading.text.replace(/`/g, '')}</a>
        ))}
      </nav>
    </div>
  )
}
