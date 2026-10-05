import type { PageDoc } from '../types'

/**
 * "/src/main.tsx", "css/style.css", "./app.js": files next to the original
 * page, which were not pasted. In the editor frame and Preview they would be
 * looked up on Tweak's own server instead, so they are left out there.
 * Full addresses (https://…, //cdn…, data:…) are kept.
 */
export const isLocalFile = (url: string) => !/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url.trim())

/** The linked scripts and stylesheets that are local files (for the paste note). */
export function localFiles(doc: PageDoc): string[] {
  const scripts = doc.scripts.flatMap((script) => (script.src && isLocalFile(script.src) ? [script.src] : []))
  return [...scripts, ...doc.links.filter(isLocalFile)]
}

/** The page without links to local files: what the editor frame and Preview show. */
export function withoutLocalFiles(doc: PageDoc): PageDoc {
  if (localFiles(doc).length === 0) return doc
  return {
    ...doc,
    scripts: doc.scripts.filter((script) => !(script.src && isLocalFile(script.src))),
    links: doc.links.filter((href) => !isLocalFile(href)),
  }
}
