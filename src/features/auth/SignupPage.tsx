import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DEFAULT_MAX_PROJECTS } from '@/config/app.config'
import { Button, TextField } from '@/shared/ui'
import { authService } from './auth.store'
import { AuthCard } from './components/AuthCard'
import styles from './components/AuthCard.module.css'
import { OAuthButtons } from './components/OAuthButtons'
import { useAfterSignIn, useAuthAction, useRedirectIfSignedIn } from './components/useAuthAction'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { busy, error, run } = useAuthAction()
  const done = useAfterSignIn()
  useRedirectIfSignedIn()
  const [params] = useSearchParams()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void run(async () => (await authService()).signUpWithEmail(name, email, password), done)
  }

  return (
    <AuthCard
      title="Create your free account"
      subtitle={`Save up to ${DEFAULT_MAX_PROJECTS} pages and come back to them anytime.`}
      footer={<>Already have an account? <Link to={`/login?${params}`}>Sign in</Link></>}
    >
      <OAuthButtons run={run} onDone={done} busy={busy} />
      <form className={styles.form} onSubmit={submit}>
        <TextField label="Your name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
        <TextField label="Email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        <TextField
          label="Password" type="password" autoComplete="new-password" required minLength={6} hint="At least 6 characters."
          value={password} onChange={(event) => setPassword(event.target.value)}
        />
        {error && <p className={styles.error} role="alert">{error}</p>}
        <Button type="submit" variant="primary" size="large" full loading={busy}>Create account</Button>
      </form>
    </AuthCard>
  )
}
