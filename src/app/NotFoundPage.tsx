import { Link } from 'react-router-dom'
import { EmptyState } from '@/shared/ui'

export default function NotFoundPage() {
  return (
    <EmptyState
      icon="help"
      title="We couldn't find that page"
      text="The link may be old, or the project was made private."
      action={<Link to="/">Go back home</Link>}
    />
  )
}
