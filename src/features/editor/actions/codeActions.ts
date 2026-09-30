import { parsePastedCode } from '../model/parse/parseDocument'
import { htmlToChildNodes } from '../model/parse/domToNodes'
import { splitSnippetAssets } from '../model/parse/snippetAssets'
import { docToEditableSource } from '../model/serialize/editableSource'
import { nodeToHtml } from '../model/serialize/nodeToHtml'
import { collectSubtreeIds, getElement, indexInParent } from '../model/tree/queries'
import { insertSubtree, removeNode } from '../model/tree/treeOps'
import { isElement, type NodeMap, type PageDoc } from '../model/types'
import { getDoc } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'
import { updateDoc } from './commit'

/**
 * Code the user can edit. For the page root: the WHOLE page source (head,
 * CSS, body, scripts). For a part: its HTML. Computer-view edits appear as style="…".
 */
export function editableHtml(id: string): string {
  const doc = getDoc()
  if (id === doc.rootId) return docToEditableSource(doc)
  return getElement(doc.nodes, id) ? nodeToHtml(doc.nodes, id, { forEditing: true }) : ''
}

/** Tablet/phone-only edits can't be written as HTML — applying code would drop them. */
export function hasScreenSizeEdits(id: string): boolean {
  const { nodes } = getDoc()
  return collectSubtreeIds(nodes, id).some((nodeId) => {
    const node = nodes[nodeId]
    return isElement(node) && Boolean(node.styles.tablet || node.styles.mobile)
  })
}

/** Replaces one element with whatever the new HTML contains (0, 1 or more elements). */
function replaceElement(nodes: NodeMap, id: string, html: string): { nodes: NodeMap; firstId: string | null } {
  const parentId = nodes[id]?.parentId
  if (!parentId) return { nodes, firstId: null }
  const index = indexInParent(nodes, id)
  const created: NodeMap = {}
  const ids = htmlToChildNodes(html, parentId, created)
  let next = removeNode(nodes, id)
  ids.forEach((newId, offset) => { next = insertSubtree(next, created, newId, parentId, index + offset) })
  return { nodes: next, firstId: ids.find((newId) => created[newId]?.kind === 'element') ?? null }
}

/** A part's new HTML; any <style>/<script> inside joins the page's CSS/JS. */
function applyToPart(doc: PageDoc, id: string, code: string): { doc: PageDoc; firstId: string | null } {
  const { html, css, scripts } = splitSnippetAssets(code)
  const result = replaceElement(doc.nodes, id, html)
  return {
    doc: {
      ...doc,
      nodes: result.nodes,
      css: css ? [doc.css, css].filter(Boolean).join('\n\n') : doc.css,
      scripts: scripts.length ? [...doc.scripts, ...scripts] : doc.scripts,
    },
    firstId: result.firstId,
  }
}

/**
 * Applies edited code as ONE undo step.
 * - Page root: the whole page is re-read, so HTML, CSS, JS, title and head
 *   tags all update together (the Styles/Script boxes follow).
 * - A part: that part is replaced and its <style>/<script> are added to the page.
 */
export function applyHtml(id: string, code: string) {
  const isPage = id === getDoc().rootId
  let firstId: string | null = null
  updateDoc((doc) => {
    if (isPage) return parsePastedCode({ html: code })
    const result = applyToPart(doc, id, code)
    firstId = result.firstId
    return result.doc
  })
  useSelectionStore.getState().select(isPage ? null : firstId)
}
