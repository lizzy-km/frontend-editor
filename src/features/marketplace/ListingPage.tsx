import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/auth.store'
import { checkoutAvailable, startCheckout } from '@/features/billing/payments'
import { getListing } from '@/features/workspace/api/marketListings'
import { useAsync } from '@/shared/hooks/useAsync'
import { Button, EmptyState, PageSpinner, toast } from '@/shared/ui'
import { ListingThumb, MarketNav, usd } from './MarketNav'
import { MARKET_FEE_PERCENT } from './types'
import styles from './Market.module.css'

/** One page for sale: what it is, the price, and Buy (paid with crypto at the payment service's own page). */
export default function ListingPage() {
  const { listingId = '' } = useParams()
  const listing = useAsync(() => getListing(listingId), listingId)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const buy = async () => {
    if (!user) return navigate('/login')
    setBusy(true)
    try {
      const { checkoutUrl } = await startCheckout({ kind: 'order', listingId })
      window.location.assign(checkoutUrl)
    } catch (error) {
      toast((error as Error).message, 'error')
      setBusy(false)
    }
  }

  const item = listing.data
  const mine = Boolean(item && user && item.ownerId === user.uid)
  return (
    <>
      <MarketNav />
      <main className={styles.main}>
        {listing.loading && <PageSpinner />}
        {!listing.loading && !item && <EmptyState icon="sparkle" title="This page is not for sale" text="It may have been taken down." action={<Link to="/market">Back to the marketplace</Link>} />}
        {item && (
          <div className={styles.detail}>
            <ListingThumb title={item.title} url={item.thumbnailUrl} className={styles.thumb} />
            <section className={styles.buy}>
              <h1>{item.title}</h1>
              <p className={styles.price}>{usd(item.priceUsd)}</p>
              {item.description && <p>{item.description}</p>}
              <div className={styles.facts}>
                <span>Made by {item.sellerName || 'someone'}</span>
                {item.salesCount > 0 && <span>{item.salesCount} bought</span>}
                <span>You get your own private copy, ready to change in the editor.</span>
              </div>
              {mine ? <p className={styles.muted}>This is your listing. <Link to="/market/sell">Manage it</Link></p>
                : <Button variant="primary" full disabled={busy || !checkoutAvailable()} onClick={buy}>{checkoutAvailable() ? `Buy for ${usd(item.priceUsd)} with crypto` : 'Checkout is not set up here'}</Button>}
              <p className={styles.muted}>The seller receives {100 - MARKET_FEE_PERCENT}% of the price; the rest keeps the marketplace running.</p>
            </section>
          </div>
        )}
      </main>
    </>
  )
}
