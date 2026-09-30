import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui'
import { remainingDownloads, type DownloadGate } from './downloadGate'
import styles from './ExportDialog.module.css'

const formatDay = (date: Date) => date.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })

/** Try-it: explain that downloading needs a (free) account — and that the page comes along. */
export function SignInToDownload({ gate }: { gate: Extract<DownloadGate, { kind: 'signin' }> }) {
  return (
    <div className={styles.notice}>
      <strong>Create a free account to download</strong>
      <p>It takes a few seconds, and this page is saved to your account so you can keep editing it anywhere.</p>
      <div className={styles.noticeActions}>
        <Link to={gate.signupHref}><Button variant="primary">Create free account</Button></Link>
        <Link to={gate.signinHref}><Button variant="ghost">I already have one</Button></Link>
      </div>
    </div>
  )
}

/** "7 of 10 downloads left this month" / limit reached / unlimited. */
export function DownloadsLeft({ gate }: { gate: DownloadGate }) {
  if (gate.kind !== 'counted') return null
  if (gate.status === 'loading') return <p className={styles.allowance}>Checking your downloads…</p>
  if (gate.status === 'unknown') return <p className={styles.allowance}>Couldn’t check your downloads right now — you can still try.</p>
  if (gate.max === null) return <p className={styles.allowance}>Unlimited downloads on your plan.</p>

  const left = remainingDownloads(gate) ?? 0
  if (left === 0) {
    return (
      <div className={styles.notice} role="status">
        <strong>You’ve used this page’s {gate.max} downloads for this month</strong>
        <p>You can download it again from {formatDay(gate.resetsOn)}. Editing and Preview still work as normal.</p>
      </div>
    )
  }
  return (
    <p className={styles.allowance}>
      <strong>{left}</strong> of {gate.max} downloads left this month for this page (copying the code counts too).
    </p>
  )
}
