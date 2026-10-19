import { listMyPayments } from '@/features/workspace/api/paymentQueries'
import { useAsync } from '@/shared/hooks/useAsync'
import { paymentTitle, paymentWords } from './paymentWords'
import styles from './Plans.module.css'

const date = (millis: number) => new Date(millis).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

/** The person's payments, newest first (`refresh` changes after a payment settles so the list reloads). */
export function PaymentHistory({ uid, refresh }: { uid: string; refresh: number }) {
  const payments = useAsync(() => listMyPayments(uid), `${uid}:${refresh}`)
  if (payments.loading) return null
  if (payments.error) return <p className={styles.muted}>Your payments could not be loaded.</p>
  if (!payments.data?.length) return null
  return (
    <section className={styles.history} aria-label="Your payments">
      <h2>Your payments</h2>
      <ul>
        {payments.data.map((payment) => (
          <li key={payment.id}>
            <span>{paymentTitle(payment)}</span>
            <span>${payment.amountUsd}</span>
            <span data-status={payment.status}>{paymentWords(payment.status).label}</span>
            <time>{date(payment.paidAt ?? payment.createdAt)}</time>
          </li>
        ))}
      </ul>
    </section>
  )
}
