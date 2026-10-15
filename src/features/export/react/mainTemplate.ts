import { ROUTERS, type RouterKind } from './routerTemplates'

type Options = {
  /** 'app' = one page (App.tsx); otherwise the site's router. */
  root: 'app' | RouterKind
  /** Data sources: React Query needs its provider. */
  query: boolean
  /** Signed-in only pages: the AuthProvider. */
  auth: boolean
  /** "Ask first" buttons: the question box is mounted once. */
  confirm?: boolean
  /** Tabs, selects, calendars…: the page's behaviour script is imported once. */
  widgets?: boolean
}

/** src/main.tsx: the app, wrapped in the providers it needs (React Query outside, auth inside). */
export function mainFile({ root, query, auth, confirm = false, widgets = false }: Options): string {
  let app = root === 'app' ? '<App />' : '<RouterProvider router={router} />'
  if (confirm) app = `<>
    ${app}
    <ConfirmHost />
  </>`
  if (auth) app = `<AuthProvider>\n    ${app}\n  </AuthProvider>`
  if (query) app = `<QueryClientProvider client={queryClient}>\n    ${app.replace(/\n/g, '\n  ')}\n  </QueryClientProvider>`
  return [
    "import { createRoot } from 'react-dom/client'",
    ...(query ? ["import { QueryClient, QueryClientProvider } from '@tanstack/react-query'"] : []),
    ...(root === 'app' ? ["import App from './App'"] : [`import { RouterProvider } from '${ROUTERS[root].lib}'`, "import { router } from './router'"]),
    ...(confirm ? ["import { ConfirmHost } from './components/ui/confirm'"] : []),
    ...(auth ? ["import { AuthProvider } from './auth/AuthProvider'"] : []),
    "import './styles/page.css'",
    ...(widgets ? ["import './widgets'"] : []),
    '',
    ...(query ? ['/** Caches API answers; data stays fresh for a minute before it is fetched again. */', 'const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })', ''] : []),
    "// No <StrictMode>: the page's own scripts (public/scripts) expect the page to be put on screen once.",
    `createRoot(document.getElementById('root')!).render(\n  ${app},\n)`,
    '',
  ].join('\n')
}
