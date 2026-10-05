import { escapeAttr } from '@/features/editor/model/serialize/escape'
import { scriptTag } from '@/features/editor/model/serialize/buildPage'
import { isElement, type NodeMap, type PageScript } from '@/features/editor/model/types'
import type { ScriptFile } from './runnerTemplate'

const isJs = (script: PageScript) => !script.type || script.type === 'text/javascript' || script.type === 'module'
const isModule = (script: PageScript) => script.type === 'module'

/** Where each of the page's scripts goes in the React project. */
export type ScriptPlan = {
  /** public/scripts/… files, run once after React has mounted. */
  files: Record<string, string>
  run: ScriptFile[]
  /** Tags that stay in index.html <head> (libraries, configs, JSON data). */
  head: string[]
  /** Tags at the end of index.html <body>, before the app (libraries, data). */
  body: string[]
}

/**
 * Inline page code needs the page on screen, so it moves to public/scripts and
 * runs after mount. Head classic scripts (library settings such as
 * tailwind.config) and every external library stay in index.html, where they were.
 */
export function planScripts(scripts: PageScript[]): ScriptPlan {
  const plan: ScriptPlan = { files: {}, run: [], head: [], body: [] }
  scripts.forEach((script) => {
    const inline = !script.src && isJs(script)
    const movesAfterMount = inline && (!script.inHead || isModule(script))
    if (!movesAfterMount) {
      ;(script.inHead ? plan.head : plan.body).push(scriptTag(script))
      return
    }
    const src = `scripts/${isModule(script) ? 'module' : 'page'}-${plan.run.length + 1}.js`
    plan.files[`public/${src}`] = `${(script.code ?? '').trim()}\n`
    plan.run.push({ src, module: isModule(script) })
  })
  return plan
}

/** Inline handler events used on the page (onclick -> "click"), for runPageScripts. */
export function handlerEvents(nodes: NodeMap): string[] {
  const events = new Set<string>()
  for (const node of Object.values(nodes)) {
    if (!isElement(node) || node.hidden) continue
    for (const name of Object.keys(node.attrs)) if (/^on[a-z]+$/i.test(name)) events.add(name.slice(2).toLowerCase())
  }
  return [...events].sort()
}

/** `<link rel="stylesheet">` lines for index.html. */
export const linkTags = (links: string[]) => links.map((href) => `<link rel="stylesheet" href="${escapeAttr(href)}">`)
