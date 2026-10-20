/**
 * Who is behind the app, for the Terms and the Privacy Policy. Set these in .env before launch (see src/vite-env.d.ts):
 * the pages show a visible "[… not set]" placeholder for anything missing, so a missing value can never go live unnoticed.
 */
export const legal = {
  /** The person or company that runs the service (the "we" of the documents). */
  operator: (import.meta.env.VITE_LEGAL_OPERATOR ?? '').trim(),
  /** Where people write to about their data, the terms or a copyright complaint. */
  email: (import.meta.env.VITE_LEGAL_EMAIL ?? '').trim(),
  /** Postal address of the operator (optional but often required by law). */
  address: (import.meta.env.VITE_LEGAL_ADDRESS ?? '').trim(),
  /** The country or state whose law governs the terms, e.g. "Singapore" or "the State of California, USA". */
  country: (import.meta.env.VITE_LEGAL_COUNTRY ?? '').trim(),
}

/** The date the texts were last changed (update it with any change of meaning, and say so in docs/HISTORY.md). */
export const LEGAL_UPDATED = '2026-10-20'

/** Which of the settings above are still empty (shown to the operator while developing). */
export const missingLegalSettings = (): string[] => [
  ...(legal.operator ? [] : ['VITE_LEGAL_OPERATOR']), ...(legal.email ? [] : ['VITE_LEGAL_EMAIL']), ...(legal.country ? [] : ['VITE_LEGAL_COUNTRY']),
]
