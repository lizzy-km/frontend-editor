import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, TextField } from '@/shared/ui'
import { authService } from './auth.store'
import { AuthCard } from './components/AuthCard'
import styles from './components/AuthCard.module.css'
import { useAuthAction } from './components/useAuthAction'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const { busy, error, run } = useAuthAction()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    void run(async () => (await authService()).resetPassword(email), () => setSent(true))
  }

  return (
    <AuthCard title="Reset your password" footer={<Link to="/login">Back to sign in</Link>}>
      {sent ? (
        <p role="status">Check your inbox — we sent a link to <strong>{email}</strong>. It can take a minute (look in spam too).</p>
      ) : (
        <form className={styles.form} onSubmit={submit}>
          <p>Enter your email and we’ll send you a link to choose a new password.</p>
          <TextField label="Email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          {error && <p className={styles.error} role="alert">{error}</p>}
          <Button type="submit" variant="primary" size="large" full loading={busy}>Send reset link</Button>
        </form>
      )}
    </AuthCard>
  )
}
