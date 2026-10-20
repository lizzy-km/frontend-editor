import { LegalDocument } from './LegalDocument'
import { PRIVACY } from './privacy'

/** /privacy: the Privacy Policy. */
export default function PrivacyPage() {
  return <LegalDocument doc={PRIVACY} other={{ label: 'Terms of Use', to: '/terms' }} />
}
