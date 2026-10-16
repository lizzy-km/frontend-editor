import { lazy, Suspense, type ComponentType, type ReactElement } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom'
import { features, type FeatureName } from '@/config/features.config'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { PageSpinner } from '@/shared/ui'
import { RouteError } from './RouteError'
import { RouteSeo } from './RouteSeo'

/** Same as page(), but only for signed-in people. */
const privatePage = (load: () => Promise<{ default: ComponentType }>) => <RequireAuth>{page(load)}</RequireAuth>

/** A page that only exists while its feature flag is on (404 otherwise). */
const flagged = (flag: FeatureName, element: ReactElement) => (features[flag] ? element : page(() => import('./NotFoundPage')))

/** Lazy-load a page so each screen is its own small JS chunk. */
function page(load: () => Promise<{ default: ComponentType }>) {
  const Page = lazy(load)
  return (
    <Suspense fallback={<PageSpinner />}>
      <Page />
    </Suspense>
  )
}

/** Every screen sits inside this: it keeps the page head (title, description, noindex) right for the address. */
function Root() {
  return (
    <>
      <RouteSeo />
      <Outlet />
    </>
  )
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: page(() => import('@/features/home/HomePage')) },
      { path: '/try', element: page(() => import('@/features/editor/pages/PlaygroundPage')) },
      { path: '/login', element: page(() => import('@/features/auth/LoginPage')) },
      { path: '/signup', element: page(() => import('@/features/auth/SignupPage')) },
      { path: '/reset', element: page(() => import('@/features/auth/ResetPasswordPage')) },
      { path: '/projects', element: privatePage(() => import('@/features/workspace/DashboardPage')) },
      { path: '/projects/new', element: privatePage(() => import('@/features/workspace/NewProjectPage')) },
      { path: '/edit/:projectId', element: privatePage(() => import('@/features/workspace/ProjectEditorPage')) },
      { path: '/guide', element: page(() => import('@/features/guide/GuidePage')) },
      { path: '/guide/full', element: page(() => import('@/features/guide/GuidePage')) },
      { path: '/gallery', element: page(() => import('@/features/gallery/GalleryPage')) },
      { path: '/p/:projectId', element: page(() => import('@/features/gallery/PublicPageView')) },
      { path: '/plans', element: flagged('enable_billing', privatePage(() => import('@/features/billing/PlansPage'))) },
      { path: '/market', element: flagged('enable_marketplace', page(() => import('@/features/marketplace/MarketplacePage'))) },
      { path: '*', element: page(() => import('./NotFoundPage')) },
    ],
  },
])
