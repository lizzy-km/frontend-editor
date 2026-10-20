import { Link } from 'react-router-dom'
import { features } from '@/config/features.config'
import { LEGAL_UPDATED, missingLegalSettings } from '@/config/legal.config'
import { wasSignedIn } from '@/features/auth/auth.store'
import { TopBar } from '@/shared/ui'
import { Rich } from './text'
import type { LegalBlock, LegalDoc, LegalSection } from './types'
import styles from './Legal.module.css'

/** The sections that apply right now (paid plans and the marketplace only while they are switched on). */
export const visibleSections = (doc: LegalDoc): LegalSection[] =>
  doc.sections.filter((section) => !section.when || (section.when === 'billing' ? features.enable_billing : features.enable_marketplace))

function Block({ block }: { block: LegalBlock }) {
  if (block.kind === 'p') return <p><Rich text={block.text} /></p>
  if (block.kind === 'note') return <p className={styles.note}><Rich text={block.text} /></p>
  if (block.kind === 'list') return <ul>{block.items.map((item) => <li key={item}><Rich text={item} /></li>)}</ul>
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead><tr>{block.head.map((cell) => <th key={cell} scope="col">{cell}</th>)}</tr></thead>
        <tbody>{block.rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={index}><Rich text={cell} /></td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}

/** A legal text: title, date, a table of contents and numbered sections. */
export function LegalDocument({ doc, other }: { doc: LegalDoc; other: { label: string; to: string } }) {
  const sections = visibleSections(doc)
  const missing = import.meta.env.DEV ? missingLegalSettings() : []
  return (
    <div className={styles.page}>
      <TopBar>
        <Link to="/guide" className="hideOnPhone">Guide</Link>
        {wasSignedIn() ? <Link to="/projects">My pages</Link> : <Link to="/login">Sign in</Link>}
      </TopBar>
      <main className={styles.main}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Legal</p>
          <h1>{doc.title}</h1>
          <p className={styles.updated}>Last updated {new Date(`${LEGAL_UPDATED}T00:00:00Z`).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })} · <Link to={other.to}>{other.label}</Link></p>
          <p className={styles.lead}><Rich text={doc.intro} /></p>
          {missing.length > 0 && <p className={styles.dev} role="note">Development note: set {missing.join(', ')} in .env before launch (shown as [… not set] below).</p>}
        </header>
        <div className={styles.layout}>
          <nav className={styles.toc} aria-label="On this page">
            <ol>{sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol>
          </nav>
          <article className={styles.body}>
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
                <h2 id={`${section.id}-title`}><span>{index + 1}.</span> {section.title}</h2>
                {section.blocks.map((block, at) => <Block key={at} block={block} />)}
              </section>
            ))}
          </article>
        </div>
      </main>
    </div>
  )
}
