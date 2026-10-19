import { useState } from 'react'
import { Button, Modal } from '@/shared/ui'
import { listingProblem } from './validate'
import type { ListingInput } from './types'
import { LISTING_PRICE, MARKET_FEE_PERCENT } from './types'
import styles from './Market.module.css'

type Props = {
  open: boolean
  heading: string
  /** The pages the seller can choose from (only when listing a new one). */
  pages?: { id: string; name: string }[]
  initial: ListingInput
  submitLabel: string
  onSubmit: (input: ListingInput, projectId: string) => Promise<void>
  onClose: () => void
}

/** Title, description, price and visibility of a listing (and which page, when it is new). */
export function ListingForm({ open, heading, pages, initial, submitLabel, onSubmit, onClose }: Props) {
  const [input, setInput] = useState(initial)
  const [projectId, setProjectId] = useState(pages?.[0]?.id ?? '')
  const [problem, setProblem] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const set = (change: Partial<ListingInput>) => setInput((old) => ({ ...old, ...change }))

  const submit = async () => {
    const found = listingProblem(input) ?? (pages && !projectId ? 'Choose the page to sell.' : null)
    setProblem(found)
    if (found) return
    setBusy(true)
    try { await onSubmit({ ...input, title: input.title.trim(), description: input.description.trim() }, projectId); onClose() } catch (error) { setProblem((error as Error).message) } finally { setBusy(false) }
  }

  return (
    <Modal open={open} title={heading} onClose={onClose} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" loading={busy} onClick={submit}>{submitLabel}</Button></>}>
      <div className={styles.form}>
        {pages && (
          <label>Page to sell
            <select className={styles.input} value={projectId} onChange={(event) => { setProjectId(event.target.value); if (!input.title) set({ title: pages.find((page) => page.id === event.target.value)?.name ?? '' }) }}>
              {pages.map((page) => <option key={page.id} value={page.id}>{page.name}</option>)}
            </select>
          </label>
        )}
        <label>Title<input className={styles.input} value={input.title} maxLength={100} onChange={(event) => set({ title: event.target.value })} /></label>
        <label>Description<textarea value={input.description} maxLength={1000} placeholder="What is it for? What is included?" onChange={(event) => set({ description: event.target.value })} /></label>
        <label>Price in US dollars
          <input className={styles.input} type="number" min={LISTING_PRICE.min} max={LISTING_PRICE.max} step="1" value={Number.isFinite(input.priceUsd) ? input.priceUsd : ''} onChange={(event) => set({ priceUsd: event.target.value === '' ? NaN : Number(event.target.value) })} />
          <small className={styles.muted}>You receive {100 - MARKET_FEE_PERCENT}%: {Number.isFinite(input.priceUsd) ? `$${(input.priceUsd * (100 - MARKET_FEE_PERCENT) / 100).toFixed(2)}` : '—'} per sale.</small>
        </label>
        <label>Visible to buyers
          <select className={styles.input} value={input.status} onChange={(event) => set({ status: event.target.value as ListingInput['status'] })}>
            <option value="active">Yes, for sale</option><option value="paused">No, paused</option>
          </select>
        </label>
        {problem && <p className={styles.error} role="alert">{problem}</p>}
      </div>
    </Modal>
  )
}
