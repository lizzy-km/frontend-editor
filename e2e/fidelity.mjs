// The editor shows a pasted page exactly like the original: same height,
// same hidden/visible text, and the page's own scripts ran (JS-drawn parts).
// Uses the sample pages in codeToNodeTestCodeFiles/ when they are present.
import { existsSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright-core'
import { check, editorFrame, openPage, pasteCode } from './browser.mjs'

const DIR = new URL('../codeToNodeTestCodeFiles/', import.meta.url)
const SAMPLES = ['test1.md', 'test2.md', 'test3.md'].filter((name) => existsSync(new URL(name, DIR)))
if (SAMPLES.length === 0) console.log('SKIP  no sample pages in codeToNodeTestCodeFiles/')

/** Page height, elements and text that is hidden (invisible or faded out by scripts/CSS). */
const measure = () => {
  const all = [...document.body.querySelectorAll('*')].filter((el) => !el.closest('script'))
  const ownText = (el) => [...el.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim())
  const opacity = (el) => { let value = 1; for (let n = el; n; n = n.parentElement) value *= Number(getComputedStyle(n).opacity); return value }
  const hidden = all.filter((el) => ownText(el) && (getComputedStyle(el).visibility === 'hidden' || opacity(el) < 0.1))
  return { elements: all.filter((el) => el.tagName !== 'SCRIPT').length, hidden: hidden.length, height: document.documentElement.scrollHeight }
}

const original = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
for (const name of SAMPLES) {
  const html = readFileSync(new URL(name, DIR), 'utf8')
  const { browser, page, errors } = await openPage('/try')
  await pasteCode(page, html)
  await page.waitForTimeout(600)
  await page.getByRole('button', { name: 'Open in editor' }).click()
  const { frame } = await editorFrame(page)
  await page.waitForTimeout(2000)
  const editor = await frame.evaluate(measure)
  const viewport = await frame.evaluate(() => ({ width: innerWidth, height: innerHeight }))

  const reference = await original.newPage({ viewport })
  await reference.setContent(html, { waitUntil: 'networkidle' })
  await reference.waitForTimeout(2000)
  const expected = await reference.evaluate(measure)
  await reference.close()

  const detail = `editor ${JSON.stringify(editor)} · original ${JSON.stringify(expected)}`
  check(`${name}: same elements (scripts ran)`, editor.elements === expected.elements, detail)
  check(`${name}: same page height`, Math.abs(editor.height - expected.height) <= 2)
  check(`${name}: same hidden text`, editor.hidden === expected.hidden)
  check(`${name}: no console errors`, errors.length === 0, errors.join(' | '))
  await browser.close()
}
await original.close()
