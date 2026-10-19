import { Link, useSearchParams } from 'react-router-dom'
import NotFoundPage from '@/app/NotFoundPage'
import { WorkflowView, type Diagram } from '../WorkflowView'
import { PaymentFunctions, PaymentModel, PaymentOverview, PaymentRules } from './PaymentViews'
import styles from '../dev.module.css'

const TABS = [['overview', 'Overview'], ['functions', 'Functions'], ['workflow', 'Workflow'], ['data', 'Data model'], ['er', 'ER diagrams'], ['rules', 'Rules and limits']] as const
type Tab = (typeof TABS)[number][0]

const WORKFLOWS: Diagram[] = [
  { id: '13-pay-plan', title: 'Buying a plan', text: 'From "Choose Pro" to a plan that ends on a date, step by step.' },
  { id: '14-pay-order', title: 'Buying a page', text: 'Order, payment, delivery of a private copy, seller credited.' },
  { id: '15-pay-payout', title: 'Seller payout', text: 'Holding the balance and paying by hand.' },
  { id: '16-pay-states', title: 'Payment states', text: 'Every status a payment can have and what moves it.' },
]

const ER: Diagram[] = [
  { id: '17-er-payment', title: 'ER: payments', text: 'A payment, the user it belongs to and what it was for.' },
  { id: '18-er-market', title: 'ER: marketplace', text: 'Listings, orders, ledger, payouts and how they point at each other.' },
]

/**
 * Developer docs for payments and the marketplace: functions, workflow, data model and ER diagrams.
 * Like /dev, only the development server has this route and nothing in the app links to it.
 */
export default function PaymentDocsPage() {
  const [params, setParams] = useSearchParams()
  const tab = (TABS.find(([id]) => id === params.get('tab'))?.[0] ?? 'overview') as Tab
  if (!import.meta.env.DEV) return <NotFoundPage />
  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <h1>Payment and market docs</h1>
        <span className={styles.badge}>Development only</span>
        <Link to="/dev" className={styles.muted}>← All developer docs</Link>
        <nav className={styles.tabs} role="tablist" aria-label="Sections">
          {TABS.map(([id, label]) => <button key={id} type="button" role="tab" className={styles.tab} aria-selected={tab === id} onClick={() => setParams({ tab: id })}>{label}</button>)}
        </nav>
      </header>
      <main className={styles.body}>
        {tab === 'overview' && <PaymentOverview />}
        {tab === 'functions' && <PaymentFunctions />}
        {tab === 'workflow' && <WorkflowView key="workflow" diagrams={WORKFLOWS} />}
        {tab === 'data' && <PaymentModel />}
        {tab === 'er' && <WorkflowView key="er" diagrams={ER} />}
        {tab === 'rules' && <PaymentRules />}
      </main>
    </div>
  )
}
