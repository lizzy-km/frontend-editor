import { buildPageParts } from '@/features/editor/model/serialize/buildPage'
import { styleClassFor } from '@/features/editor/model/serialize/nodeToHtml'
import { getElement } from '@/features/editor/model/tree/queries'
import { isElement, type ElementNode, type PageDoc } from '@/features/editor/model/types'
import { toFileName } from '@/lib/download'
import type { ExportFiles } from '../buildFiles'
import { partComponent, type ComponentFile } from './componentFiles'
import { openTag, visibleChildren, type JsxContext } from './jsxWriter'
import { createNameRegistry, describeName } from './names'
import { handlerEvents, linkTags, planScripts } from './pageScripts'
import { GITIGNORE, MAIN_TSX, packageJson, readme, TSCONFIG, VITE_CONFIG } from './projectTemplates'
import { runnerSource } from './runnerTemplate'

/** The class an element gets in the export: its own plus the edit class (.fe-<id>). */
const classFor = (node: ElementNode) => [node.attrs.class, styleClassFor(node)].filter(Boolean).join(' ') || undefined

/**
 * The page's CSS for React: unchanged, except that the app lives in <div id="root">,
 * so "body > x" rules are pointed through it and the root itself takes no space.
 */
const reactCss = (css: string) => `${css.replace(/\bbody\s*>/g, 'body > #root >')}\n\n/* React mounts the page in #root */\n#root { display: contents; }\n`

/** Header, each section and the footer become components; <main> stays in App with its sections inside. */
function splitPage(doc: PageDoc) {
  const nodes = doc.nodes
  const body = getElement(nodes, doc.rootId)
  const takeName = createNameRegistry()
  const ctx: JsxContext = { nodes, classFor }
  const files: ComponentFile[] = []
  const order: string[] = []
  const jsx: string[] = []

  const addPart = (id: string, pad: string) => {
    const name = takeName(describeName(nodes[id] as ElementNode))
    const made = partComponent(nodes, classFor, id, name, takeName)
    files.push(...made)
    order.push(name)
    jsx.push(`${pad}<${name} />`)
  }
  const meaningful = (ids: string[]) => ids.filter((id) => isElement(nodes[id]))

  for (const id of body ? meaningful(visibleChildren(nodes, body)) : []) {
    const node = nodes[id] as ElementNode
    const inner = meaningful(visibleChildren(nodes, node))
    if (node.tag !== 'main' || inner.length === 0) {
      addPart(id, '      ')
      continue
    }
    jsx.push(`      ${openTag(ctx, node)}`)
    inner.forEach((child) => addPart(child, '        '))
    jsx.push('      </main>')
  }
  return { files, order, jsx }
}

function appSource(parts: ReturnType<typeof splitPage>): string {
  const own = new Set(parts.order)
  return [
    "import { useEffect } from 'react'",
    ...parts.files.filter((file) => own.has(file.name)).map((file) => `import ${file.name} from './components/${file.name}'`),
    "import { runPageScripts } from './runPageScripts'",
    '',
    '/** The whole page, part by part, in order. */',
    'export default function App() {',
    '  useEffect(() => runPageScripts(), [])',
    '  return (', '    <>', ...parts.jsx, '    </>', '  )', '}', '',
  ].join('\n')
}

/** The page as a Vite + React + TypeScript project: path -> file text. */
export function buildReactProject(doc: PageDoc): ExportFiles {
  const page = buildPageParts(doc)
  const parts = splitPage(doc)
  const scripts = planScripts([...page.headScripts, ...page.bodyScripts])
  const indexHtml = [
    '<!doctype html>', `<html${page.htmlAttrs}>`, '<head>', '<meta charset="utf-8">', ...page.headTags,
    `<title>${page.title.replace(/</g, '&lt;')}</title>`, ...linkTags(page.links), ...scripts.head, '</head>',
    `<body${page.bodyAttrs}>`, '<div id="root"></div>', ...scripts.body,
    '<script type="module" src="/src/main.tsx"></script>', '</body>', '</html>', '',
  ].join('\n')

  const files: ExportFiles = {
    'package.json': packageJson(toFileName(page.title)),
    'tsconfig.json': TSCONFIG,
    'vite.config.ts': VITE_CONFIG,
    '.gitignore': GITIGNORE,
    'README.md': readme(page.title, parts.order, scripts.run.length > 0),
    'index.html': indexHtml,
    'src/main.tsx': MAIN_TSX,
    'src/App.tsx': appSource(parts),
    'src/runPageScripts.ts': runnerSource(scripts.run, handlerEvents(doc.nodes)),
    'src/styles/page.css': reactCss(page.css),
    ...scripts.files,
  }
  for (const file of parts.files) files[`src/components/${file.name}.tsx`] = file.code
  return files
}
