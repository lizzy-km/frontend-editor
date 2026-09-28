import type { NodeMap, PageDoc } from '../types'
import { combinePastedCode, type PastedCode } from './cleanPaste'
import { elementToNodes } from './domToNodes'
import { extractPageExtras } from './readHead'

/**
 * The one entry point for importing code: pasted pieces in, editable page out.
 * The browser's own HTML parser does the heavy lifting, so broken or messy AI
 * output is repaired the same way a browser would repair it.
 */
export function parsePastedCode(pasted: PastedCode): PageDoc {
  return parseHtmlDocument(combinePastedCode(pasted))
}

export function parseHtmlDocument(html: string): PageDoc {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const extras = extractPageExtras(doc)
  const nodes: NodeMap = {}
  const rootId = elementToNodes(doc.body, null, nodes)

  return { ...extras, title: extras.title || 'Untitled page', rootId, nodes }
}

/** A blank page to start from. */
export function createEmptyDoc(): PageDoc {
  return parseHtmlDocument('<!doctype html><html><body></body></html>')
}
