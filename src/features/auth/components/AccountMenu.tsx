import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { features } from '@/config/features.config'
import { UsageStatsToggle } from '@/features/analytics/UsageStatsToggle'
import { Icon } from '@/shared/ui'
import { authService, useAuthStore } from '../auth.store'
import styles from './AccountMenu.module.css'

/** Avatar button with "My pages / Plans / Share usage stats / Sign out". */
export function AccountMenu() {
  const user = useAuthStore((state) => state.user)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  if (!user) return null

  const name = user.displayName || user.email || 'You'
  const signOut = async () => {
    await (await authService()).signOut()
    navigate('/')
  }

  return (
    <div className={styles.wrap} onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setOpen(false)}>
      <button type="button" className={styles.avatar} aria-expanded={open} aria-label="Account menu" onClick={() => setOpen(!open)}>
        {user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : name.charAt(0).toUpperCase()}
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          <p className={styles.name}>{name}</p>
          <Link role="menuitem" to="/projects" onClick={() => setOpen(false)}><Icon name="layers" size={16} /> My pages</Link>
          {features.enable_billing && <Link role="menuitem" to="/plans" onClick={() => setOpen(false)}><Icon name="sparkle" size={16} /> Plans</Link>}
          <UsageStatsToggle />
          <button type="button" role="menuitem" onClick={signOut}><Icon name="logout" size={16} /> Sign out</button>
        </div>
      )}
    </div>
  )
}
