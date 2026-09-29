import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { PageSpinner } from '@/shared/ui'
import { RouteError } from './RouteError'

/** Lazy-load a page so each screen is its own small JS chunk. */
function page(load: () => Promise<{ default: ComponentType }>) {
  const Page = lazy(load)
  return (
    <Suspense fallback={<PageSpinner />}>
      <Page />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      { path: '/', element: page(() => import('@/features/home/HomePage')) },
      { path: '/try', element: page(() => import('@/features/editor/pages/PlaygroundPage')) },
      { path: '/login', element: page(() => import('@/features/auth/LoginPage')) },
      { path: '/signup', element: page(() => import('@/features/auth/SignupPage')) },
      { path: '/reset', element: page(() => import('@/features/auth/ResetPasswordPage')) },
      { path: '*', element: page(() => import('./NotFoundPage')) },
    ],
  },
])
