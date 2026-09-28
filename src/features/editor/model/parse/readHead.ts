import type { PageScript } from '../types'

export type PageExtras = {
  title: string
  htmlAttrs: Record<string, string>
  css: string
  links: string[]
  scripts: PageScript[]
}

/** Collects attributes of an element into a plain object. */
export function readAttributes(element: Element, skip: string[] = []): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const attr of element.attributes) {
    if (!skip.includes(attr.name)) attrs[attr.name] = attr.value
  }
  return attrs
}

function readScript(script: HTMLScriptElement, head: HTMLHeadElement): PageScript {
  return {
    src: script.getAttribute('src') ?? undefined,
    code: script.getAttribute('src') ? undefined : script.textContent ?? '',
    type: script.getAttribute('type') ?? undefined,
    inHead: head.contains(script),
  }
}

/**
 * Pulls everything that is not visible content out of the document:
 * title, CSS, stylesheet links and scripts. They are removed from the DOM so
 * only real content is left for the node tree.
 */
export function extractPageExtras(doc: Document): PageExtras {
  const styles = [...doc.querySelectorAll('style')]
  const links = [...doc.querySelectorAll<HTMLLinkElement>('link[rel~="stylesheet"][href]')]
  const scripts = [...doc.querySelectorAll('script')]

  const extras: PageExtras = {
    title: doc.title,
    htmlAttrs: readAttributes(doc.documentElement),
    css: styles.map((style) => style.textContent ?? '').join('\n\n').trim(),
    links: links.map((link) => link.getAttribute('href') ?? ''),
    scripts: scripts.map((script) => readScript(script, doc.head)),
  }

  for (const element of [...styles, ...links, ...scripts]) element.remove()
  return extras
}
