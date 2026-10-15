/** The one-item address split around its :id ("https://x.com/users/:id" -> before "https://x.com/users/", after ""). */
export function itemParts(url: string | undefined): { before: string; after: string } | null {
  const match = url ? /\/:[A-Za-z_]\w*/.exec(url.replace(/^[a-z]+:\/\/[^/]*/i, '')) : null
  if (!url || !match) return null
  const start = url.length - url.replace(/^[a-z]+:\/\/[^/]*/i, '').length + match.index + 1
  return { before: url.slice(0, start), after: url.slice(start + match[0].length - 1) }
}
