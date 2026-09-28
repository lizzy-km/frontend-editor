/**
 * AI chat answers wrap code in ```html fences and often add chatter around it.
 * This pulls out just the code so people can paste the whole reply.
 */
export function stripCodeFences(input: string): string {
  const fences = [...input.matchAll(/```[\w-]*\s*\n([\s\S]*?)```/g)]
  if (fences.length === 0) return input.trim()
  return fences.map((match) => match[1] ?? '').join('\n').trim()
}

/** Pieces a user can paste. HTML is required, CSS and JS are optional. */
export type PastedCode = { html: string; css?: string; js?: string }

/**
 * Turns the pasted pieces into one full HTML document string, so the rest of
 * the app only ever has to handle one shape of input.
 */
export function combinePastedCode({ html, css = '', js = '' }: PastedCode): string {
  const cleanHtml = stripCodeFences(html)
  const cleanCss = stripCodeFences(css)
  const cleanJs = stripCodeFences(js)
  const isFullDocument = /<html[\s>]|<body[\s>]|<!doctype/i.test(cleanHtml)

  const document = isFullDocument ? cleanHtml : `<!doctype html><html><head></head><body>${cleanHtml}</body></html>`
  const extras = (cleanCss ? `<style>${cleanCss}</style>` : '') + (cleanJs ? `<script>${cleanJs}</script>` : '')
  if (!extras) return document

  // The parser collects every <style>/<script> wherever it sits, so the end of <body> is fine.
  return /<\/body>/i.test(document) ? document.replace(/<\/body>/i, `${extras}</body>`) : document + extras
}

/** Quick sanity check so we can give a friendly message instead of an empty page. */
export function looksLikeHtml(input: string): boolean {
  return /<[a-z][\s\S]*>/i.test(stripCodeFences(input))
}
