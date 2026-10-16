import { describe, expect, it } from 'vitest'
import { INDEXED_ROUTES, NOINDEX_PREFIXES, SEO_ROUTES, seoRouteFor } from '../../config/seoRoutes'
import { metaFor } from '../../app/RouteSeo'
import { applyTags } from './applyTags'
import { headTags, jsonLdTags, tagsToHtml } from './headTags'
import { breadcrumbLd, faqLd, howToLd, softwareLd } from './jsonLd'
import { buildRobots, buildSitemap, renderRoutePage } from './staticPages'

const TEMPLATE = '<!doctype html><html><head><meta charset="UTF-8" /><meta name="description" content="old" /><title>Old</title></head><body><div id="root"></div></body></html>'
const tag = (tags: ReturnType<typeof headTags>, key: string) => tags.find((item) => item.key === key)

describe('the route list', () => {
  it('has unique addresses and titles and descriptions of a good length', () => {
    expect(new Set(SEO_ROUTES.map((route) => route.path)).size).toBe(SEO_ROUTES.length)
    expect(new Set(SEO_ROUTES.map((route) => route.title)).size).toBe(SEO_ROUTES.length)
    for (const route of SEO_ROUTES) {
      expect(route.title.length, route.path).toBeLessThanOrEqual(65)
      expect(route.description.length, route.path).toBeGreaterThanOrEqual(route.index ? 70 : 10)
      expect(route.description.length, route.path).toBeLessThanOrEqual(165)
      if (route.index) expect(route.summary, `${route.path} needs a summary for crawlers without scripts`).toBeTruthy()
    }
  })

  it('indexes only the public screens and never the account or editor ones', () => {
    expect(INDEXED_ROUTES.map((route) => route.path)).toEqual(['/', '/try', '/guide', '/guide/full', '/gallery'])
    for (const prefix of NOINDEX_PREFIXES) expect(metaFor(`${prefix}123`).index, prefix).toBe(false)
    expect(metaFor('/login').index).toBe(false)
    expect(metaFor('/nowhere')).toMatchObject({ index: false, title: expect.stringContaining('not found') })
    expect(metaFor('/guide/').title).toBe(seoRouteFor('/guide')!.title)
  })
})

describe('head tags', () => {
  const page = { title: 'Guide', description: 'Help', path: '/guide', index: true, image: '/og-image.png' }

  it('adds the canonical link, share picture and large card once the site address is known', () => {
    const tags = headTags(page, 'https://site.test')
    expect(tag(tags, 'canonical')!.attrs.href).toBe('https://site.test/guide')
    expect(tag(tags, 'og:image')!.attrs.content).toBe('https://site.test/og-image.png')
    expect(tag(tags, 'twitter:card')!.attrs.content).toBe('summary_large_image')
    expect(tag(tags, 'robots')!.attrs.content).toContain('index, follow')
  })

  it('leaves out what needs a full address, and says noindex for private screens', () => {
    const tags = headTags(page)
    expect(tag(tags, 'canonical')).toBeUndefined()
    expect(tag(tags, 'og:image')).toBeUndefined()
    expect(tag(tags, 'twitter:card')!.attrs.content).toBe('summary')
    const hidden = headTags({ ...page, index: false }, 'https://site.test')
    expect(tag(hidden, 'robots')!.attrs.content).toBe('noindex, nofollow')
    expect(tag(hidden, 'canonical')).toBeUndefined()
  })

  it('escapes text in static HTML and in structured data', () => {
    const html = tagsToHtml([...headTags({ ...page, title: 'A "quoted" <b> title' }), ...jsonLdTags([{ name: '</script><script>alert(1)' }])])
    expect(html).toContain('A &quot;quoted&quot; &lt;b&gt; title')
    expect(html).not.toContain('</script><script>')
    expect(html).toContain('data-seo="canonical"'.replace('canonical', 'description'))
  })
})

describe('structured data', () => {
  it('builds how-tos, breadcrumbs, questions and the product', () => {
    expect(howToLd('Do it', 'How', ['a', 'b']).step).toHaveLength(2)
    expect(breadcrumbLd('https://site.test', [['Home', '/'], ['Guide', '/guide']]).itemListElement[1]).toMatchObject({ position: 2, item: 'https://site.test/guide' })
    expect(faqLd([['Q?', 'A.']]).mainEntity[0]!.acceptedAnswer.text).toBe('A.')
    expect(softwareLd('')).toMatchObject({ '@type': 'SoftwareApplication', offers: { price: '0' } })
  })
})

describe('what the build writes', () => {
  it('makes a page per public screen with its own head and a no-script summary', () => {
    const route = seoRouteFor('/guide/full')!
    const html = renderRoutePage(TEMPLATE, route, 'https://site.test')
    expect(html.match(/<title/g)).toHaveLength(1)
    expect(html.match(/name="description"/g)).toHaveLength(1)
    expect(html).toContain(route.title)
    expect(html).not.toContain('>Old<')
    expect(html).toContain('https://site.test/guide/full')
    expect(html).toContain('<noscript>')
    expect(html).toContain('application/ld+json')
  })

  it('writes a sitemap of the public screens only, and robots.txt that names it', () => {
    const sitemap = buildSitemap('https://site.test', '2026-10-16')
    expect(sitemap.match(/<loc>/g)).toHaveLength(INDEXED_ROUTES.length)
    expect(sitemap).toContain('<loc>https://site.test/guide</loc>')
    expect(sitemap).not.toContain('/login')
    const robots = buildRobots('https://site.test')
    expect(robots).toContain('Sitemap: https://site.test/sitemap.xml')
    expect(robots).toContain('Disallow: /edit/')
    expect(robots).not.toContain('Disallow: /p/')
    expect(buildRobots('')).not.toContain('Sitemap')
  })
})

describe('the live page head', () => {
  it('replaces tags in place without doubling them, and removes the ones a screen does not have', () => {
    document.head.innerHTML = '<meta name="description" content="old"><title>Old</title>'
    applyTags(headTags({ title: 'One', description: 'First', path: '/a', index: true }, 'https://site.test'))
    expect(document.title).toBe('One')
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
    expect(document.querySelector('meta[name="description"]')!.getAttribute('content')).toBe('First')
    expect(document.querySelector('link[rel="canonical"]')).toBeTruthy()
    const remove = applyTags(headTags({ title: 'Two', description: 'Second', path: '/b', index: false }, 'https://site.test'))
    expect(document.title).toBe('Two')
    expect(document.querySelector('link[rel="canonical"]')).toBeNull() // noindex screens have none
    expect(document.querySelector('meta[name="robots"]')!.getAttribute('content')).toBe('noindex, nofollow')
    remove()
    expect(document.querySelector('meta[name="description"]')).toBeNull()
  })
})
