import { useState } from 'react'
import { useAuthStore } from '@/features/auth/auth.store'
import { requestPayout } from '@/features/billing/payments'
import { getBalance, listMyLedger, listMyPayouts } from '@/features/workspace/api/marketMoney'
import { useAsync } from '@/shared/hooks/useAsync'
import { Button, PageSpinner, toast } from '@/shared/ui'
import { MarketNav, usd } from './MarketNav'
import { MARKET_FEE_PERCENT, MIN_PAYOUT_USD } from './types'
import { payoutProblem } from './validate'
import styles from './Market.module.css'

const day = (millis: number) => new Date(millis).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
const WORDS = { requested: 'Waiting to be paid', paid: 'Paid', cancelled: 'Cancelled' }

function PayoutForm({ balance, open, onDone }: { balance: number; open: boolean; onDone: () => void }) {
  const [wallet, setWallet] = useState('')
  const [amount, setAmount] = useState(balance)
  const [problem, setProblem] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    const found = payoutProblem(wallet, amount, balance)
    setProblem(found)
    if (found) return
    setBusy(true)
    try { await requestPayout(wallet.trim(), amount); toast('Payout requested. You will be paid by hand soon.', 'success'); onDone() } catch (error) { setProblem((error as Error).message) } finally { setBusy(false) }
  }
  if (open) return <p className={styles.muted}>You have a payout waiting to be paid. You can ask for another once it is paid.</p>
  if (balance < MIN_PAYOUT_USD) return <p className={styles.muted}>You can ask to be paid out from {usd(MIN_PAYOUT_USD)}.</p>
  return (
    <div className={styles.form}>
      <label>Wallet address (USDT)<input className={styles.input} value={wallet} onChange={(event) => setWallet(event.target.value)} autoComplete="off" /></label>
      <label>Amount in US dollars<input className={styles.input} type="number" min={MIN_PAYOUT_USD} max={balance} step="0.01" value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></label>
      {problem && <p className={styles.error} role="alert">{problem}</p>}
      <div><Button variant="primary" loading={busy} onClick={submit}>Ask to be paid</Button></div>
    </div>
  )
}

/** Earnings: what you can be paid out, your sales and payouts, and a payout request (paid by hand). */
export default function EarningsPage() {
  const uid = useAuthStore((state) => state.user?.uid ?? '')
  const all = useAsync(async () => ({ balance: await getBalance(uid), ledger: await listMyLedger(uid), payouts: await listMyPayouts(uid) }), uid)
  const data = all.data
  return (
    <>
      <MarketNav />
      <main className={styles.main}>
        <header className={styles.head}><h1>Earnings</h1><p>You receive {100 - MARKET_FEE_PERCENT}% of each sale. Payouts are sent by hand to your wallet.</p></header>
        {all.loading && <PageSpinner />}
        {Boolean(all.error) && <p className={styles.error}>Your earnings could not be loaded. Please refresh.</p>}
        {data && (
          <>
            <section className={styles.section}><h2>You can be paid out</h2><p className={styles.balance}>{usd(data.balance)}</p>
              <PayoutForm balance={data.balance} open={data.payouts.some((payout) => payout.status === 'requested')} onDone={all.reload} /></section>
            {data.payouts.length > 0 && (
              <section className={styles.section}><h2>Payouts</h2><ul className={styles.list}>
                {data.payouts.map((payout) => <li key={payout.id} className={styles.row}><span>{usd(payout.amountUsd)}<br /><small className={styles.muted}>{day(payout.createdAt)}</small></span><span className={styles.tag} data-on={payout.status === 'paid'}>{WORDS[payout.status]}</span><span /></li>)}
              </ul></section>
            )}
            <section className={styles.section}><h2>History</h2>
              {data.ledger.length === 0 ? <p className={styles.muted}>Your sales will show up here.</p> : (
                <ul className={styles.list}>
                  {data.ledger.map((entry) => (
                    <li key={entry.id} className={styles.row}>
                      <span>{entry.type === 'sale' ? entry.title : 'Payout requested'}<br /><small className={styles.muted}>{day(entry.createdAt)}{entry.type === 'sale' ? ` · fee ${usd(entry.feeUsd)}` : ''}</small></span>
                      <span className={entry.amountUsd >= 0 ? styles.moneyPlus : styles.moneyMinus}>{entry.amountUsd >= 0 ? '+' : '−'}{usd(Math.abs(entry.amountUsd))}</span><span />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </>
  )
}
