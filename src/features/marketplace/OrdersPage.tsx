import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/auth.store'
import { CheckoutStatus } from '@/features/billing/CheckoutStatus'
import { listMyOrders } from '@/features/workspace/api/marketMoney'
import { useAsync } from '@/shared/hooks/useAsync'
import { EmptyState, PageSpinner } from '@/shared/ui'
import { MarketNav, usd } from './MarketNav'
import type { Order } from './types'
import styles from './Market.module.css'

const day = (millis: number) => new Date(millis).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

function Orders({ orders, mine }: { orders: Order[]; mine: 'buyer' | 'seller' }) {
  return (
    <ul className={styles.list}>
      {orders.map((order) => (
        <li key={order.id} className={styles.row}>
          <span><strong>{order.title}</strong><br /><small className={styles.muted}>{day(order.createdAt)} · {mine === 'buyer' ? usd(order.priceUsd) : `you receive ${usd(order.sellerEarningsUsd)} of ${usd(order.priceUsd)}`}</small></span>
          <span className={styles.tag} data-on={order.status === 'delivered'}>{order.status === 'delivered' ? 'Delivered' : order.status === 'paid' ? 'Paid, being checked' : 'Waiting for payment'}</span>
          <span className={styles.actions}>{mine === 'buyer' && order.deliveredProjectId && <Link to={`/edit/${order.deliveredProjectId}`}>Open in the editor</Link>}</span>
        </li>
      ))}
    </ul>
  )
}

/** My orders: pages I bought (with a link to my copy) and pages I sold. Also where a payment's progress shows after paying. */
export default function OrdersPage() {
  const uid = useAuthStore((state) => state.user?.uid ?? '')
  const orders = useAsync(() => listMyOrders(uid), uid)
  const [params] = useSearchParams()
  const payment = params.get('payment')
  const { reload } = orders
  const settled = useCallback(() => reload(), [reload])
  const hasOrders = Boolean(orders.data && (orders.data.bought.length || orders.data.sold.length))
  return (
    <>
      <MarketNav />
      <main className={styles.main}>
        <header className={styles.head}><h1>My orders</h1></header>
        {payment && <CheckoutStatus id={payment} cancelled={params.get('cancelled') === '1'} onPaid={settled} />}
        {orders.loading && <PageSpinner />}
        {orders.data && !hasOrders && <EmptyState icon="sparkle" title="No orders yet" text="Pages you buy or sell show up here." action={<Link to="/market">Browse the marketplace</Link>} />}
        {Boolean(orders.data?.bought.length) && <section className={styles.section}><h2>Bought</h2><Orders orders={orders.data!.bought} mine="buyer" /></section>}
        {Boolean(orders.data?.sold.length) && <section className={styles.section}><h2>Sold</h2><Orders orders={orders.data!.sold} mine="seller" /></section>}
      </main>
    </>
  )
}
