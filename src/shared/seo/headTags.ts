/**
 * The tags a screen puts in <head>, as plain data: the running app applies them to the live page, and the
 * build writes them into the static HTML of each public screen. No imports: the build reads this file directly.
 */
export type SeoMeta = {
  title: string
  description: string
  /** The address of this screen, e.g. "/guide" (for the canonical link and sharing). */
  path: string
  index: boolean
  /** Share picture: an address on this site ("/og-image.png") or a full address. */
  image?: string
  type?: 'website' | 'article'
}

/** One element of <head>. `key` lets the live page find and replace it (data-seo="key"). */
export type HeadTag = { key: string; tag: 'title' | 'meta' | 'link' | 'script'; attrs: Record<string, string>; text?: string }

export const absolute = (siteUrl: string, address: string) => (/^https?:\/\//i.test(address) ? address : `${siteUrl}${address.startsWith('/') ? '' : '/'}${address}`)

const meta = (key: string, attr: 'name' | 'property', name: string, content: string): HeadTag => ({ key, tag: 'meta', attrs: { [attr]: name, content } })

/** Title, description, robots, canonical, Open Graph and Twitter tags. Absolute addresses need `siteUrl` (without it they are left out). */
export function headTags(info: SeoMeta, siteUrl = ''): HeadTag[] {
  const url = siteUrl && info.index ? absolute(siteUrl, info.path) : ''
  const image = siteUrl && info.image ? absolute(siteUrl, info.image) : ''
  return [
    { key: 'title', tag: 'title', attrs: {}, text: info.title },
    meta('description', 'name', 'description', info.description),
    meta('robots', 'name', 'robots', info.index ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'),
    ...(url ? [{ key: 'canonical', tag: 'link' as const, attrs: { rel: 'canonical', href: url } }] : []),
    meta('og:title', 'property', 'og:title', info.title),
    meta('og:description', 'property', 'og:description', info.description),
    meta('og:type', 'property', 'og:type', info.type ?? 'website'),
    meta('og:site_name', 'property', 'og:site_name', 'Tweak'),
    meta('og:locale', 'property', 'og:locale', 'en_US'),
    ...(url ? [meta('og:url', 'property', 'og:url', url)] : []),
    ...(image ? [meta('og:image', 'property', 'og:image', image), meta('og:image:width', 'property', 'og:image:width', '1200'), meta('og:image:height', 'property', 'og:image:height', '630'), meta('og:image:alt', 'property', 'og:image:alt', 'Tweak: build websites by clicking')] : []),
    meta('twitter:card', 'name', 'twitter:card', image ? 'summary_large_image' : 'summary'),
    meta('twitter:title', 'name', 'twitter:title', info.title),
    meta('twitter:description', 'name', 'twitter:description', info.description),
    ...(image ? [meta('twitter:image', 'name', 'twitter:image', image)] : []),
  ]
}

/** Structured data (JSON-LD) as head tags; `<` is escaped so the data can never close the script early. */
export const jsonLdTags = (items: object[]): HeadTag[] =>
  items.map((item, index) => ({ key: `ld-${index}`, tag: 'script', attrs: { type: 'application/ld+json' }, text: JSON.stringify(item).replace(/</g, '\\u003c') }))

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** The tags as HTML text (static pages). Each carries data-seo so the live page can replace it without doubling. */
export function tagsToHtml(tags: HeadTag[]): string {
  return tags.map((tag) => {
    const attrs = Object.entries({ ...tag.attrs, 'data-seo': tag.key }).map(([name, value]) => ` ${name}="${escapeHtml(value)}"`).join('')
    if (tag.tag === 'title') return `<title${attrs}>${escapeHtml(tag.text ?? '')}</title>`
    if (tag.tag === 'script') return `<script${attrs}>${tag.text ?? ''}</script>`
    return `<${tag.tag}${attrs} />`
  }).join('\n    ')
}
