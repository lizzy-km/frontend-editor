import { Link } from 'react-router-dom'
import { AccountMenu } from '@/features/auth/components/AccountMenu'
import { useAuthStore } from '@/features/auth/auth.store'
import { useAsync } from '@/shared/hooks/useAsync'
import { Button, Icon, TopBar, toast } from '@/shared/ui'
import { getUsage } from '@/features/workspace/api/projectQueries'
import { PAYMENT_PROVIDERS } from './payments'
import { PLANS, planFor, type Plan } from './plans'
import styles from './Plans.module.css'

function PlanCard({ plan, current, uid }: { plan: Plan; current: boolean; uid: string }) {
  const provider = PAYMENT_PROVIDERS.crypto
  const upgrade = async () => {
    try {
      const { checkoutUrl } = await provider.startCheckout(plan.id, uid)
      window.location.assign(checkoutUrl)
    } catch (error) {
      toast((error as Error).message)
    }
  }

  return (
    <article className={`${styles.card} ${current ? styles.current : ''}`}>
      <h2>{plan.name}</h2>
      <p className={styles.price}>{plan.priceUsd === 0 ? 'Free' : <>${plan.priceUsd}<small> / month</small></>}</p>
      <ul>{plan.perks.map((perk) => <li key={perk}><Icon name="check" size={16} /> {perk}</li>)}</ul>
      {current
        ? <span className={styles.badge}>Your plan</span>
        : <Button variant="primary" full onClick={upgrade}>{provider.label}</Button>}
    </article>
  )
}

/** Plans (behind enable_billing). Upgrading is handled by a server after payment. */
export default function PlansPage() {
  const uid = useAuthStore((state) => state.user?.uid ?? '')
  const usage = useAsync(() => getUsage(uid), uid)
  const current = planFor(usage.data?.plan)

  return (
    <>
      <TopBar><Link to="/projects">My pages</Link><AccountMenu /></TopBar>
      <main className={styles.main}>
        <h1>Plans</h1>
        <p className={styles.lead}>Keep more pages. Pay monthly with crypto — cancel anytime.</p>
        <div className={styles.grid}>
          {Object.values(PLANS).map((plan) => <PlanCard key={plan.id} plan={plan} current={plan.id === current.id} uid={uid} />)}
        </div>
      </main>
    </>
  )
}
