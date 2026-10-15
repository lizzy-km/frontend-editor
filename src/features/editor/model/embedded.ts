import { isElement, type PageDoc, type StyleMap } from './types'

/** Pictures pasted INSIDE the code (data:image/png;base64,…): they make a page too big to save. */
const DATA_URI = /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g

const uris = (text: string | undefined) => text?.match(DATA_URI) ?? []

/** Every embedded picture of the page, once each (attributes, styles, the page CSS). */
export function embeddedPictures(doc: PageDoc): string[] {
  const found = new Set<string>(uris(doc.css))
  for (const node of Object.values(doc.nodes)) {
    if (!isElement(node)) continue
    Object.values(node.attrs).forEach((value) => uris(value).forEach((uri) => found.add(uri)))
    for (const map of Object.values(node.styles)) Object.values(map ?? {}).forEach((value) => uris(value).forEach((uri) => found.add(uri)))
  }
  return [...found]
}

const swap = (text: string, map: Record<string, string>) => text.replace(DATA_URI, (uri) => map[uri] ?? uri)

/** The page with embedded pictures replaced by the addresses in `map` (data URI -> address). Untouched nodes keep their identity. */
export function replaceEmbedded(doc: PageDoc, map: Record<string, string>): PageDoc {
  const nodes = { ...doc.nodes }
  for (const node of Object.values(doc.nodes)) {
    if (!isElement(node)) continue
    const attrs = Object.fromEntries(Object.entries(node.attrs).map(([name, value]) => [name, swap(value, map)]))
    const styles = Object.fromEntries(Object.entries(node.styles).map(([size, values]) => [size, Object.fromEntries(Object.entries(values ?? {}).map(([name, value]) => [name, swap(value, map)])) as StyleMap]))
    const changed = JSON.stringify(attrs) !== JSON.stringify(node.attrs) || JSON.stringify(styles) !== JSON.stringify(node.styles)
    if (changed) nodes[node.id] = { ...node, attrs, styles }
  }
  return { ...doc, nodes, css: swap(doc.css, map) }
}

export type SizeReport = { total: number; pictures: number; css: number; scripts: number; data: number }

/** What the saved page is made of (characters): pictures inside the code, styles, scripts, data rows. */
export function sizeReport(doc: PageDoc): SizeReport {
  const pictures = embeddedPictures(doc).reduce((sum, uri) => sum + uri.length, 0)
  return {
    total: JSON.stringify(doc).length, pictures, css: doc.css.length,
    scripts: doc.scripts.reduce((sum, script) => sum + (script.code?.length ?? 0), 0),
    data: JSON.stringify(doc.data ?? []).length,
  }
}

const mb = (chars: number) => `${(chars / 1_000_000).toFixed(1)} MB`

/** A plain-words reason and what to do, from what the page is made of. */
export function tooBigAdvice(report: SizeReport): string {
  const parts = [
    { size: report.pictures, text: `Pictures pasted inside the code take about ${mb(report.pictures)}. Use “Move pictures out of the code”, or give each picture as a link.` },
    { size: report.data, text: `The data (sample items) takes about ${mb(report.data)}. Remove rows you don’t need in the Data tab.` },
    { size: report.css, text: `The styles take about ${mb(report.css)}. Remove CSS you don’t use in the Code tab.` },
    { size: report.scripts, text: `The scripts take about ${mb(report.scripts)}. Remove what you don’t use in the Code tab.` },
  ].sort((a, b) => b.size - a.size)
  return parts[0]!.size > 0 ? parts[0]!.text : 'The page has too much content for one saved page.'
}
