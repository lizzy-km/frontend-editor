import { useEffect, useState } from 'react'
import { getMyPayment, type PaymentRecord } from '@/features/workspace/api/paymentQueries'
import { paymentTitle, paymentWords } from './paymentWords'
import styles from './Plans.module.css'

const EVERY_MS = 4000
const GIVE_UP_MS = 3 * 60 * 1000

/** Shows how a payment is going after the person comes back from the payment page; asks again every few seconds until it is settled. */
export function CheckoutStatus({ id, cancelled, onPaid }: { id: string; cancelled: boolean; onPaid: () => void }) {
  const [payment, setPayment] = useState<PaymentRecord | null | undefined>(undefined)
  const [waitedLong, setWaitedLong] = useState(false)

  useEffect(() => {
    let alive = true
    const started = Date.now()
    let timer: ReturnType<typeof setTimeout> | undefined
    const look = async () => {
      const found = await getMyPayment(id)
      if (!alive) return
      setPayment(found)
      if (found?.status === 'paid') return onPaid()
      if (found && paymentWords(found.status).done) return
      if (Date.now() - started > GIVE_UP_MS) return setWaitedLong(true)
      timer = setTimeout(look, EVERY_MS)
    }
    void look()
    return () => { alive = false; if (timer) clearTimeout(timer) }
  }, [id, onPaid])

  if (payment === undefined) return <p className={styles.notice} role="status">Checking your payment…</p>
  if (payment === null) return <p className={styles.notice} role="status">We could not find that payment.</p>
  const words = paymentWords(payment.status)
  return (
    <section className={styles.notice} role="status" data-status={payment.status}>
      <strong>{paymentTitle(payment)}: {cancelled && !words.done ? 'cancelled for now' : words.label}</strong>
      <p>{cancelled && !words.done ? 'You left the payment page. If you did pay, this updates by itself.' : words.hint}</p>
      {waitedLong && <p>Still waiting. You can close this page: your plan changes as soon as the payment is confirmed. Payment number: {payment.id}</p>}
    </section>
  )
}
