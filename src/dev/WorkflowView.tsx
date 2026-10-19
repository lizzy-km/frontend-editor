import { useEffect, useRef, useState } from 'react'
import { Button } from '@/shared/ui'
import { DIAGRAM_SOURCE, DIAGRAM_SVG } from './docsFiles'
import styles from './dev.module.css'
import view from './WorkflowView.module.css'

export type Diagram = { id: string; title: string; text: string }

export const DIAGRAMS: Diagram[] = [
  { id: '01-journey', title: 'The journey', text: 'What a person does, from the first visit to a download.' },
  { id: '02-editor', title: 'Inside the editor', text: 'How a click becomes an edit: actions, commit, stores, the sandboxed frame.' },
  { id: '03-model', title: 'The page model', text: 'What a page is made of and how features are marked on boxes.' },
  { id: '04-outputs', title: 'From page to files', text: 'Preview, .html, .zip, .png and the React project, and how a project is reopened.' },
  { id: '05-accounts', title: 'Accounts, saving, sharing', text: 'Firebase Auth, Firestore, autosave, picture uploads, shared pages.' },
  { id: '06-data', title: 'Data', text: 'Sources, lists, tables, records, filters, card clicks and pop-ups.' },
  { id: '07-components', title: 'Reusable components', text: 'How one change to the main component reaches every copy.' },
  { id: '08-build', title: 'Building and shipping', text: 'Checks, build, static SEO pages, host.' },
  { id: '09-architecture', title: 'System architecture', text: 'The layers from the host down to the services.' },
  { id: '10-er-storage', title: 'ER: saved data', text: 'The Firestore collections: users, pages, page content, library components, and how they point at each other.' },
  { id: '11-er-page', title: 'ER: the page document', text: 'What one saved page holds: boxes, styles, attributes, data sources, scripts, head tags, access.' },
  { id: '12-er-features', title: 'ER: features on boxes', text: 'How lists, pop-ups, clicks, flags, components and the library relate to boxes and data.' },
]

/** The workflow diagrams (the main list unless given another): pick one, zoom, open it full size, or read its Mermaid source. */
export function WorkflowView({ diagrams = DIAGRAMS }: { diagrams?: Diagram[] }) {
  const [id, setId] = useState(diagrams[0]!.id)
  const [zoom, setZoom] = useState(1)
  const [source, setSource] = useState<string | null>(null)
  const [showSource, setShowSource] = useState(false)
  const current = diagrams.find((item) => item.id === id)!
  const frame = useRef<HTMLDivElement>(null)
  const picture = useRef<HTMLImageElement>(null)
  /** Zoom so the picture shows at its own size. */
  const actualSize = () => setZoom(Math.min(3, Math.max(0.25, (picture.current?.naturalWidth ?? 0) / Math.max(1, (frame.current?.clientWidth ?? 1) - 32))))

  useEffect(() => {
    let alive = true
    DIAGRAM_SOURCE[id]?.().then((text) => { if (alive) setSource(text) })
    return () => { alive = false }
  }, [id])

  return (
    <div className={view.layout}>
      <nav className={view.list} aria-label="Diagrams">
        {diagrams.map((item, index) => (
          <button key={item.id} type="button" className={view.item} aria-current={item.id === id} onClick={() => { setId(item.id); setShowSource(false); setSource(null) }}>
            <b>{index + 1}</b>
            <span><strong>{item.title}</strong><small>{item.text}</small></span>
          </button>
        ))}
      </nav>
      <section className={view.stage}>
        <header className={view.bar}>
          <h2>{current.title}</h2>
          <span className={styles.muted}>{current.text}</span>
          <div className={view.tools}>
            <Button size="small" variant="ghost" onClick={() => setZoom((value) => Math.max(0.25, value - 0.25))} aria-label="Zoom out">−</Button>
            <span aria-live="polite">{Math.round(zoom * 100)}%</span>
            <Button size="small" variant="ghost" onClick={() => setZoom((value) => Math.min(3, value + 0.25))} aria-label="Zoom in">+</Button>
            <Button size="small" variant="ghost" onClick={() => setZoom(1)}>Fit</Button>
            <Button size="small" variant="ghost" onClick={actualSize}>Actual size</Button>
            <Button size="small" variant="ghost" onClick={() => setShowSource(!showSource)}>{showSource ? 'Picture' : 'Mermaid source'}</Button>
            <a href={DIAGRAM_SVG[id]} target="_blank" rel="noreferrer">Open full size</a>
          </div>
        </header>
        {showSource
          ? <pre className={view.source}><code>{source ?? 'Loading…'}</code></pre>
          : <div className={view.canvas} ref={frame}><img ref={picture} src={DIAGRAM_SVG[id]} alt={current.title} style={{ width: `${zoom * 100}%` }} /></div>}
      </section>
    </div>
  )
}
