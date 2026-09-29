import { Link } from 'react-router-dom'
import { EmptyState, TopBar } from '@/shared/ui'

/** Placeholder for the P2P marketplace (behind enable_marketplace). See ./types.ts for the plan. */
export default function MarketplacePage() {
  return (
    <>
      <TopBar><Link to="/gallery">Explore</Link></TopBar>
      <EmptyState
        icon="sparkle" title="Marketplace — coming soon"
        text="Soon you’ll be able to sell copies of your pages and buy pages other people made, paid in crypto."
        action={<Link to="/gallery">Explore free pages meanwhile</Link>}
      />
    </>
  )
}
