import { tanstackPath } from '@/features/editor/model/routes'

/** The two routers people can pick for a site, and the files that differ between them. */
export type RouterKind = 'react-router' | 'tanstack'

/** One route: its page component, the element React Router renders, and TanStack's beforeLoad guard. */
export type RouteFile = { path: string; component: string; file: string; element: string; beforeLoad?: string }

type Router = { label: string; lib: string; deps: Record<string, string>; go: (target: string, typed: boolean) => string }

export const ROUTERS: Record<RouterKind, Router> = {
  'react-router': { label: 'React Router', lib: 'react-router', deps: { 'react-router': '^7.9.0' }, go: (target) => `navigate(${target})` },
  // TanStack checks addresses against the routes; a value only known at run time (a list item's prop) is not one of them.
  tanstack: { label: 'TanStack Router', lib: '@tanstack/react-router', deps: { '@tanstack/react-router': '^1.130.0' }, go: (target, typed) => `void navigate({ to: ${target}${typed ? '' : ' as never'} })` },
}

const pageImports = (routes: RouteFile[]) => routes.map((route) => `import ${route.component} from './pages/${route.file}'`)
const routeName = (route: RouteFile) => `${route.component.charAt(0).toLowerCase()}${route.component.slice(1)}Route`

function reactRouterSource(routes: RouteFile[], imports: string[]): string {
  return [
    "import { createBrowserRouter } from 'react-router'",
    "import Layout from './layout/Layout'",
    "import NotFoundPage from './pages/NotFoundPage'",
    ...pageImports(routes), ...imports, '',
    '/** Every page of the site, inside the shared Layout (header, footer…). */',
    'export const router = createBrowserRouter([',
    '  {',
    '    element: <Layout />,',
    '    children: [',
    ...routes.map((route) => `      { path: '${route.path}', element: ${route.element} },`),
    "      { path: '*', element: <NotFoundPage /> },",
    '    ],', '  },', '])', '',
  ].join('\n')
}

function tanstackSource(routes: RouteFile[], imports: string[]): string {
  return [
    "import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'",
    "import Layout from './layout/Layout'",
    "import NotFoundPage from './pages/NotFoundPage'",
    ...pageImports(routes), ...imports, '',
    '/** The shared Layout (header, footer…) around every page. */',
    'const rootRoute = createRootRoute({ component: Layout, notFoundComponent: NotFoundPage })', '',
    ...routes.map((route) => `const ${routeName(route)} = createRoute({ getParentRoute: () => rootRoute, path: '${tanstackPath(route.path)}', ${route.beforeLoad ? `beforeLoad: ${route.beforeLoad}, ` : ''}component: ${route.component} })`),
    '',
    `const routeTree = rootRoute.addChildren([${routes.map(routeName).join(', ')}])`, '',
    'export const router = createRouter({ routeTree, scrollRestoration: true })', '',
    "declare module '@tanstack/react-router' {", '  interface Register {', '    router: typeof router', '  }', '}', '',
  ].join('\n')
}

/** src/router.tsx: every page under the shared Layout (guards included), plus "page not found". */
export const routerSource = (kind: RouterKind, routes: RouteFile[], imports: string[] = []) =>
  (kind === 'react-router' ? reactRouterSource(routes, imports) : tanstackSource(routes, imports))

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
