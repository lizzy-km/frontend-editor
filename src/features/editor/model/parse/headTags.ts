import type { HeadTag } from '../types'
import { readAttributes } from './readHead'

/** Link types worth keeping. Stylesheets are handled separately (doc.links). */
const KEPT_LINK_RELS = ['preconnect', 'dns-prefetch', 'preload', 'icon', 'shortcut icon', 'apple-touch-icon', 'canonical']

function isKeptLink(link: Element): boolean {
  const rel = (link.getAttribute('rel') ?? '').toLowerCase().trim()
  return Boolean(link.getAttribute('href')) && KEPT_LINK_RELS.includes(rel)
}

/**
 * Meta tags except charset (the export writes its own) and http-equiv
 * (a "refresh" could send visitors elsewhere).
 */
function isKeptMeta(meta: Element): boolean {
  return !meta.hasAttribute('charset') && !meta.hasAttribute('http-equiv')
}

/** Safe <head> tags to carry through to the export. */
export function readHeadTags(doc: Document): HeadTag[] {
  const metas = [...doc.head.querySelectorAll('meta')].filter(isKeptMeta)
  const links = [...doc.head.querySelectorAll('link')].filter(isKeptLink)
  return [
    ...metas.map((meta) => ({ tag: 'meta' as const, attrs: readAttributes(meta) })),
    ...links.map((link) => ({ tag: 'link' as const, attrs: readAttributes(link) })),
  ]
}
