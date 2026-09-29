import { buildPageParts, partsToSingleFile } from '@/features/editor/model/serialize/buildPage'
import { getDoc } from '@/features/editor/store/doc.store'
import { downloadFile, toFileName } from '@/lib/download'
import { partsToSplitFiles } from './buildFiles'
import { capturePng } from './capturePng'
import { zipFiles } from './zip'

/** null = whole page, otherwise the id of the part to export. */
export type ExportScope = string | null

function baseName(scope: ExportScope): string {
  const name = toFileName(getDoc().title)
  return scope ? `${name}-part` : name
}

const partsFor = (scope: ExportScope) => buildPageParts(getDoc(), scope ?? undefined)

/** One .html file that opens anywhere (CSS and JS inside). */
export function downloadHtml(scope: ExportScope) {
  downloadFile(`${baseName(scope)}.html`, partsToSingleFile(partsFor(scope)), 'text/html')
}

/** A .zip with index.html, styles.css and script.js — for developers / hosting. */
export function downloadZip(scope: ExportScope) {
  downloadFile(`${baseName(scope)}.zip`, zipFiles(partsToSplitFiles(partsFor(scope))))
}

/** A .png picture of the page or part. */
export async function downloadPng(scope: ExportScope) {
  downloadFile(`${baseName(scope)}.png`, await capturePng(scope))
}

/** Copies the single-file HTML, ready to paste back into an AI chat or a website builder. */
export async function copyHtml(scope: ExportScope) {
  await navigator.clipboard.writeText(partsToSingleFile(partsFor(scope)))
}

/** The full page as one HTML string (used by Preview). */
export const pageHtml = () => partsToSingleFile(buildPageParts(getDoc()))
