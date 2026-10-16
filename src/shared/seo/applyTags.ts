import type { HeadTag } from './headTags'

/** The tag already on the page: by its key, or the same kind of tag written by hand (the description in index.html). */
function findExisting(head: HTMLHeadElement, tag: HeadTag): Element | null {
  const byKey = head.querySelector(`[data-seo="${tag.key}"]`)
  if (byKey) return byKey
  if (tag.tag === 'title') return head.querySelector('title')
  const name = tag.attrs.name ?? tag.attrs.property
  if (tag.tag === 'meta' && name) return head.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
  if (tag.tag === 'link' && tag.attrs.rel === 'canonical') return head.querySelector('link[rel="canonical"]')
  return null
}

/**
 * Puts head tags on the live page. Each tag is found by data-seo="key" (the static HTML written at build time
 * carries the same keys), so nothing is ever doubled. Tags of an earlier screen that this one doesn't have are removed.
 * Returns a function that removes the tags again.
 */
export function applyTags(tags: HeadTag[], doc: Document = document): () => void {
  const head = doc.head
  const wanted = new Set(tags.map((tag) => tag.key))
  for (const old of Array.from(head.querySelectorAll('[data-seo]'))) {
    const key = old.getAttribute('data-seo') ?? ''
    if (!wanted.has(key) && !key.startsWith('page-')) old.remove() // page-* tags belong to a screen's own <JsonLd>
  }
  for (const tag of tags) {
    let element = findExisting(head, tag)
    if (!element) {
      element = doc.createElement(tag.tag)
      head.appendChild(element)
    }
    for (const name of Array.from(element.attributes).map((attr) => attr.name)) if (name !== 'data-seo') element.removeAttribute(name)
    for (const [name, value] of Object.entries(tag.attrs)) element.setAttribute(name, value)
    element.setAttribute('data-seo', tag.key)
    if (tag.text !== undefined && element.textContent !== tag.text) element.textContent = tag.text
  }
  return () => { for (const tag of tags) head.querySelector(`[data-seo="${tag.key}"]`)?.remove() }
}
