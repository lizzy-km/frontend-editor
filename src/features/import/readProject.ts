import { strFromU8, unzipSync } from 'fflate'
import type { ExportFiles } from '@/features/export/buildFiles'

const MAX_ZIP_BYTES = 200 * 1024 * 1024
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

/** The text files of a .zip (a React download), by path. */
export async function readZip(file: File): Promise<ExportFiles> {
  if (file.size > MAX_ZIP_BYTES) throw new Error('That .zip is very big. Delete node_modules from the project and zip it again.')
  const entries = unzipSync(new Uint8Array(await file.arrayBuffer()), { filter: (entry) => wanted(entry.name) && entry.originalSize <= MAX_FILE_BYTES })
  return withoutTopFolder(Object.fromEntries(Object.entries(entries).map(([path, bytes]) => [path, strFromU8(bytes)])), false)
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
