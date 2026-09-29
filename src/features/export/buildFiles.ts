import { escapeAttr } from '@/features/editor/model/serialize/escape'
import { scriptTag, type PageParts } from '@/features/editor/model/serialize/buildPage'
import type { PageScript } from '@/features/editor/model/types'

export type ExportFiles = Record<string, string>

const isInlineClassic = (script: PageScript) => !script.src && (!script.type || script.type === 'text/javascript')
const isInlineModule = (script: PageScript) => !script.src && script.type === 'module'

/** Joins inline scripts into one file, each part labelled so it's easy to find. */
function joinCode(scripts: PageScript[]): string {
  return scripts.map((script, index) => `// ---- script ${index + 1} ----\n${(script.code ?? '').trim()}\n`).join('\n')
}

/**
 * index.html + styles.css (+ script.js / module.js): what a developer expects.
 * External scripts and unusual script types (JSON data...) stay in the HTML.
 */
export function partsToSplitFiles(parts: PageParts): ExportFiles {
  const all = [...parts.headScripts, ...parts.bodyScripts]
  const classic = all.filter(isInlineClassic)
  const modules = all.filter(isInlineModule)
  const keep = (script: PageScript) => !isInlineClassic(script) && !isInlineModule(script)

  const files: ExportFiles = {}
  if (parts.css) files['styles.css'] = parts.css + '\n'
  if (classic.length) files['script.js'] = joinCode(classic)
  if (modules.length) files['module.js'] = joinCode(modules)

  files['index.html'] = [
    '<!doctype html>',
    `<html${parts.htmlAttrs}>`,
    '<head>',
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    `  <title>${parts.title.replace(/</g, '&lt;')}</title>`,
    ...parts.links.map((href) => `  <link rel="stylesheet" href="${escapeAttr(href)}">`),
    ...parts.headScripts.filter(keep).map((script) => `  ${scriptTag(script)}`),
    parts.css ? '  <link rel="stylesheet" href="styles.css">' : '',
    '</head>',
    `<body${parts.bodyAttrs}>`,
    parts.bodyHtml,
    ...parts.bodyScripts.filter(keep).map(scriptTag),
    classic.length ? '<script src="script.js"></script>' : '',
    modules.length ? '<script type="module" src="module.js"></script>' : '',
    '</body>',
    '</html>',
  ].filter(Boolean).join('\n') + '\n'
  return files
}
