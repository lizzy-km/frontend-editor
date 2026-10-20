import { LegalDocument } from './LegalDocument'
import { TERMS } from './terms'

/** /terms: the Terms of Use. */
export default function TermsPage() {
  return <LegalDocument doc={TERMS} other={{ label: 'Privacy Policy', to: '/privacy' }} />
}
