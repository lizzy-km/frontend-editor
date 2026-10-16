import { INDEXED_ROUTES, NOINDEX_PREFIXES, SEO_ROUTES, type SeoRoute } from '../../config/seoRoutes.ts'
import { headTags, jsonLdTags, tagsToHtml, absolute } from './headTags.ts'
import { breadcrumbLd, organizationLd, softwareLd, websiteLd } from './jsonLd.ts'

/** Pure builders for what the build writes next to the app: a static page per public screen, sitemap.xml and robots.txt. */

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Structured data worth sending before any script runs. */
function staticLd(route: SeoRoute, siteUrl: string): object[] {
  if (route.path === '/') return [organizationLd(siteUrl), websiteLd(siteUrl), softwareLd(siteUrl)]
  const trail: [string, string][] = [['Home', '/']]
  if (route.path.startsWith('/guide')) trail.push(['Guide', '/guide'])
  if (route.path === '/guide/full') trail.push(['Full guide', '/guide/full'])
  if (route.path === '/try') trail.push(['Try Tweak', '/try'])
  if (route.path === '/gallery') trail.push(['Explore', '/gallery'])
  return [breadcrumbLd(siteUrl, trail)]
}

/** The words for crawlers and readers without scripts: a heading, a few lines, and the main links. */
function noscriptHtml(route: SeoRoute): string {
  const summary = route.summary
  if (!summary) return ''
  const links = (summary.links ?? []).map(([label, to]) => `<a href="${escapeHtml(to)}">${escapeHtml(label)}</a>`).join(' · ')
  return `<noscript><main style="font-family: system-ui, sans-serif; max-width: 640px; margin: 48px auto; padding: 0 16px"><h1>${escapeHtml(summary.heading)}</h1><p>${escapeHtml(summary.text)}</p><p>${links}</p><p>Tweak needs JavaScript to run in your browser.</p></main></noscript>`
}

/** The built index.html made into the page for one address: its own title, description, share tags, structured data and no-script summary. */
export function renderRoutePage(template: string, route: SeoRoute, siteUrl: string, image = '/og-image.png'): string {
  const head = tagsToHtml([...headTags({ title: route.title, description: route.description, path: route.path, index: route.index, image }, siteUrl), ...jsonLdTags(staticLd(route, siteUrl))])
  return template
    .replace(/<title[^>]*>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\s+name="description"[^>]*>\s*/i, '')
    .replace(/<\/head>/i, `    ${head}\n  </head>`)
    .replace(/<\/body>/i, `    ${noscriptHtml(route)}\n  </body>`)
}

/** sitemap.xml for the public screens (needs the site address). */
export function buildSitemap(siteUrl: string, date: string): string {
  const urls = INDEXED_ROUTES.map((route) => `  <url><loc>${escapeHtml(absolute(siteUrl, route.path))}</loc><lastmod>${date}</lastmod><changefreq>${route.changefreq ?? 'monthly'}</changefreq><priority>${(route.priority ?? 0.5).toFixed(1)}</priority></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

/** robots.txt: everything public may be crawled; account and editor screens are not; the sitemap is named when the site address is known. */
export function buildRobots(siteUrl: string): string {
  const closed = [...new Set([...SEO_ROUTES.filter((route) => !route.index).map((route) => route.path), ...NOINDEX_PREFIXES.filter((prefix) => prefix !== '/p/')])]
  return [
    'User-agent: *', 'Allow: /', ...closed.map((path) => `Disallow: ${path}`), '',
    ...(siteUrl ? [`Sitemap: ${siteUrl}/sitemap.xml`, ''] : []),
  ].join('\n')
}
