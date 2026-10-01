// Shared setup for the browser checks. Uses the Chrome already installed on
// this machine (no browser download). Override with CHROME_PATH / E2E_URL.
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright-core'

export const BASE_URL = process.env.E2E_URL ?? 'http://localhost:5317'
export const OUT = new URL('./screenshots/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
mkdirSync(OUT, { recursive: true })

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

/** Opens a page (fresh browser profile) and collects console/page errors. */
export async function openPage(path) {
  const browser = await chromium.launch({ executablePath: CHROME })
  const page = await browser.newPage({ viewport: { width: 1400, height: 860 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('console', (message) => message.type() === 'error' && errors.push(`console: ${message.text()}`))
  await page.goto(BASE_URL + path)
  return { browser, page, errors }
}

/** The page's iframe plus a helper to measure elements inside it. */
export async function editorFrame(page) {
  await page.waitForSelector('iframe[title="Your page"]')
  await page.waitForTimeout(1500)
  const frame = page.frames().find((item) => item !== page.mainFrame())
  // The frame is sandboxed (its own process), where Playwright's boundingBox
  // ignores the canvas zoom — so measure inside and apply the zoom here.
  const box = async (selector) => {
    const outer = await page.locator('iframe[title="Your page"]').boundingBox()
    const inner = await frame.$eval(selector, (el) => {
      const rect = el.getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, view: innerWidth }
    })
    const scale = outer.width / inner.view
    return { x: outer.x + inner.x * scale, y: outer.y + inner.y * scale, width: inner.width * scale, height: inner.height * scale }
  }
  return { frame, box }
}

/** /try → "Try an example page" → the editor with the bakery sample. */
export async function openExample() {
  const opened = await openPage('/try')
  await opened.page.getByRole('button', { name: 'Try an example page' }).click()
  return { ...opened, ...(await editorFrame(opened.page)) }
}

/**
 * Try-it downloads need an account. Browser checks that test the actual
 * files switch on the dev-only allowance (ignored outside `vite dev`).
 */
export async function allowTryDownloads(page) {
  await page.evaluate(() => localStorage.setItem('tweak:e2e-open-downloads', '1'))
}

/** Fails the run (exit 1) when the condition is false. */
export function check(label, condition, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`)
  if (!condition) process.exitCode = 1
}

/**
 * Puts code in the paste box at once. Playwright's fill() types big pages
 * slowly (a minute for 75 KB); a real Ctrl+V is instant, and so is this.
 */
export async function pasteCode(page, code) {
  const box = page.getByLabel('Your code')
  await box.evaluate((element, value) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set
    setter.call(element, value)
    element.dispatchEvent(new Event('input', { bubbles: true }))
  }, code)
}
