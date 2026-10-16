import { looksLikeHtml, stripCodeFences, type PastedCode } from './parse/cleanPaste'
import { parsePastedCode } from './parse/parseDocument'
import { getElement } from './tree/queries'
import { insertSubtree } from './tree/treeOps'
import { isElement, type PageDoc } from './types'

/**
 * "Paste more code" in the Add panel: HTML (a section or a whole page), CSS and JavaScript, any one of them or all three.
 * The HTML goes into the page where Add would put it; the styles, stylesheet links and scripts are merged into the page.
 */
export type AddCodeResult = { ok: true; doc: PageDoc; firstId: string | null; found: string[] } | { ok: false; problem: string }

const same = (a: PageDoc['scripts'][number], b: PageDoc['scripts'][number]) => (a.src ? a.src === b.src : (a.code ?? '').trim() === (b.code ?? '').trim())

/** `single`: the HTML must end up as ONE top box (a component): several top boxes are wrapped in a new box. */
export function addCodeToDoc(doc: PageDoc, parts: PastedCode, target: { parentId: string; index?: number }, single = false): AddCodeResult {
  let html = stripCodeFences(parts.html)
  const css = stripCodeFences(parts.css ?? '')
  const js = stripCodeFences(parts.js ?? '')
  if (!html && !css && !js) return { ok: false, problem: 'Paste some HTML, CSS or JavaScript first.' }
  if (html && !looksLikeHtml(html)) return { ok: false, problem: 'The HTML box doesn’t look like web page code. It should start with “<”, like <section> or <div>.' }

  if (single && html && looksLikeHtml(html)) {
    const probe = parsePastedCode({ html })
    if ((getElement(probe.nodes, probe.rootId)?.children ?? []).filter((id) => isElement(probe.nodes[id])).length > 1) html = `<div>${html}</div>`
  }
  const pasted = parsePastedCode({ html, css, js })
  const body = getElement(pasted.nodes, pasted.rootId)
  const created = { ...pasted.nodes }
  const ids = (body?.children ?? []).filter((id) => pasted.nodes[id])
  let nodes = doc.nodes
  ids.forEach((id, offset) => { nodes = insertSubtree(nodes, created, id, target.parentId, target.index === undefined ? undefined : target.index + offset) })

  const styles = pasted.css.trim()
  const next: PageDoc = {
    ...doc,
    nodes,
    css: styles && !doc.css.includes(styles) ? `${doc.css.trimEnd()}\n\n/* Added code */\n${styles}\n` : doc.css,
    links: [...new Set([...doc.links, ...pasted.links])],
    scripts: [...doc.scripts, ...pasted.scripts.filter((script) => !doc.scripts.some((have) => same(have, script)))],
  }
  const elements = Object.values(pasted.nodes).filter(isElement).length - 1 // minus <body>
  const found = [elements ? `${elements} piece${elements === 1 ? '' : 's'} of the page` : '', styles ? 'styles' : '', pasted.scripts.length ? `${pasted.scripts.length} script${pasted.scripts.length === 1 ? '' : 's'}` : ''].filter(Boolean)
  return { ok: true, doc: next, firstId: ids.find((id) => isElement(pasted.nodes[id])) ?? null, found }
}
