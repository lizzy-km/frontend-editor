import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { Plugin } from 'vite'
import { INDEXED_ROUTES } from '../../src/config/seoRoutes.ts'
import { buildRobots, buildSitemap, renderRoutePage } from '../../src/shared/seo/staticPages.ts'

/**
 * After the build: a static copy of the page for each public screen (its own title, description, share tags,
 * structured data and a no-script summary), robots.txt, and (when the site address is known) sitemap.xml.
 * Search engines and link previews read these; the app takes over as soon as its script runs.
 */
export function seoPlugin(siteUrl: string): Plugin {
  let outDir = 'dist'
  return {
    name: 'tweak-seo',
    apply: 'build',
    configResolved(config) { outDir = config.build.outDir },
    closeBundle() {
      const template = readFileSync(join(outDir, 'index.html'), 'utf8')
      for (const route of INDEXED_ROUTES) {
        const file = join(outDir, route.path === '/' ? '' : route.path, 'index.html')
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, renderRoutePage(template, route, siteUrl))
      }
      writeFileSync(join(outDir, 'robots.txt'), buildRobots(siteUrl))
      if (siteUrl) writeFileSync(join(outDir, 'sitemap.xml'), buildSitemap(siteUrl, new Date().toISOString().slice(0, 10)))
      else console.warn('\n[seo] VITE_SITE_URL is not set: the sitemap, canonical links and share pictures were left out. Set it to your site address (https://…) before building.\n')
    },
  }
}
