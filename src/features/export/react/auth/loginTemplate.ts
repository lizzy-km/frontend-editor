import { AFTER_SIGN_IN } from './guardTemplates'
import { ROUTERS, type RouterKind } from '../routerTemplates'

/** A standard login page for sites without their own /login page. */
/** src/pages/LoginPage.tsx */
export const loginFallbackSource = (kind: RouterKind) => `import { useState, type FormEvent } from 'react'
${kind === 'tanstack' ? `import { useNavigate } from '${ROUTERS[kind].lib}'\n` : ''}import { useAuth } from '../auth/useAuth'

/** Sign-in for the signed-in only pages. Demo accounts: admin@example.com / admin123, member@example.com / member123. */
export default function LoginPage() {
  const { signIn } = useAuth()
${kind === 'tanstack' ? '  const navigate = useNavigate()\n' : ''}  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(email, password)
      ${kind === 'react-router'
    ? '// The page\'s guard (RequireAuth signedOut) now sends them on to the page they wanted.'
    : `const target = ${AFTER_SIGN_IN}
      sessionStorage.removeItem('auth:redirect')
      // The address is only known at run time, so it is not one of the typed routes.
      void navigate({ to: target as never, replace: true })`}
    } catch (caught) {
      setError((caught as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section style={{ maxWidth: 380, margin: '0 auto', padding: '96px 24px' }}>
      <h1>Sign in</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12, marginTop: 24 }}>
        <label style={{ display: 'grid', gap: 4 }}>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label style={{ display: 'grid', gap: 4 }}>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}
        <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </section>
  )
}
`
