import { looksLikeHtml, type PastedCode } from '@/features/editor/model/parse/cleanPaste'
import { parsePastedCode } from '@/features/editor/model/parse/parseDocument'
import { isElement, type PageDoc } from '@/features/editor/model/types'

export type PasteSummary = {
  ok: boolean
  /** Friendly problem description when ok is false. */
  problem?: string
  doc?: PageDoc
  /** e.g. ["24 elements", "styles", "Tailwind", "2 scripts"] */
  found: string[]
  /** What kind of problem, for usage stats (no content). */
  reason?: 'not_code' | 'no_content'
  /** Counts for usage stats. */
  stats?: { elements: number; scripts: number; tailwind: boolean }
}

const usesTailwind = (doc: PageDoc) => doc.scripts.some((script) => script.src?.includes('tailwind'))

/** Checks pasted code and describes what we found, in plain words. */
export function analyzePaste(pasted: PastedCode): PasteSummary {
  if (!pasted.html.trim()) return { ok: false, found: [] }
  if (!looksLikeHtml(pasted.html)) {
    return {
      ok: false,
      found: [],
      reason: 'not_code',
      problem: "This doesn't look like web page code. Copy the part that starts with “<” (for example <!DOCTYPE html> or <div>).",
    }
  }

  const doc = parsePastedCode(pasted)
  const elements = Object.values(doc.nodes).filter(isElement).length - 1 // minus <body>
  if (elements < 1) return { ok: false, found: [], reason: 'no_content', problem: 'We found the code but no visible content in it.' }

  const found = [`${elements} element${elements === 1 ? '' : 's'}`]
  if (doc.css) found.push('styles')
  if (usesTailwind(doc)) found.push('Tailwind')
  if (doc.links.length) found.push(`${doc.links.length} font/style link${doc.links.length === 1 ? '' : 's'}`)
  const scripts = doc.scripts.filter((script) => !script.src?.includes('tailwind')).length
  if (scripts) found.push(`${scripts} script${scripts === 1 ? '' : 's'}`)
  return { ok: true, doc, found, stats: { elements, scripts, tailwind: usesTailwind(doc) } }
}
