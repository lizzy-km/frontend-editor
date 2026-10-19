/** What the payment and market features do, written out for the /dev/payment page (plain facts, kept next to the code they describe). */

export type Endpoint = { method: string; path: string; who: string; does: string; file: string }

/** The billing worker's three addresses (workers/billing/src/index.ts). */
export const ENDPOINTS: Endpoint[] = [
  { method: 'POST', path: '/checkout', who: 'a signed-in person (Firebase token)', does: 'Starts a hosted crypto checkout for a plan ({ kind: "plan", planId, months }) or a marketplace page ({ kind: "order", listingId }). Prices are read on the worker, never from the browser. Answers { checkoutUrl, reference }.', file: 'checkout.ts, checkoutOrder.ts, startPayment.ts' },
  { method: 'POST', path: '/webhook/nowpayments', who: 'the payment processor (HMAC-SHA512 signature)', does: 'Confirms a payment. Checks the signature, amount and currency, marks the payment, and carries out what it was for (plan or delivery) in one commit.', file: 'webhook.ts, fulfil.ts, fulfilOrder.ts' },
  { method: 'POST', path: '/payout', who: 'a signed-in seller', does: 'Holds an amount from the seller\'s balance and records a payout request that a person pays by hand.', file: 'payout.ts' },
]

export type Screen = { path: string; name: string; who: string; does: string }

/** The screens, all behind the enable_billing / enable_marketplace flags (development only for now). */
export const SCREENS: Screen[] = [
  { path: '/plans', name: 'Plans', who: 'signed in', does: 'Shows the current plan and when it ends, lets someone pay for 1 to 12 months of Pro, shows how a payment is going and lists past payments.' },
  { path: '/market', name: 'Marketplace', who: 'everyone', does: 'Browse active listings: search words, sort by newest, cheapest, dearest or most sold.' },
  { path: '/market/:listingId', name: 'Listing', who: 'everyone (buying needs an account)', does: 'One page for sale with its price. Buy sends the person to the processor\'s payment page.' },
  { path: '/market/sell', name: 'Sell', who: 'signed in', does: 'The seller\'s listings: put a page up for sale, change price or text, pause, remove.' },
  { path: '/market/orders', name: 'Orders', who: 'signed in', does: 'Pages bought (with a link to the buyer\'s copy) and pages sold. Also where payment progress shows after paying.' },
  { path: '/market/earnings', name: 'Earnings', who: 'signed in', does: 'Balance, sales and payouts history, and a payout request (wallet and amount).' },
]

export type Fn = { group: string; name: string; file: string; does: string }

/** The main functions, grouped by where they run. */
export const FUNCTIONS: Fn[] = [
  { group: 'App: billing', name: 'startCheckout', file: 'src/features/billing/payments.ts', does: 'Asks the worker for a hosted checkout; the person is then sent to checkoutUrl.' },
  { group: 'App: billing', name: 'callBilling', file: 'src/features/billing/payments.ts', does: 'Sends a signed-in request to the worker and turns failures into sentences that can be shown as they are.' },
  { group: 'App: billing', name: 'requestPayout', file: 'src/features/billing/payments.ts', does: 'A seller asks to be paid out.' },
  { group: 'App: billing', name: 'effectivePlan', file: 'src/features/billing/plans.ts', does: 'The plan someone has right now: Pro counts only until planUntil. firestore.rules do the same.' },
  { group: 'App: billing', name: 'paymentWords', file: 'src/features/billing/paymentWords.ts', does: 'A payment status in everyday words, and whether it is still moving.' },
  { group: 'App: billing', name: 'CheckoutStatus', file: 'src/features/billing/CheckoutStatus.tsx', does: 'After paying, looks at the payment every 4 seconds for up to 3 minutes until it settles.' },
  { group: 'App: market', name: 'listingProblem / payoutProblem', file: 'src/features/marketplace/validate.ts', does: 'What is wrong with a listing or a payout request, in plain words (the rules and worker refuse the same things).' },
  { group: 'App: market', name: 'shown', file: 'src/features/marketplace/browse.ts', does: 'Filters listings by every word typed and sorts them.' },
  { group: 'App: market', name: 'listMyOrders / listMyLedger / listMyPayouts', file: 'src/features/workspace/api/marketMoney.ts', does: 'Small per-person lists, sorted in the app so no custom index is needed.' },
  { group: 'Worker', name: 'handleCheckout', file: 'workers/billing/src/checkout.ts', does: 'Checks the token, then prices a plan or hands over to checkoutOrder.' },
  { group: 'Worker', name: 'checkoutOrder', file: 'workers/billing/src/checkoutOrder.ts', does: 'Checks the listing is for sale, not your own and not already bought; records the order (fee fixed now) with the payment.' },
  { group: 'Worker', name: 'startPayment', file: 'workers/billing/src/startPayment.ts', does: 'Records the pending payment, creates the invoice, saves invoiceId. A refusal marks the payment failed.' },
  { group: 'Worker', name: 'createInvoice', file: 'workers/billing/src/nowpayments.ts', does: 'Calls the processor (sandbox unless NOWPAYMENTS_SANDBOX is "false").' },
  { group: 'Worker', name: 'verifySignature / stateOf', file: 'workers/billing/src/nowpayments.ts', does: 'Constant-time signature check; only "finished" counts as paid.' },
  { group: 'Worker', name: 'handleWebhook', file: 'workers/billing/src/webhook.ts', does: 'Idempotent confirmation: a repeated callback finds "paid" and does nothing; a concurrent change answers 409 so the processor retries.' },
  { group: 'Worker', name: 'planUntil', file: 'workers/billing/src/fulfil.ts', does: 'Adds paid months on top of what is left, so paying early never loses days.' },
  { group: 'Worker', name: 'fulfilOrder', file: 'workers/billing/src/fulfilOrder.ts', does: 'Delivers a private copy to the buyer, credits the seller minus the fee, writes the ledger, counts the sale, marks delivered. If the seller\'s page is gone it flags the order for review instead.' },
  { group: 'Worker', name: 'handlePayout', file: 'workers/billing/src/payout.ts', does: 'Validates the wallet and amount, then payout + balance + ledger hold in one commit.' },
  { group: 'Worker', name: 'restStore', file: 'workers/billing/src/firestoreRest.ts', does: 'Reads and commits to Firestore with the service account; every write can say "only if unchanged" (updateTime) or "only if new".' },
]
