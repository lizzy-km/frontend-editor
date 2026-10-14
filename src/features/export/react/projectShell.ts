import { buildPageParts } from '@/features/editor/model/serialize/buildPage'
import { styleClassFor } from '@/features/editor/model/serialize/nodeToHtml'
import { isElement, type ElementNode, type NodeMap, type PageDoc } from '@/features/editor/model/types'
import { toFileName } from '@/lib/download'
import type { ExportFiles } from '../buildFiles'
import { partComponent, type ComponentFile, type RouterLinks } from './componentFiles'
import type { ListOptions } from './listTemplates'
import { closeTag, openTag, visibleChildren, type JsxContext } from './jsxWriter'
import { describeName } from './names'
import { handlerEvents, linkTags, planScripts } from './pageScripts'
import { GITIGNORE, packageJson, TSCONFIG, VITE_CONFIG } from './projectTemplates'
import { runnerSource } from './runnerTemplate'

/** The class an element gets in the export: its own plus the edit class (.fe-<id>). */
export const classFor = (node: ElementNode) => [node.attrs.class, styleClassFor(node)].filter(Boolean).join(' ') || undefined

/**
 * The page's CSS for React: unchanged, except that the app lives in <div id="root">,
 * so "body > x" rules are pointed through it and the root itself takes no space.
 */
const reactCss = (css: string) => `${css.replace(/\bbody\s*>/g, 'body > #root >')}\n\n/* React mounts the page in #root */\n#root { display: contents; }\n`

type TakeName = (wanted: string, alternative?: string) => string
export type Parts = { files: ComponentFile[]; names: string[]; jsx: string[] }

/** Each part (header, a section…) becomes a component; a <main> stays as it is with its sections inside. */
export function renderParts(nodes: NodeMap, ids: string[], takeName: TakeName, pad: string, router?: RouterLinks, data?: ListOptions): Parts {
  const parts: Parts = { files: [], names: [], jsx: [] }
  const ctx: JsxContext = { nodes, classFor }
  const elements = (list: string[]) => list.filter((id) => isElement(nodes[id]) && !(nodes[id] as ElementNode).hidden)
  const add = (id: string, indent: string) => {
    const name = takeName(describeName(nodes[id] as ElementNode))
    parts.files.push(...partComponent(nodes, classFor, id, name, takeName, router, data))
    parts.names.push(name)
    parts.jsx.push(`${indent}<${name} />`)
  }
  for (const id of elements(ids)) {
    const node = nodes[id] as ElementNode
    const inner = elements(visibleChildren(nodes, node))
    if (node.tag !== 'main' || inner.length === 0) add(id, pad)
    else {
      parts.jsx.push(`${pad}${openTag(ctx, node)}`)
      inner.forEach((child) => add(child, `${pad}  `))
      parts.jsx.push(`${pad}${closeTag(ctx, node)}`)
    }
  }
  return parts
}

/**
 * Everything around the components: package.json, configs, index.html, the
 * page's CSS and its own scripts (public/scripts, run after mount).
 */
export function projectShell(doc: PageDoc, extraDeps: Record<string, string> = {}): { files: ExportFiles; hasScripts: boolean } {
  const page = buildPageParts(doc)
  const scripts = planScripts([...page.headScripts, ...page.bodyScripts])
  const indexHtml = [
    '<!doctype html>', `<html${page.htmlAttrs}>`, '<head>', '<meta charset="utf-8">', ...page.headTags,
    `<title>${page.title.replace(/</g, '&lt;')}</title>`, ...linkTags(page.links), ...scripts.head, '</head>',
    `<body${page.bodyAttrs}>`, '<div id="root"></div>', ...scripts.body,
    '<script type="module" src="/src/main.tsx"></script>', '</body>', '</html>', '',
  ].join('\n')
  const files: ExportFiles = {
    'package.json': packageJson(toFileName(page.title), extraDeps),
    'tsconfig.json': TSCONFIG,
    'vite.config.ts': VITE_CONFIG,
    '.gitignore': GITIGNORE,
    'index.html': indexHtml,
    'src/runPageScripts.ts': runnerSource(scripts.run, handlerEvents(doc.nodes)),
    'src/styles/page.css': reactCss(page.css),
    ...scripts.files,
  }
  return { files, hasScripts: scripts.run.length > 0 }
}
