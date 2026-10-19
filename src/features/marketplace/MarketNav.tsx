import { Link } from 'react-router-dom'
import { AccountMenu } from '@/features/auth/components/AccountMenu'
import { useAuthStore } from '@/features/auth/auth.store'
import { TopBar } from '@/shared/ui'

/** The top bar of every marketplace screen: browse, sell, orders, earnings and the account. */
export function MarketNav() {
  const signedIn = useAuthStore((state) => state.status === 'signedIn')
  return (
    <TopBar>
      <Link to="/market">Browse</Link>
      {signedIn && <><Link to="/market/sell">Sell a page</Link><Link to="/market/orders">My orders</Link><Link to="/market/earnings">Earnings</Link><AccountMenu /></>}
      {!signedIn && <Link to="/login">Sign in</Link>}
    </TopBar>
  )
}

/** Soft colour from the name, so a listing without a picture still looks distinct. */
const hueOf = (text: string) => [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360

/** The listing's picture, or a coloured tile with its first letter. */
export function ListingThumb({ title, url, className }: { title: string; url: string | null; className?: string }) {
  if (url) return <img className={className} src={url} alt="" loading="lazy" />
  return <span className={className} style={{ background: `hsl(${hueOf(title)} 70% 88%)` }} aria-hidden="true">{title.charAt(0).toUpperCase()}</span>
}

/** $12 or $12.50. */
export const usd = (amount: number) => `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`
