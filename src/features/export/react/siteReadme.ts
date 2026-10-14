import { ROUTERS, type RouteFile, type RouterKind } from './routerTemplates'

/** The README part that explains the pages and the router. */
export function siteReadme(router: RouterKind, routes: RouteFile[]): string {
  return `## Pages

This is a multi-page site using **${ROUTERS[router].label}**.

| Address | File |
|---|---|
${routes.map((route) => `| \`${route.path}\` | \`src/pages/${route.file}.tsx\` |`).join('\n')}

- \`src/router.tsx\` lists the pages. Add a page: create a file in \`src/pages\` and add a route.
- \`src/layout/Layout.tsx\` holds what every page shares (header, footer…); the page appears at \`<Outlet />\`.
- Links between pages use the router's \`<Link to="…">\`, so moving between pages is instant.
- Each page's sections are in \`src/components/<page>/\`; the shared ones in \`src/components/layout/\`.
- The page's own JavaScript (\`public/scripts/\`) was written for one page. It runs once when the app
  opens; parts of it that look for elements of other pages may log errors there. Moving each behaviour
  into the component it belongs to (with \`useEffect\`) fixes that for good.
`
}
