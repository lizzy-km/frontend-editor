// Shared setup for the browser checks. Uses the Chrome already installed on
// this machine (no browser download). Override with CHROME_PATH / E2E_URL.
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright-core'

export const BASE_URL = process.env.E2E_URL ?? 'http://localhost:5317'
export const OUT = new URL('./screenshots/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
mkdirSync(OUT, { recursive: true })

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

/** Opens a page and collects console/page errors into `errors`. */
export async function openPage(path) {
  const browser = await chromium.launch({ executablePath: CHROME })
  const page = await browser.newPage({ viewport: { width: 1400, height: 860 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('console', (message) => message.type() === 'error' && errors.push(`console: ${message.text()}`))
  await page.goto(BASE_URL + path)
  await page.waitForTimeout(2000)
  const frame = page.frames().find((item) => item !== page.mainFrame())
  const box = async (selector) => (await frame.$(selector)).boundingBox()
  return { browser, page, frame, box, errors }
}

/** Fails the run (exit 1) when the condition is false. */
export function check(label, condition, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`)
  if (!condition) process.exitCode = 1
}
