/**
 * The Terms and the Privacy Policy are data: sections of plain blocks. Text may use **bold**, [label](/address) links and the tokens
 * {operator}, {email}, {address} and {country}, which are filled from config/legal.config.ts when shown.
 */
export type LegalBlock =
  | { kind: 'p'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'table'; head: string[]; rows: string[][] }
  | { kind: 'note'; text: string }

export type LegalSection = {
  id: string
  title: string
  blocks: LegalBlock[]
  /** Shown only while that feature is switched on (so the texts never describe something that is not live). */
  when?: 'billing' | 'marketplace'
}

export type LegalDoc = { title: string; intro: string; sections: LegalSection[] }
