import type { Origin } from './componentViews'
import { getElement } from '@/features/editor/model/tree/queries'
import type { PageDoc } from '@/features/editor/model/types'
import type { ExportFiles } from '../buildFiles'
import { createNameRegistry } from './names'
import { projectShell, renderParts, type Parts } from './projectShell'
import { animationDeps, animationFiles } from './animationTemplates'
import { AUTH_DEPS, authFiles, needsAuth } from './auth/authFiles'
import { dataFiles, DATA_DEPS } from './dataTemplates'
import { popupUse } from '@/features/editor/model/popups'
import { formProject } from './forms/formTemplates'
import { popupFiles } from './popups/uiTemplates'
import { listUiFiles } from './listTemplates'
import { mainFile } from './mainTemplate'
import { DATA_README, readme } from './projectTemplates'

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
export function buildReactProject(fullDoc: PageDoc, onlyId?: string, origins?: Origin[]): ExportFiles {
  const doc = onlyId && onlyId !== fullDoc.rootId ? onlyPart(fullDoc, onlyId) : fullDoc
  const body = getElement(doc.nodes, doc.rootId)
  const sources = doc.data ?? []
  const parts = renderParts(doc.nodes, body?.children ?? [], createNameRegistry(), '      ', undefined, { base: '..', sources })
  const forms = formProject(doc.nodes)
  const shell = projectShell(doc, { ...forms.deps, ...(sources.length ? DATA_DEPS : {}), ...animationDeps(doc.nodes), ...(needsAuth(doc) ? AUTH_DEPS : {}) })
  const files: ExportFiles = {
    ...shell.files,
    'README.md': readme(doc.title, parts.names, shell.hasScripts) + (sources.length ? DATA_README : ''),
    ...dataFiles(sources),
    ...listUiFiles(doc),
    ...animationFiles(doc.nodes),
    ...forms.files,
    ...popupFiles(doc.nodes),
    ...authFiles(doc),
    'src/main.tsx': mainFile({ root: 'app', query: sources.length > 0, auth: needsAuth(doc), confirm: popupUse(doc.nodes).ask }),
    'src/App.tsx': appSource(parts),
  }
  for (const file of parts.files) {
    files[`src/components/${file.name}.tsx`] = file.code
    origins?.push({ path: `src/components/${file.name}.tsx`, name: file.name, ids: file.ids ?? [] })
  }
  return files
}
