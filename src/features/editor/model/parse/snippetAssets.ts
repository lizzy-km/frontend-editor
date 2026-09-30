import type { PageScript } from '../types'

export type SnippetParts = { html: string; css: string; scripts: PageScript[] }

/**
 * AI answers often ship a section with its own <style> and <script>.
 * Splits those out of an HTML snippet so they can join the page's CSS and JS
 * (instead of being dropped). <template> content is inert: nothing runs here.
 */
export function splitSnippetAssets(snippet: string): SnippetParts {
  const template = document.createElement('template')
  template.innerHTML = snippet
  const styles = [...template.content.querySelectorAll('style')]
  const scripts = [...template.content.querySelectorAll('script')]

  const css = styles.map((style) => style.textContent ?? '').join('\n\n').trim()
  const found: PageScript[] = scripts.map((script) => ({
    src: script.getAttribute('src') ?? undefined,
    code: script.getAttribute('src') ? undefined : script.textContent ?? '',
    type: script.getAttribute('type') ?? undefined,
    inHead: false,
  }))
  for (const element of [...styles, ...scripts]) element.remove()
  return { html: template.innerHTML, css, scripts: found }
}
