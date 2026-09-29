import { strToU8, zipSync } from 'fflate'
import type { ExportFiles } from './buildFiles'

/** Packs text files into a .zip Blob (fflate: tiny and fast, no worker needed). */
export function zipFiles(files: ExportFiles): Blob {
  const entries = Object.fromEntries(Object.entries(files).map(([name, text]) => [name, strToU8(text)]))
  const bytes = zipSync(entries, { level: 6 })
  return new Blob([bytes as BlobPart], { type: 'application/zip' })
}
