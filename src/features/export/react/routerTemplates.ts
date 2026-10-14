/** The two routers people can pick for a site, and the files that differ between them. */
export type RouterKind = 'react-router' | 'tanstack'

export type RouteFile = { path: string; component: string; file: string; private: boolean }

type Router = { label: string; lib: string; deps: Record<string, string>; go: (target: string, typed: boolean) => string }

export const ROUTERS: Record<RouterKind, Router> = {
  'react-router': { label: 'React Router', lib: 'react-router', deps: { 'react-router': '^7.9.0' }, go: (target) => `navigate(${target})` },
  // TanStack checks addresses against the routes; a value only known at run time (a list item's prop) is not one of them.
  tanstack: { label: 'TanStack Router', lib: '@tanstack/react-router', deps: { '@tanstack/react-router': '^1.130.0' }, go: (target, typed) => `void navigate({ to: ${target}${typed ? '' : ' as never'} })` },
}

const pageImports = (routes: RouteFile[]) => routes.map((route) => `import ${route.component} from './pages/${route.file}'`)

/** src/router.tsx: every page under the shared Layout, plus "page not found". */
export function routerSource(kind: RouterKind, routes: RouteFile[], guard: (route: RouteFile) => string): string {
  if (kind === 'react-router') {
    return [
      "import { createBrowserRouter } from 'react-router'",
      "import Layout from './layout/Layout'",
      "import NotFoundPage from './pages/NotFoundPage'",
      ...pageImports(routes),
      ...(routes.some((route) => route.private) ? ["import LoginPage from './pages/LoginPage'", "import { RequireAuth } from './auth/RequireAuth'"] : []),
      '',
      '/** Every page of the site, inside the shared Layout (header, footer…). */',
      'export const router = createBrowserRouter([',
      '  {',
      '    element: <Layout />,',
      '    children: [',
      ...routes.map((route) => `      { path: '${route.path}', element: ${guard(route)} },`),
      ...(routes.some((route) => route.private) ? ["      { path: '/login', element: <LoginPage /> },"] : []),
      "      { path: '*', element: <NotFoundPage /> },",
      '    ],',
      '  },',
      '])',
      '',
    ].join('\n')
  }
  const name = (route: RouteFile) => `${route.component.charAt(0).toLowerCase()}${route.component.slice(1)}Route`
  return [
    "import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'",
    "import Layout from './layout/Layout'",
    "import NotFoundPage from './pages/NotFoundPage'",
    ...pageImports(routes),
    ...(routes.some((route) => route.private) ? ["import LoginPage from './pages/LoginPage'", "import { requireSignIn } from './auth/RequireAuth'"] : []),
    '',
    '/** The shared Layout (header, footer…) around every page. */',
    'const rootRoute = createRootRoute({ component: Layout, notFoundComponent: NotFoundPage })',
    '',
    ...routes.map((route) => `const ${name(route)} = createRoute({ getParentRoute: () => rootRoute, path: '${route.path}', ${route.private ? 'beforeLoad: requireSignIn, ' : ''}component: ${route.component} })`),
    ...(routes.some((route) => route.private) ? ["const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginPage })"] : []),
    '',
    `const routeTree = rootRoute.addChildren([${[...routes.map(name), ...(routes.some((route) => route.private) ? ['loginRoute'] : [])].join(', ')}])`,
    '',
    'export const router = createRouter({ routeTree, scrollRestoration: true })',
    '',
    "declare module '@tanstack/react-router' {",
    '  interface Register {',
    '    router: typeof router',
    '  }',
    '}',
    '',
  ].join('\n')
}

/** src/main.tsx: the router takes over the page (inside AuthProvider when some pages are signed-in only). */
export function mainSource(kind: RouterKind, withAuth: boolean): string {
  const app = withAuth ? '<AuthProvider>\n    <RouterProvider router={router} />\n  </AuthProvider>' : '<RouterProvider router={router} />'
  return [
    "import { createRoot } from 'react-dom/client'",
    `import { RouterProvider } from '${ROUTERS[kind].lib}'`,
    ...(withAuth ? ["import { AuthProvider } from './auth/AuthProvider'"] : []),
    "import { router } from './router'",
    "import './styles/page.css'",
    '',
    "// No <StrictMode>: the page's own scripts (public/scripts) expect the page to be put on screen once.",
    `createRoot(document.getElementById('root')!).render(\n  ${app},\n)`,
    '',
  ].join('\n')
}

/** src/pages/NotFoundPage.tsx */
export const notFoundSource = (kind: RouterKind) => `import { Link } from '${ROUTERS[kind].lib}'

/** Shown for addresses that are not a page of the site. */
export default function NotFoundPage() {
  return (
    <section style={{ padding: '96px 24px', textAlign: 'center' }}>
      <h1>Page not found</h1>
      <p>This page doesn't exist (any more).</p>
      <Link to="/">Back to the home page</Link>
    </section>
  )
}
`
