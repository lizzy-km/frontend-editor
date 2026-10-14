import { getElement } from '@/features/editor/model/tree/queries'
import type { PageDoc } from '@/features/editor/model/types'
import type { ExportFiles } from '../buildFiles'
import { createNameRegistry } from './names'
import { projectShell, renderParts, type Parts } from './projectShell'
import { MAIN_TSX, readme } from './projectTemplates'

function appSource(parts: Parts): string {
  return [
    "import { useEffect } from 'react'",
    ...parts.names.map((name) => `import ${name} from './components/${name}'`),
    "import { runPageScripts } from './runPageScripts'",
    '',
    '/** The whole page, part by part, in order. */',
    'export default function App() {',
    '  useEffect(() => runPageScripts(), [])',
    '  return (', '    <>', ...parts.jsx, '    </>', '  )', '}', '',
  ].join('\n')
}

/** Only one part of the page: the same page with just that part inside <body>. */
function onlyPart(doc: PageDoc, id: string): PageDoc {
  const body = getElement(doc.nodes, doc.rootId)
  return body && doc.nodes[id] ? { ...doc, nodes: { ...doc.nodes, [body.id]: { ...body, children: [id] } } } : doc
}

/** A one-page document (or one part of a page) as a Vite + React + TypeScript project: path -> file text. */
export function buildReactProject(fullDoc: PageDoc, onlyId?: string): ExportFiles {
  const doc = onlyId && onlyId !== fullDoc.rootId ? onlyPart(fullDoc, onlyId) : fullDoc
  const body = getElement(doc.nodes, doc.rootId)
  const parts = renderParts(doc.nodes, body?.children ?? [], createNameRegistry(), '      ')
  const shell = projectShell(doc)
  const files: ExportFiles = {
    ...shell.files,
    'README.md': readme(doc.title, parts.names, shell.hasScripts),
    'src/main.tsx': MAIN_TSX,
    'src/App.tsx': appSource(parts),
  }
  for (const file of parts.files) files[`src/components/${file.name}.tsx`] = file.code
  return files
}
