import { strFromU8, Unzip, UnzipInflate } from 'fflate'
import type { ExportFiles } from '@/features/export/buildFiles'

const MAX_FILE_BYTES = 8 * 1024 * 1024
/** Never needed to reopen a project, and often huge. */
const SKIPPED = /(^|\/)(node_modules|\.git|dist|build)\//
const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|eot|mp4|webm|mp3|zip|gz|pdf)$/i

const wanted = (path: string) => !SKIPPED.test(path) && !BINARY.test(path)

/** Drops the folder every path starts with ("my-site-react/…"), so paths match the project's own. */
function withoutTopFolder(files: ExportFiles, force: boolean): ExportFiles {
  const paths = Object.keys(files)
  const top = paths[0]?.split('/')[0]
  const shared = !!top && paths.every((path) => path.startsWith(`${top}/`))
  if (!shared || (!force && '.tweak/project.json' in files)) return files
  return Object.fromEntries(paths.map((path) => [path.slice(top.length + 1), files[path]!]))
}

/**
 * The text files of a .zip (a React download), by path. It is read as a stream and files we don't
 * need (node_modules, .git, dist, pictures…) are never opened, so a zip that still contains
 * node_modules loads as fast as a clean one.
 */
export async function readZip(file: File): Promise<ExportFiles> {
  const found: Record<string, Uint8Array[]> = {}
  let failure: Error | null = null
  const unzip = new Unzip((entry) => {
    if (entry.name.endsWith('/') || !wanted(entry.name)) return
    const chunks: Uint8Array[] = []
    let size = 0
    entry.ondata = (error, chunk, last) => {
      if (error) { failure = error; return }
      size += chunk.length
      if (size > MAX_FILE_BYTES) { failure = new Error(`“${entry.name}” is too big to be part of a Tweak project.`); entry.terminate(); return }
      chunks.push(chunk)
      if (last) found[entry.name] = chunks
    }
    entry.start()
  })
  unzip.register(UnzipInflate)
  const reader = file.stream().getReader()
  for (;;) {
    const { done, value } = await reader.read()
    unzip.push(value ?? new Uint8Array(0), done)
    if (failure) throw failure
    if (done) break
  }
  const text = (chunks: Uint8Array[]) => {
    const joined = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0))
    let at = 0
    for (const chunk of chunks) { joined.set(chunk, at); at += chunk.length }
    return strFromU8(joined)
  }
  return withoutTopFolder(Object.fromEntries(Object.entries(found).map(([path, chunks]) => [path, text(chunks)])), false)
}

/** The text files of a chosen folder, by path (the folder's own name is removed). */
export async function readFolder(list: FileList): Promise<ExportFiles> {
  const picked = [...list].filter((file) => {
    const path = file.webkitRelativePath || file.name
    return wanted(path) && file.size <= MAX_FILE_BYTES
  })
  const entries = await Promise.all(picked.map(async (file) => [file.webkitRelativePath || file.name, await file.text()] as const))
  return withoutTopFolder(Object.fromEntries(entries), true)
}
