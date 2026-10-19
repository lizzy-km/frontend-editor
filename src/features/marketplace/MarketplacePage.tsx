import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listActiveListings } from '@/features/workspace/api/marketListings'
import { isFirebaseConfigured } from '@/lib/firebaseConfig'
import { useAsync } from '@/shared/hooks/useAsync'
import { EmptyState, PageSpinner } from '@/shared/ui'
import { ListingThumb, MarketNav, usd } from './MarketNav'
import { shown, type Sort } from './browse'
import styles from './Market.module.css'

/** Marketplace (development only for now): pages people sell. Anyone can look; buying needs an account. */
export default function MarketplacePage() {
  const all = useAsync(() => (isFirebaseConfigured ? listActiveListings() : Promise.resolve([])), 'market')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<Sort>('new')
  const listings = useMemo(() => shown(all.data ?? [], search, sort), [all.data, search, sort])
  return (
    <>
      <MarketNav />
      <main className={styles.main}>
        <header className={styles.head}>
          <h1>Marketplace</h1>
          <p>Pages made by other people. Buy one and you get your own private copy to change however you like.</p>
        </header>
        <div className={styles.tools}>
          <input type="search" aria-label="Search pages" placeholder="Search pages…" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select aria-label="Sort pages" value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
            <option value="new">Newest</option><option value="popular">Most bought</option><option value="cheap">Cheapest first</option><option value="dear">Most expensive first</option>
          </select>
        </div>
        {all.loading && <PageSpinner />}
        {Boolean(all.error) && <p className={styles.error}>We couldn’t load the marketplace right now. Please refresh.</p>}
        {!isFirebaseConfigured && <EmptyState icon="sparkle" title="Nothing for sale yet" text="The marketplace needs accounts, which aren’t switched on in this copy of the app." />}
        {all.data && listings.length === 0 && <EmptyState icon="sparkle" title={search ? 'No page matches' : 'Nothing for sale yet'} text={search ? 'Try other words.' : 'Be the first: open Sell a page and put one of yours up.'} />}
        <div className={styles.grid}>
          {listings.map((item) => (
            <Link key={item.id} to={`/market/${item.id}`} className={styles.card}>
              <ListingThumb title={item.title} url={item.thumbnailUrl} className={styles.thumb} />
              <span className={styles.cardText}>
                <strong>{item.title}</strong>
                <small>by {item.sellerName || 'someone'}{item.salesCount ? ` · ${item.salesCount} sold` : ''}</small>
                <span className={styles.price}>{usd(item.priceUsd)}</span>
              </span>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
