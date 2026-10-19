/** The saved data of payments and the marketplace, field by field, for the /dev/payment page. Source of truth: firestore.rules and workers/billing. */

export type Field = [name: string, type: string, note: string]
export type Collection = { name: string; path: string; read: string; write: string; about: string; fields: Field[] }

export const COLLECTION_DOCS: Collection[] = [
  {
    name: 'Payment', path: 'tweaks_payments/{id}', read: 'the payer', write: 'worker only', about: 'One attempt to pay, for a plan or for a page. Created pending by /checkout, settled by the webhook.',
    fields: [
      ['ownerId', 'string', 'who pays'], ['kind', "'plan' | 'order'", 'what it is for'], ['ref', 'string', 'plan id, or the order id'], ['months', 'number', 'plans only, 1 to 12'],
      ['amountUsd', 'number', 'priced by the worker, two decimals'], ['status', 'string', 'pending, paid, underpaid, failed, expired, refunded, mismatch'], ['provider', 'string', "'nowpayments'"],
      ['invoiceId', 'string', "the processor's invoice"], ['providerPaymentId', 'string', "the processor's payment"], ['paymentStatus', 'string', "the processor's own word, kept as received"],
      ['needsReview', 'boolean', 'a person should look (refund after paid)'], ['note', 'string', 'why a checkout failed'], ['paidAt / createdAt / updatedAt', 'timestamp', ''],
    ],
  },
  {
    name: 'User (money fields)', path: 'tweak_users/{uid}', read: 'the owner', write: 'worker (plan, planUntil, earningsUsd)', about: 'The profile also holds the plan and the seller balance. The browser can never change them.',
    fields: [['plan', "'free' | 'pro'", 'created as free; upgraded only by the worker'], ['planUntil', 'timestamp', 'Pro counts until then; none = never ends'], ['earningsUsd', 'number', 'balance a seller can ask to be paid out'], ['projectCount', 'number', 'a delivered copy adds 1 (with lastProjectOp)']],
  },
  {
    name: 'Listing', path: 'tweaks_listings/{id}', read: 'anyone if active, else the seller', write: 'the seller (salesCount: worker)', about: "A page for sale. Points at one of the seller's projects.",
    fields: [['ownerId', 'string', 'the seller'], ['sellerName', 'string', ''], ['projectId', 'string', "the seller's page"], ['title', 'string', '1 to 100 letters'], ['description', 'string', 'up to 1000 letters'], ['priceUsd', 'number', '1 to 500'], ['thumbnailUrl', 'string | null', ''], ['status', "'active' | 'paused'", 'only active ones are public'], ['salesCount', 'number', 'worker only']],
  },
  {
    name: 'Order', path: 'tweaks_orders/{id}', read: 'buyer and seller', write: 'worker only', about: 'A purchase. The fee is fixed when the order is made, so a later change of the percentage never touches old orders.',
    fields: [['buyerId / sellerId', 'string', ''], ['listingId / projectId', 'string', "the listing and the seller's page"], ['title', 'string', 'copied from the listing'], ['priceUsd', 'number', ''], ['feeUsd', 'number', '10% of the price'], ['sellerEarningsUsd', 'number', 'price minus fee'], ['status', "'pending' | 'paid' | 'delivered'", 'paid without delivered = needs review'], ['deliveredProjectId', 'string', "the buyer's copy"], ['needsReview / note', '', "set when the seller's page was gone"]],
  },
  {
    name: 'Ledger entry', path: 'tweaks_ledger/{id}', read: 'the seller', write: 'worker only', about: "The seller's money history. The id is sale_{orderId} or hold_{payoutId}, so a repeat can never add it twice.",
    fields: [['sellerId', 'string', ''], ['type', "'sale' | 'payout-hold'", ''], ['amountUsd', 'number', 'signed: sales positive, holds negative'], ['feeUsd', 'number', 'sales only'], ['orderId / payoutId', 'string', 'what it came from'], ['title', 'string', 'sales only']],
  },
  {
    name: 'Payout', path: 'tweaks_payouts/{id}', read: 'the seller', write: 'worker only', about: 'A request to be paid. A person pays the wallet by hand and sets the status in the Firebase console.',
    fields: [['sellerId', 'string', ''], ['amountUsd', 'number', 'at least 20, at most the balance'], ['wallet', 'string', '10 to 120 characters, no spaces'], ['status', "'requested' | 'paid' | 'cancelled'", 'one open request at a time']],
  },
]
