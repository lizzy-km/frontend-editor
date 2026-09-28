import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { APP_NAME } from '@/config/app.config'
import { ThemeToggle } from './ThemeToggle'
import styles from './TopBar.module.css'

/** Header used on every non-editor page. Pass links/buttons as children. */
export function TopBar({ children }: { children?: ReactNode }) {
  return (
    <header className={styles.bar}>
      <Link to="/" className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">T</span>
        {APP_NAME}
      </Link>
      <nav className={styles.nav}>
        {children}
        <ThemeToggle />
      </nav>
    </header>
  )
}
