/**
 * Firestore collection names. Prefixed so this app never collides with other
 * apps sharing the same Firebase project. Change a name here AND in
 * firestore.rules / firestore.indexes.json (they can't import this file).
 */
export const COLLECTIONS = {
  users: 'tweak_users',
  projects: 'tweaks_projects',
  projectContent: 'tweaks_project_content',
  components: 'tweaks_components',
  payments: 'tweaks_payments',
  listings: 'tweaks_listings',
  orders: 'tweaks_orders',
  ledger: 'tweaks_ledger',
  payouts: 'tweaks_payouts',
} as const
