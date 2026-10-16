import { useLocation } from 'react-router-dom'
import { DEFAULT_DESCRIPTION, NOINDEX_PREFIXES, seoRouteFor } from '@/config/seoRoutes'
import { SHARE_IMAGE } from '@/config/seo.config'
import { Seo } from '@/shared/seo/Seo'
import type { SeoMeta } from '@/shared/seo/headTags'

/** What the head should say for an address: its entry in the list, or "not indexed" for private and unknown screens. */
export function metaFor(pathname: string): SeoMeta {
  const route = seoRouteFor(pathname)
  if (route) return { title: route.title, description: route.description, path: route.path, index: route.index, image: SHARE_IMAGE }
  // The developer docs exist only in development; there they are a real (but never indexed) screen.
  if (import.meta.env.DEV && pathname === '/dev') return { title: 'Developer docs — Tweak', description: DEFAULT_DESCRIPTION, path: pathname, index: false }
  const known = NOINDEX_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  return { title: known ? 'Tweak' : 'Page not found — Tweak', description: DEFAULT_DESCRIPTION, path: pathname, index: false }
}

/** Keeps the page head right as people move around the app (title, description, share tags, noindex). */
export function RouteSeo() {
  const { pathname } = useLocation()
  return <Seo meta={metaFor(pathname)} />
}
