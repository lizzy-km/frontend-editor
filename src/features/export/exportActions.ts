import { buildPageParts, partsToSingleFile } from '@/features/editor/model/serialize/buildPage'
import { getDoc } from '@/features/editor/store/doc.store'
import { downloadFile, toFileName } from '@/lib/download'
import { partsToSplitFiles } from './buildFiles'
import { capturePng } from './capturePng'
import { zipFiles } from './zip'

/** null = whole page, otherwise the id of the part to export. */
export type ExportScope = string | null

/**
 * Each export is two steps: prepare (may fail — e.g. a picture that can't be
 * captured) and deliver (save / copy). A download is only counted between the
 * two, so a failed export never uses up one of the month's downloads.
 */
export type Deliver = () => void | Promise<void>

function baseName(scope: ExportScope): string {
  const name = toFileName(getDoc().title)
  return scope ? `${name}-part` : name
}

const partsFor = (scope: ExportScope) => buildPageParts(getDoc(), scope ?? undefined)

/** One .html file that opens anywhere (CSS and JS inside). */
export async function prepareHtml(scope: ExportScope): Promise<Deliver> {
  const html = partsToSingleFile(partsFor(scope))
  return () => downloadFile(`${baseName(scope)}.html`, html, 'text/html')
}

/** A .zip with index.html, styles.css and script.js — for developers / hosting. */
export async function prepareZip(scope: ExportScope): Promise<Deliver> {
  const zip = zipFiles(partsToSplitFiles(partsFor(scope)))
  return () => downloadFile(`${baseName(scope)}.zip`, zip)
}

/** A .zip with a React + TypeScript project (Vite), one component per part. Loaded only when used. */
export async function prepareReact(scope: ExportScope): Promise<Deliver> {
  const { buildReactProject } = await import('./react/buildReactProject')
  const folder = `${baseName(scope)}-react`
  const files = buildReactProject(getDoc(), scope ?? undefined)
  const zip = zipFiles(Object.fromEntries(Object.entries(files).map(([path, text]) => [`${folder}/${path}`, text])))
  return () => downloadFile(`${folder}.zip`, zip)
}

/** A .png picture of the page or part. */
export async function preparePng(scope: ExportScope): Promise<Deliver> {
  const picture = await capturePng(scope)
  return () => downloadFile(`${baseName(scope)}.png`, picture)
}

/** Copies the single-file HTML, ready to paste back into an AI chat or a website builder. */
export async function prepareCopy(scope: ExportScope): Promise<Deliver> {
  const html = partsToSingleFile(partsFor(scope))
  return () => navigator.clipboard.writeText(html)
}
