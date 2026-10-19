import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/auth.store'
import { createListing, deleteListing, listMyListings, updateListing } from '@/features/workspace/api/marketListings'
import { listMyProjects } from '@/features/workspace/api/projectQueries'
import { useAsync } from '@/shared/hooks/useAsync'
import { Button, EmptyState, PageSpinner, toast } from '@/shared/ui'
import { ListingForm } from './ListingForm'
import { MarketNav, usd } from './MarketNav'
import type { Listing, ListingInput } from './types'
import styles from './Market.module.css'

const blank: ListingInput = { title: '', description: '', priceUsd: 10, status: 'active' }

/** Sell a page: your listings (change, pause, remove) and a button to put one of your pages up for sale. */
export default function SellPage() {
  const user = useAuthStore((state) => state.user)
  const uid = user?.uid ?? ''
  const listings = useAsync(() => listMyListings(uid), uid)
  const pages = useAsync(() => listMyProjects(uid), `pages:${uid}`)
  const [form, setForm] = useState<{ edit: Listing | null } | null>(null)

  const save = async (input: ListingInput, projectId: string) => {
    if (form?.edit) await updateListing(form.edit.id, input)
    else {
      const project = pages.data?.find((page) => page.id === projectId)
      if (!project) throw new Error('Choose the page to sell.')
      await createListing({ uid, name: user?.displayName ?? user?.email?.split('@')[0] ?? 'Someone' }, project, input)
    }
    listings.reload()
    toast(form?.edit ? 'Listing saved.' : 'Your page is for sale.', 'success')
  }
  const toggle = (item: Listing) => updateListing(item.id, { title: item.title, description: item.description, priceUsd: item.priceUsd, status: item.status === 'active' ? 'paused' : 'active' }).then(listings.reload, () => toast('Could not change that listing.', 'error'))
  const remove = (item: Listing) => deleteListing(item.id).then(listings.reload, () => toast('Could not remove it. A page that sold can only be paused.', 'error'))

  return (
    <>
      <MarketNav />
      <main className={styles.main}>
        <header className={styles.head}>
          <h1>Sell a page</h1>
          <p>Choose one of your pages and a price. Buyers get their own private copy; your page stays yours.</p>
        </header>
        <div><Button variant="primary" icon="plus" disabled={!pages.data?.length} onClick={() => setForm({ edit: null })}>List a page for sale</Button>
          {pages.data && !pages.data.length && <p className={styles.muted}>Save a page first (<Link to="/projects/new">make one</Link>).</p>}</div>
        {listings.loading && <PageSpinner />}
        {listings.data && !listings.data.length && <EmptyState icon="sparkle" title="Nothing listed yet" text="Your listings appear here." />}
        <ul className={styles.list}>
          {listings.data?.map((item) => (
            <li key={item.id} className={styles.row}>
              <span><Link to={`/market/${item.id}`}><strong>{item.title}</strong></Link><br /><small className={styles.muted}>{usd(item.priceUsd)} · {item.salesCount} sold</small></span>
              <span className={styles.tag} data-on={item.status === 'active'}>{item.status === 'active' ? 'For sale' : 'Paused'}</span>
              <span className={styles.actions}>
                <Button size="small" onClick={() => setForm({ edit: item })}>Edit</Button>
                <Button size="small" variant="ghost" onClick={() => toggle(item)}>{item.status === 'active' ? 'Pause' : 'Put back on sale'}</Button>
                {item.salesCount === 0 && <Button size="small" variant="ghost" onClick={() => remove(item)}>Remove</Button>}
              </span>
            </li>
          ))}
        </ul>
        {form && (
          <ListingForm key={form.edit?.id ?? 'new'} open heading={form.edit ? 'Change your listing' : 'List a page for sale'} pages={form.edit ? undefined : (pages.data ?? []).map((page) => ({ id: page.id, name: page.name }))}
            initial={form.edit ? { title: form.edit.title, description: form.edit.description, priceUsd: form.edit.priceUsd, status: form.edit.status } : blank}
            submitLabel={form.edit ? 'Save' : 'List it'} onSubmit={save} onClose={() => setForm(null)} />
        )}
      </main>
    </>
  )
}
