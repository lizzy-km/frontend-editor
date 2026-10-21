import type { PageDoc } from '@/features/editor/model/types'
import { compileProject } from './compile'
import { crawlApp, type CrawlEvent } from './crawl'
import { detectReactApp, type Files } from './projectFiles'
import { crawlToDoc, titleOf } from './toDoc'

/** What the import is doing: reading the files, running the app (as a visitor, then signed in), visiting pages, building the site. */
export type ImportEvent = { kind: 'read' } | { kind: 'build' } | CrawlEvent

export type AppImport =
  | { ok: true; doc: PageDoc; pages: { path: string; title: string; private: boolean }[]; warnings: string[] }
  | { ok: false; message: string }

/** Is this a React project Tweak can try to open (it does not need to come from Tweak)? */
export const isReactApp = (files: Files) => detectReactApp(files).ok

/**
 * Opens a React project that Tweak did not make: runs it in a locked frame, visits its pages and turns them into a Tweak site.
 * Only the way the pages look and what they show carries over, not the app's own code (sign-in, data hooks, forms).
 */
export async function importReactApp(files: Files, onEvent: (event: ImportEvent) => void): Promise<AppImport> {
  onEvent({ kind: 'read' })
  const compiled = compileProject(files)
  if ('error' in compiled) return { ok: false, message: compiled.error }
  const detected = detectReactApp(files)
  if (!detected.ok) return { ok: false, message: detected.reason }
  try {
    const crawl = await crawlApp(compiled, detected.dependencies, onEvent)
    onEvent({ kind: 'build' })
    const doc = crawlToDoc(crawl, compiled.html)
    if (!doc) return { ok: false, message: crawl.warnings[0] ?? 'No page could be opened.' }
    return { ok: true, doc, pages: crawl.pages.map((page) => ({ path: page.pattern, title: titleOf(page), private: page.private })), warnings: [...compiled.warnings, ...crawl.warnings] }
  } catch (error) {
    return { ok: false, message: (error as Error).message }
  }
}
