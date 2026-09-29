import { features } from '@/config/features.config'
import { Button } from '@/shared/ui'
import { authService } from '../auth.store'
import type { OAuthProvider } from '../types'
import styles from './AuthCard.module.css'

const PROVIDERS: { id: OAuthProvider; label: string }[] = [
  { id: 'google', label: 'Continue with Google' },
  { id: 'github', label: 'Continue with GitHub' },
]

type Props = { run: (action: () => Promise<void>, onDone?: () => void) => Promise<void>; onDone: () => void; busy: boolean }

/** "Continue with Google / GitHub" (behind the enable_oauth flag). */
export function OAuthButtons({ run, onDone, busy }: Props) {
  if (!features.enable_oauth) return null
  return (
    <>
      <div className={styles.oauth}>
        {PROVIDERS.map((provider) => (
          <Button key={provider.id} full size="large" disabled={busy}
            onClick={() => run(async () => (await authService()).signInWithProvider(provider.id), onDone)}>
            {provider.label}
          </Button>
        ))}
      </div>
      <div className={styles.divider}>or with email</div>
    </>
  )
}
