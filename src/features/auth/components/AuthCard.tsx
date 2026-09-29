import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { isFirebaseConfigured } from '@/lib/firebaseConfig'
import { TopBar } from '@/shared/ui'
import styles from './AuthCard.module.css'

type Props = { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }

/** Shared frame for sign in / sign up / reset password. */
export function AuthCard({ title, subtitle, children, footer }: Props) {
  return (
    <>
      <TopBar><Link to="/try">Try without an account</Link></TopBar>
      <main className={styles.page}>
        <div className={styles.card}>
          <h1>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {isFirebaseConfigured ? children : <NotConfigured />}
        </div>
        {footer && <p className={styles.footer}>{footer}</p>}
      </main>
    </>
  )
}

/** Shown when the app owner hasn't added Firebase keys yet. */
function NotConfigured() {
  return (
    <div className={styles.notice} role="status">
      <strong>Accounts aren’t switched on yet.</strong>
      <p>
        You can still paste, edit and download pages with <Link to="/try">Try it</Link> — your work is kept in this browser.
      </p>
      <p className={styles.dev}>For the app owner: fill in the Firebase values in <code>.env</code> (see <code>.env.example</code>).</p>
    </div>
  )
}
