import { Link } from 'react-router-dom'
import { wasSignedIn } from '@/features/auth/auth.store'
import { Icon, TopBar, type IconName } from '@/shared/ui'
import styles from './HomePage.module.css'

const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'copy', title: '1. Paste', text: 'Copy the code ChatGPT, Claude or any website gave you and paste it in.' },
  { icon: 'pencil', title: '2. Click & change', text: 'Click any text, picture or button to change words, colors and sizes.' },
  { icon: 'download', title: '3. Download', text: 'Get your finished page back as a file or a picture. No coding needed.' },
]

export default function HomePage() {
  return (
    <>
      <TopBar>
        <Link to="/gallery" className="hideOnPhone">Explore</Link>
        {wasSignedIn() ? <Link to="/projects">My pages</Link> : <Link to="/login">Sign in</Link>}
      </TopBar>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.kicker}><Icon name="sparkle" size={16} /> Made for people who don't code</p>
          <h1>Got a web page from AI?<br />Make it yours by clicking.</h1>
          <p className={styles.lead}>
            Paste the code, click what you want to change, and download it again. It's that simple.
          </p>
          <div className={styles.actions}>
            <Link to="/try" className={styles.primary}>Try it now — no account needed</Link>
            <Link to="/signup" className={styles.secondary}>Create a free account</Link>
          </div>
        </section>
        <ol className={styles.steps}>
          {STEPS.map((step) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepIcon}><Icon name={step.icon} size={22} /></span>
              <h2>{step.title}</h2>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </main>
    </>
  )
}
