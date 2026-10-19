import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AccountMenu } from '@/features/auth/components/AccountMenu'
import { useAuthStore } from '@/features/auth/auth.store'
import { useAsync } from '@/shared/hooks/useAsync'
import { Button, Icon, TopBar, toast } from '@/shared/ui'
import { getUsage } from '@/features/workspace/api/projectQueries'
import { CheckoutStatus } from './CheckoutStatus'
import { PaymentHistory } from './PaymentHistory'
import { checkoutAvailable, startCheckout } from './payments'
import { PLANS, planFor, type Plan } from './plans'
import styles from './Plans.module.css'

const MONTHS = [1, 3, 12]
const day = (millis: number) => new Date(millis).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

function PlanCard({ plan, current, until }: { plan: Plan; current: boolean; until: number | null }) {
  const [months, setMonths] = useState(1)
  const [busy, setBusy] = useState(false)
  const upgrade = async () => {
    setBusy(true)
    try {
      const { checkoutUrl } = await startCheckout({ kind: 'plan', planId: plan.id, months })
      window.location.assign(checkoutUrl)
    } catch (error) {
      toast((error as Error).message, 'error')
      setBusy(false)
    }
  }
  const paid = plan.priceUsd > 0
  return (
    <article className={`${styles.card} ${current ? styles.current : ''}`} data-plan={plan.id}>
      <h2>{plan.name}</h2>
      <p className={styles.price}>{plan.priceUsd === 0 ? 'Free' : <>${plan.priceUsd}<small> / month</small></>}</p>
      <ul>{plan.perks.map((perk) => <li key={perk}><Icon name="check" size={16} /> {perk}</li>)}</ul>
      {current && <span className={styles.badge}>Your plan{until && paid ? ` · until ${day(until)}` : ''}</span>}
      {paid && (
        <>
          <div className={styles.months} role="group" aria-label="How many months">
            {MONTHS.map((count) => <button key={count} type="button" aria-pressed={months === count} onClick={() => setMonths(count)}>{count} {count === 1 ? 'month' : 'months'}</button>)}
          </div>
          <Button variant="primary" full disabled={busy || !checkoutAvailable()} onClick={upgrade}>
            {checkoutAvailable() ? `Pay $${plan.priceUsd * months} with crypto` : 'Checkout is not set up here'}
          </Button>
          {current && <p className={styles.muted}>Paying again adds {months === 1 ? 'a month' : `${months} months`} to what you have left.</p>}
        </>
      )}
    </article>
  )
}

/** Plans (development only for now): the plan you have, paying with crypto through the billing Worker, how a payment is going, your payments. */
export default function PlansPage() {
  const uid = useAuthStore((state) => state.user?.uid ?? '')
  const usage = useAsync(() => getUsage(uid), uid)
  const [params] = useSearchParams()
  const [refresh, setRefresh] = useState(0)
  const current = planFor(usage.data?.plan)
  const payment = params.get('payment')
  const { reload } = usage
  const settled = useCallback(() => { reload(); setRefresh((value) => value + 1) }, [reload])

  return (
    <>
      <TopBar><Link to="/projects">My pages</Link><AccountMenu /></TopBar>
      <main className={styles.main}>
        <h1>Plans</h1>
        <p className={styles.lead}>Keep more pages. Pay with crypto for as many months as you like: no subscription to cancel.</p>
        {payment && <CheckoutStatus id={payment} cancelled={params.get('cancelled') === '1'} onPaid={settled} />}
        <div className={styles.grid}>
          {Object.values(PLANS).map((plan) => <PlanCard key={plan.id} plan={plan} current={plan.id === current.id} until={usage.data?.planUntil ?? null} />)}
        </div>
        <PaymentHistory uid={uid} refresh={refresh} />
      </main>
    </>
  )
}
