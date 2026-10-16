import { Link, useLocation } from 'react-router-dom'
import { wasSignedIn } from '@/features/auth/auth.store'
import { TopBar } from '@/shared/ui'
import { FullGuide } from './FullGuide'
import { QuickGuide } from './QuickGuide'
import { guideLd } from './guideSeo'
import { JsonLd } from '@/shared/seo/Seo'
import styles from './Guide.module.css'

/** /guide = the quick guide (a page of short answers); /guide/full = every topic in detail. */
export default function GuidePage() {
  const { pathname, hash } = useLocation()
  const full = pathname.startsWith('/guide/full')
  return (
    <div className={styles.page}>
      <JsonLd data={guideLd(full)} />
      <TopBar>
        <Link to="/gallery" className="hideOnPhone">Explore</Link>
        {wasSignedIn() ? <Link to="/projects">My pages</Link> : <Link to="/login">Sign in</Link>}
      </TopBar>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Guide</p>
        <h1>{full ? 'The full guide' : 'The quick guide'}</h1>
        <p className={styles.lead}>
          {full ? 'Every feature, explained in plain words with the steps to follow.' : 'The short answer to “how do I…?” for everything in Tweak. Press Details for the long version.'}
        </p>
        <div className={styles.switch} role="tablist" aria-label="Guide length">
          <Link to="/guide" role="tab" aria-selected={!full}>Quick guide</Link>
          <Link to="/guide/full" role="tab" aria-selected={full}>Full guide</Link>
        </div>
      </header>
      <main className={styles.body}>{full ? <FullGuide hash={hash} /> : <QuickGuide />}</main>
      <footer className={styles.footer}>
        <span>Stuck? Start with <Link to="/guide/full#fix-problems">Fixing common problems</Link>.</span>
        <Link to="/try">Open the editor →</Link>
      </footer>
    </div>
  )
}
