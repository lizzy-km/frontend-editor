import { listPages, PATH_ATTR } from '@/features/editor/model/pages'
import { allPagesDoc } from '@/features/editor/model/serialize/sitePages'
import { getElement } from '@/features/editor/model/tree/queries'
import type { ElementNode, PageDoc } from '@/features/editor/model/types'
import type { ExportFiles } from '../buildFiles'
import { AUTH_DEPS, authFiles, needsAuth } from './auth/authFiles'
import { routeGuard } from './auth/guardTemplates'
import type { RouterLinks } from './componentFiles'
import { createNameRegistry, pascalCase } from './names'
import { projectShell, renderParts, type Parts } from './projectShell'
import { DATA_README, readme } from './projectTemplates'
import { animationDeps, animationFiles } from './animationTemplates'
import { dataFiles, DATA_DEPS } from './dataTemplates'
import { formProject } from './forms/formTemplates'
import { listUiFiles } from './listTemplates'
import { mainFile } from './mainTemplate'
import { notFoundSource, routerSource, ROUTERS, type RouteFile, type RouterKind } from './routerTemplates'
import { siteReadme } from './siteReadme'

type Options = { router: RouterKind }

const componentImports = (parts: Parts, folder: string, from: string) =>
  parts.names.map((name) => `import ${name} from '${from}/components/${folder}/${name}'`)

/** src/layout/Layout.tsx: the shared parts with the current page (<Outlet />) where the pages sit. */
function layoutSource(kind: RouterKind, before: Parts, after: Parts): string {
  const isReactRouter = kind === 'react-router'
  return [
    "import { useEffect } from 'react'",
    `import { Outlet${isReactRouter ? ', ScrollRestoration' : ''} } from '${ROUTERS[kind].lib}'`,
    ...componentImports(before, 'layout', '..'), ...componentImports(after, 'layout', '..'),
    "import { runPageScripts } from '../runPageScripts'",
    '',
    '/** The parts every page shares (header, footer…). The current page appears at <Outlet />. */',
    'export default function Layout() {',
    '  useEffect(() => runPageScripts(), [])',
    '  return (', '    <>', ...before.jsx, '      <Outlet />', ...after.jsx,
    ...(isReactRouter ? ['      <ScrollRestoration />'] : []), '    </>', '  )', '}', '',
  ].join('\n')
}

function pageSource(name: string, title: string, parts: Parts, folder: string): string {
  return [
    ...componentImports(parts, folder, '..'), '',
    `/** The "${title.replace(/"/g, "'")}" page. */`,
    `export default function ${name}() {`,
    '  return (', '    <>', ...parts.jsx, '    </>', '  )', '}', '',
  ].join('\n')
}

/** A multi-page site as a Vite + React + TypeScript app with a router, a shared Layout and one file per page. */
export function buildSiteProject(doc: PageDoc, { router }: Options): ExportFiles {
  const pages = listPages(doc)
  const body = getElement(doc.nodes, doc.rootId)!
  const first = body.children.indexOf(pages[0]!.id)
  const isPage = (id: string) => pages.some((page) => page.id === id)
  const links: RouterLinks = { paths: new Set(pages.map((page) => page.path)), lib: ROUTERS[router].lib, go: ROUTERS[router].go }
  const takeName = createNameRegistry()
  const data = { base: '../..', sources: doc.data ?? [] }
  const files: ExportFiles = {}
  const write = (parts: Parts, folder: string) => { for (const file of parts.files) files[`src/components/${folder}/${file.name}.tsx`] = file.code }

  const before = renderParts(doc.nodes, body.children.slice(0, first).filter((id) => !isPage(id)), takeName, '      ', links, data)
  const after = renderParts(doc.nodes, body.children.slice(first).filter((id) => !isPage(id)), takeName, '      ', links, data)
  write(before, 'layout')
  write(after, 'layout')

  const routes: RouteFile[] = pages.map((page) => {
    const component = takeName(`${pascalCase(page.title) || 'Page'}Page`)
    const folder = page.key
    const parts = renderParts(doc.nodes, (doc.nodes[page.id] as ElementNode).children, takeName, '      ', links, data)
    write(parts, folder)
    files[`src/pages/${component}.tsx`] = pageSource(component, page.title, parts, folder)
    const access = { roles: page.access.roles, flags: page.access.flags, signedIn: page.access.audience === 'signed-in', signedOut: page.access.audience === 'signed-out' }
    return { path: (doc.nodes[page.id] as ElementNode).attrs[PATH_ATTR] ?? '/', component, file: component, ...routeGuard(router, access, `<${component} />`) }
  })

  const sources = doc.data ?? []
  const forms = formProject(doc.nodes)
  const shell = projectShell(allPagesDoc(doc), { ...forms.deps, ...ROUTERS[router].deps, ...(sources.length ? DATA_DEPS : {}), ...animationDeps(doc.nodes), ...(needsAuth(doc) ? AUTH_DEPS : {}) })
  const withAuth = needsAuth(doc)
  const auth = authFiles(doc, router)
  if (withAuth) {
    // The routes guards send people to: the login page (the site's own, else a standard one) and "No access".
    if (auth['src/pages/LoginPage.tsx']) routes.push({ path: '/login', component: 'LoginPage', file: 'LoginPage', ...routeGuard(router, { roles: [], flags: [], signedIn: false, signedOut: true }, '<LoginPage />') })
    routes.push({ path: '/no-access', component: 'NoAccessPage', file: 'NoAccessPage', element: '<NoAccessPage />' })
  }
  const guardImport = router === 'react-router' ? "import { RequireAuth } from './auth/RequireAuth'" : "import { requireAccess } from './auth/RequireAuth'"
  const guarded = routes.some((route) => route.beforeLoad || route.element.startsWith('<RequireAuth'))
  return {
    ...shell.files,
    ...files,
    ...dataFiles(sources),
    ...listUiFiles(doc),
    ...animationFiles(doc.nodes),
    ...forms.files,
    ...auth,
    'README.md': `${readme(doc.title, [...before.names, ...after.names], shell.hasScripts)}\n${siteReadme(router, routes)}${sources.length ? DATA_README : ''}`,
    'src/main.tsx': mainFile({ root: router, query: sources.length > 0, auth: withAuth }),
    'src/router.tsx': routerSource(router, routes, guarded ? [guardImport] : []),
    'src/layout/Layout.tsx': layoutSource(router, before, after),
    'src/pages/NotFoundPage.tsx': notFoundSource(router),
  }
}
