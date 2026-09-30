// A real-world AI page (fixtures/retirement.html): SVG symbols, <details> FAQ,
// a form, spans as heading lines, head meta. Guards the bugs it exposed.
import { readFileSync } from 'node:fs'
import { check, editorFrame, OUT, openPage } from './browser.mjs'

const PAGE = readFileSync(new URL('./fixtures/retirement.html', import.meta.url), 'utf8')
const { browser, page, errors } = await openPage('/try')
await page.getByLabel('Your code').fill(PAGE)
await page.waitForTimeout(600)
check('paste summary', /342 elements/.test(await page.getByText(/Found:/).textContent()))
await page.getByRole('button', { name: 'Open in editor' }).click()
const { frame, box } = await editorFrame(page)
await page.waitForTimeout(1500)
const panel = page.locator('aside').last()
const title = () => panel.locator('p').first().textContent()
const clickIn = async (selector) => {
  await page.mouse.click(12, 845) // clear selection
  await frame.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), selector)
  await page.waitForTimeout(300)
  const b = await box(selector)
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.waitForTimeout(120)
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await page.waitForTimeout(350)
}

// 1. Clicks hit the right element even after the page scrolled itself into view
await clickIn('#guests')
check('dropdown selected (not its label)', (await title()) === 'Dropdown', await title())
await clickIn('.program time')
check('time selected with a friendly name', (await title()) === 'Date or time', await title())

// 2. Heading made of line spans: whole-heading edit uses Words, lines survive
await clickIn('.hero h1 span:nth-child(3)')
await page.keyboard.press('Escape')
await page.waitForTimeout(300)
check('heading offers the Words list', await panel.getByRole('heading', { name: 'Words' }).isVisible().catch(() => false) || await panel.getByText('Words', { exact: true }).isVisible())
await page.keyboard.press('Enter')
await page.waitForTimeout(500)
check('Quill does not open on the whole heading', (await page.$('.ql-editor')) === null)
check('heading still has 3 lines', (await frame.$$eval('.hero h1 span', (els) => els.length)) === 3)

// 3. FAQ: selecting a question opens it in the editor only
await clickIn('#faq details:nth-child(2) summary')
check('fold-out opens in the editor', await frame.$eval('#faq details:nth-child(2)', (el) => el.open))
check('selection name is friendly', (await title()).startsWith('Question'), await title())

// 4. Hint text for the note box
await clickIn('#note')
await panel.getByLabel('Hint text').fill('Share a favourite memory')
await panel.getByLabel('Hint text').press('Enter')
await page.waitForTimeout(300)
check('hint text changes', (await frame.$eval('#note', (el) => el.placeholder)) === 'Share a favourite memory')

// 5. Export keeps head tags and the FAQ closed state
await page.mouse.click(12, 845)
await page.getByRole('button', { name: 'Download', exact: true }).click()
const [file] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Web page/ }).click()])
await file.saveAs(OUT + 'real-page.html')
const html = readFileSync(OUT + 'real-page.html', 'utf8')
check('export keeps viewport-fit', html.includes('viewport-fit=cover'))
check('export keeps preconnect', html.includes('rel="preconnect"'))
check('export keeps FAQ closed', !/<details open/.test(html))
check('export has the new hint text', html.includes('placeholder="Share a favourite memory"'))

check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
