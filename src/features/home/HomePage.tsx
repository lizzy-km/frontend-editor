import { Link } from 'react-router-dom'
import { APP_NAME } from '@/config/app.config'
import { wasSignedIn } from '@/features/auth/auth.store'
import { SITE_URL } from '@/config/seo.config'
import { JsonLd } from '@/shared/seo/Seo'
import { organizationLd, softwareLd, websiteLd } from '@/shared/seo/jsonLd'
import { Icon, TopBar } from '@/shared/ui'
import { HeroMock } from './HeroMock'
import { AI_NAMES, AUDIENCE, DOWNLOADS, FEATURES, STEPS } from './homeContent'
import styles from './HomePage.module.css'
import sections from './HomeSections.module.css'

export default function HomePage() {
  return (
    <div className={styles.page}>
      <JsonLd data={[organizationLd(SITE_URL), websiteLd(SITE_URL), softwareLd(SITE_URL)]} />
      <TopBar>
        <a href="#features" className="hideOnPhone">What you can build</a>
        <Link to="/gallery" className="hideOnPhone">Explore</Link>
        <Link to="/guide" className="hideOnPhone">Guide</Link>
        {wasSignedIn() ? <Link to="/projects">My pages</Link> : <Link to="/login">Sign in</Link>}
      </TopBar>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.kicker}><Icon name="sparkle" size={16} /> A website builder for people who don't code</p>
          <h1>Build a real website <span className={styles.shine}>just by clicking.</span></h1>
          <p className={styles.lead}>
            Start from code your AI wrote, or from a blank page. Add pages, menus, sign-in, forms and live data in plain words,
            then share it or download a finished project.
          </p>
          <div className={styles.actions}>
            <Link to="/try" className={styles.primary}>Start building: no account needed <Icon name="arrowUp" size={18} className={styles.arrow} /></Link>
            <Link to="/gallery" className={styles.secondary}>See what others made</Link>
          </div>
          <p className={styles.small}>Free to try. No code, no setup.</p>
          <div className={styles.aiRow}>
            <span>Works with code from</span>
            {AI_NAMES.map((name) => <b key={name}>{name}</b>)}
          </div>
        </section>
        <HeroMock />

        <section id="features" className={sections.section}>
          <p className={sections.eyebrow}>Everything in one place</p>
          <h2>More than a page editor. A whole builder.</h2>
          <p className={sections.sub}>Each part works with a few clicks and plain words. No jargon, no setup.</p>
          <div className={sections.grid}>
            {FEATURES.map((feature) => (
              <article key={feature.title} className={`${sections.feature} ${sections[feature.tone]}`}>
                <span className={sections.icon}><Icon name={feature.icon} size={22} /></span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={sections.section}>
          <p className={sections.eyebrow}>How it works</p>
          <h2>From idea to finished in three steps</h2>
          <ol className={sections.steps}>
            {STEPS.map((step, index) => (
              <li key={step.title} className={sections.step}>
                <span className={sections.number}>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={sections.takeaway}>
          <div>
            <p className={sections.eyebrowLight}>Take it anywhere</p>
            <h2>Your page is yours. Download it in the form you need.</h2>
            <ul className={sections.downloads}>
              {DOWNLOADS.map((item) => (
                <li key={item.title}><Icon name="check" size={18} /><span><b>{item.title}</b> {item.text}</span></li>
              ))}
            </ul>
          </div>
          <pre className={sections.code} aria-label="Example of the React code you get"><code>{`export default function Hero() {
  return (
    <section className="hero">
      <h1>Fresh bread, every morning.</h1>
      <a href="/menu">See the menu</a>
    </section>
  )
}`}</code></pre>
        </section>

        <section className={sections.section}>
          <p className={sections.eyebrow}>Made for</p>
          <h2>Anyone with something to put online</h2>
          <div className={sections.audience}>
            {AUDIENCE.map((item) => (
              <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>
            ))}
          </div>
        </section>

        <section className={sections.final}>
          <h2>Ready to build yours?</h2>
          <p>It takes a minute to start. Paste a page, or begin with a blank one.</p>
          <div className={styles.actions}>
            <Link to="/try" className={styles.primary}>Start building free</Link>
            <Link to="/signup" className={sections.ghost}>Create a free account</Link>
          </div>
        </section>
      </main>
      <footer className={sections.footer}>
        <span>{APP_NAME} · build websites by clicking</span>
        <nav><Link to="/try">Try it</Link><Link to="/gallery">Explore</Link><Link to="/guide">Guide</Link><Link to="/login">Sign in</Link><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link></nav>
      </footer>
    </div>
  )
}
