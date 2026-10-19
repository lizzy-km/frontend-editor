import { useEffect, useState } from 'react'
import { loadCatalog, type Constant } from './constants'
import { COLLECTION_DOCS } from './modelData'
import { ENDPOINTS, FUNCTIONS, SCREENS } from './functionsData'
import over from '../OverviewView.module.css'

const STEPS = [
  ['Start', 'The browser only asks. The billing worker checks who you are, prices the purchase itself, records a pending payment and gets a hosted checkout from the processor (NOWPayments, crypto).'],
  ['Pay', 'The person pays on the processor\'s own page and comes back to the app, which watches the payment until it settles.'],
  ['Confirm', 'The processor calls the worker\'s webhook. The worker checks the signature, amount and currency, then in ONE commit marks the payment paid and does what it was for.'],
  ['Deliver', 'A plan: plan = pro until a date. A page: the buyer gets a private copy, the seller is credited minus 10%, the sale is written to the ledger.'],
  ['Pay out', 'A seller asks for a payout: the amount is held from the balance at once and a person pays the wallet by hand.'],
]

/** The big picture: what the two features are, and the five steps money goes through. */
export function PaymentOverview() {
  return (
    <div className={over.grid}>
      <section>
        <h3>What this is</h3>
        <p><b>Payments</b> let someone buy the Pro plan for 1 to 12 months. The <b>marketplace</b> lets people sell copies of their pages for $1 to $500; the platform keeps 10%.</p>
        <p>Both use one rule: <b>the browser starts a checkout, only the server grants the result.</b> Plans, balances, orders and payments cannot be written from the browser at all (<code>firestore.rules</code> say <code>allow write: if false</code>). Both screens are behind <code>enable_billing</code> and <code>enable_marketplace</code> (development only for now).</p>
      </section>
      <section>
        <h3>The five steps</h3>
        <table><tbody>{STEPS.map(([name, text], index) => <tr key={name}><td><b>{index + 1}. {name}</b></td><td>{text}</td></tr>)}</tbody></table>
      </section>
      <section>
        <h3>The parts</h3>
        <table><tbody>
          <tr><td><b>App</b></td><td><code>src/features/billing</code>, <code>src/features/marketplace</code>, <code>src/features/workspace/api/market*.ts</code>, <code>paymentQueries.ts</code></td></tr>
          <tr><td><b>Worker</b></td><td><code>workers/billing</code>: a Cloudflare Worker, the only place money turns into plans and purchases</td></tr>
          <tr><td><b>Database</b></td><td>Firestore, six collections (see Data model); the worker writes with a service account over REST</td></tr>
          <tr><td><b>Processor</b></td><td>NOWPayments hosted invoices. Sandbox (no real money) unless <code>NOWPAYMENTS_SANDBOX</code> is "false"</td></tr>
        </tbody></table>
      </section>
    </div>
  )
}

/** The worker's addresses, the screens and the main functions. */
export function PaymentFunctions() {
  const groups = [...new Set(FUNCTIONS.map((fn) => fn.group))]
  return (
    <div className={over.grid}>
      <section>
        <h3>Worker addresses</h3>
        <table>
          <thead><tr><th>Address</th><th>Who calls it</th><th>What it does</th><th>Files</th></tr></thead>
          <tbody>{ENDPOINTS.map((item) => <tr key={item.path}><td><code>{item.method} {item.path}</code></td><td>{item.who}</td><td>{item.does}</td><td><code>{item.file}</code></td></tr>)}</tbody>
        </table>
      </section>
      <section>
        <h3>Screens</h3>
        <table>
          <thead><tr><th>Address</th><th>Screen</th><th>Who</th><th>What it does</th></tr></thead>
          <tbody>{SCREENS.map((item) => <tr key={item.path}><td><code>{item.path}</code></td><td>{item.name}</td><td>{item.who}</td><td>{item.does}</td></tr>)}</tbody>
        </table>
      </section>
      {groups.map((group) => (
        <section key={group}>
          <h3>Functions: {group}</h3>
          <table><tbody>{FUNCTIONS.filter((fn) => fn.group === group).map((fn) => <tr key={fn.name}><td><code>{fn.name}</code><br /><small>{fn.file}</small></td><td>{fn.does}</td></tr>)}</tbody></table>
        </section>
      ))}
    </div>
  )
}

/** Every saved collection, field by field, with who may read and write it. */
export function PaymentModel() {
  return (
    <div className={over.grid}>
      {COLLECTION_DOCS.map((item) => (
        <section key={item.path}>
          <h3>{item.name} <code>{item.path}</code></h3>
          <p>{item.about} <b>Read:</b> {item.read}. <b>Write:</b> {item.write}.</p>
          <table>
            <thead><tr><th>Field</th><th>Type</th><th>Meaning</th></tr></thead>
            <tbody>{item.fields.map(([name, type, note]) => <tr key={name}><td><code>{name}</code></td><td><code>{type}</code></td><td>{note}</td></tr>)}</tbody>
          </table>
        </section>
      ))}
    </div>
  )
}

const GUARDS = [
  'The price is always read on the worker (plan price table, or the listing). A price sent by the browser is ignored.',
  'The webhook must carry a valid HMAC-SHA512 signature; the amount and currency must match the payment, or the payment becomes "mismatch" and nothing is granted.',
  'Only the processor word "finished" counts as paid. Partly paid is "underpaid" and grants nothing.',
  'Fulfilment is idempotent: the payment write carries the document\'s updateTime. A repeated or racing webhook either finds "paid" or fails with a conflict (409) and is retried.',
  'Everything one purchase changes is committed together (payment, plan or order, copy, balance, ledger, sales count), or not at all.',
  'Ledger entries have fixed ids (sale_{orderId}, hold_{payoutId}) and are created with "only if new", so they can never be doubled.',
  'The fee is fixed on the order at checkout. If the seller\'s page is deleted before delivery, nothing is delivered or credited and the order is flagged for a person.',
  'You cannot buy your own page or one you already own. A page counts against the buyer\'s page limit through the normal projectCount rule.',
  'One payout request at a time; the amount leaves the balance immediately so it cannot be spent twice. Cancelling is manual (add the money back).',
  'Browser origins are limited to ALLOWED_ORIGINS; the person returns to the address they started from.',
]

/** The prices and limits (read live from the worker) and the guarantees that keep money safe. */
export function PaymentRules() {
  const [constants, setConstants] = useState<Constant[] | null>(null)
  useEffect(() => {
    let alive = true
    loadCatalog().then((value) => { if (alive) setConstants(value) })
    return () => { alive = false }
  }, [])
  return (
    <div className={over.grid}>
      <section>
        <h3>Prices and limits (workers/billing/src/catalog.ts)</h3>
        {!constants ? <p className={over.muted}>Reading the worker…</p> : (
          <table><tbody>{constants.map((item) => <tr key={item.name}><td><code>{item.name}</code></td><td><b>{item.value}</b></td><td>{item.note}</td></tr>)}</tbody></table>
        )}
        <p className={over.muted}>The same numbers also live in <code>plans.ts</code>, <code>marketplace/types.ts</code> and <code>firestore.rules</code>; they must match.</p>
      </section>
      <section>
        <h3>What keeps money safe</h3>
        <ol>{GUARDS.map((text) => <li key={text}>{text}</li>)}</ol>
      </section>
    </div>
  )
}
