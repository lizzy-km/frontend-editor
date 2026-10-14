import { setAuthEndpoint } from '../../actions/accessActions'
import { AUTH_ENDPOINTS } from '../../model/authApi'
import { TextControl } from '../../inspector/controls/TextControl'
import { useDocStore } from '../../store/doc.store'
import styles from './Data.module.css'

/** Where a React download signs people in: one path per call, the usual ones until changed. */
export function AuthApiSettings() {
  const authApi = useDocStore((state) => state.doc.authApi)
  return (
    <details className={styles.settings}>
      <summary className={styles.settingsTitle}>Sign-in API (optional)</summary>
      <p className={styles.hint}>
        Used by the React download when something is shown only to signed-in people. Until you set <code>VITE_USE_MOCK=false</code> it
        signs in with demo accounts (admin@example.com / admin123, member@example.com / member123).
      </p>
      {AUTH_ENDPOINTS.map((item) => (
        <label key={item.key} className={styles.field}>
          <span>{item.label}</span>
          <TextControl label={`${item.label} address`} value={authApi?.[item.key] ?? ''} placeholder={item.path} onChange={(path) => setAuthEndpoint(item.key, path)} />
        </label>
      ))}
      <p className={styles.hint}>Addresses starting with “/” are added to <code>VITE_API_URL</code>. Empty boxes use the gray address.</p>
    </details>
  )
}
