import { useEffect } from 'react'
import { SITE_URL } from '@/config/seo.config'
import { applyTags } from './applyTags'
import { headTags, jsonLdTags, type SeoMeta } from './headTags'

/**
 * Sets the page head (title, description, share tags, noindex…) for a screen while it is shown, and optional
 * structured data. Renders nothing. The router's RouteSeo already covers every known address; use this for
 * a screen whose words depend on its content (a shared page's name).
 */
export function Seo({ meta, ld }: { meta: SeoMeta; ld?: object[] }) {
  const json = JSON.stringify(ld ?? [])
  useEffect(() => applyTags([...headTags(meta, SITE_URL), ...jsonLdTags(JSON.parse(json) as object[])]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [meta.title, meta.description, meta.path, meta.index, meta.image, meta.type, json])
  return null
}

/** Structured data only (JSON-LD), for a screen whose head is already set by the router. */
export function JsonLd({ data }: { data: object[] }) {
  const json = JSON.stringify(data)
  useEffect(() => {
    const tags = jsonLdTags(JSON.parse(json) as object[])
    const added = tags.map((tag) => {
      const element = document.createElement('script')
      element.type = 'application/ld+json'
      element.setAttribute('data-seo', `page-${tag.key}`)
      element.textContent = tag.text ?? ''
      document.head.appendChild(element)
      return element
    })
    return () => added.forEach((element) => element.remove())
  }, [json])
  return null
}
