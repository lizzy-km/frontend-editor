import type { PageDoc } from '@/features/editor/model/types'
import type { ExportFiles } from '../buildFiles'

/**
 * Every React download carries a hidden `.tweak/project.json`: the page as Tweak
 * sees it, plus a fingerprint of each generated file. Uploading the project (or
 * its .zip) again restores the page exactly, and the fingerprints tell which
 * files were changed outside Tweak.
 */
export const SNAPSHOT_PATH = '.tweak/project.json'
const FORMAT = 'tweak-project'
const VERSION = 1

type Snapshot = { format: typeof FORMAT; version: number; doc: PageDoc; files: Record<string, string> }

/** Same text on Windows and Mac: line endings never count as a change. */
const normal = (text: string) => text.replace(/\r\n/g, '\n')

/** A short fingerprint (FNV-1a) of a file's text. */
export function fingerprint(text: string): string {
  let hash = 0x811c9dc5
  for (const char of normal(text)) {
    hash ^= char.codePointAt(0)!
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

/** The generated files plus the hidden snapshot that lets Tweak reopen them. */
export function withSnapshot(files: ExportFiles, doc: PageDoc): ExportFiles {
  const prints = Object.fromEntries(Object.entries(files).map(([path, text]) => [path, fingerprint(text)]))
  const snapshot: Snapshot = { format: FORMAT, version: VERSION, doc, files: prints }
  return { ...files, [SNAPSHOT_PATH]: JSON.stringify(snapshot) }
}

export type Reopened = { ok: true; doc: PageDoc; changed: string[] } | { ok: false; problem: string }

const NOT_FROM_TWEAK = 'This folder wasn’t downloaded from Tweak, so it can’t be opened here. Tweak can reopen the React projects it made (keep the hidden “.tweak” folder inside).'

const isDoc = (value: unknown): value is PageDoc => {
  const doc = value as PageDoc | undefined
  return !!doc && typeof doc.rootId === 'string' && !!doc.nodes && !!doc.nodes[doc.rootId] && typeof doc.css === 'string'
}

/** Reads the snapshot out of a project's files (path -> text) and lists the files changed since the download. */
export function readSnapshot(files: ExportFiles): Reopened {
  const raw = files[SNAPSHOT_PATH]
  if (!raw) return { ok: false, problem: NOT_FROM_TWEAK }
  let snapshot: Partial<Snapshot>
  try { snapshot = JSON.parse(raw) as Partial<Snapshot> } catch { return { ok: false, problem: 'The hidden “.tweak” file is damaged, so this project can’t be opened.' } }
  if (snapshot.format !== FORMAT || !isDoc(snapshot.doc)) return { ok: false, problem: NOT_FROM_TWEAK }
  if ((snapshot.version ?? 0) > VERSION) return { ok: false, problem: 'This project was made with a newer Tweak. Refresh the page and try again.' }
  const changed = Object.entries(snapshot.files ?? {})
    .filter(([path, print]) => files[path] === undefined || fingerprint(files[path]) !== print)
    .map(([path]) => path)
  return { ok: true, doc: snapshot.doc, changed }
}
