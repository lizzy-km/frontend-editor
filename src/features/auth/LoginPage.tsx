import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, TextField } from '@/shared/ui'
import { authService } from './auth.store'
import { AuthCard } from './components/AuthCard'
import styles from './components/AuthCard.module.css'
import { OAuthButtons } from './components/OAuthButtons'
import { useAfterSignIn, useAuthAction, useRedirectIfSignedIn } from './components/useAuthAction'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { busy, error, run } = useAuthAction()
  const done = useAfterSignIn()
  useRedirectIfSignedIn()
  const [params] = useSearchParams()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void run(async () => (await authService()).signInWithEmail(email, password), done)
  }

  return (
    <AuthCard
      title="Welcome back" subtitle="Sign in to see your saved pages."
      footer={<>New here? <Link to={`/signup?${params}`}>Create a free account</Link></>}
    >
      <OAuthButtons run={run} onDone={done} busy={busy} />
      <form className={styles.form} onSubmit={submit}>
        <TextField label="Email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        <TextField label="Password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        <div className={styles.row}><Link to="/reset">Forgot your password?</Link></div>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <Button type="submit" variant="primary" size="large" full loading={busy}>Sign in</Button>
      </form>
    </AuthCard>
  )
}
