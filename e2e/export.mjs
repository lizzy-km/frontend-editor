// Export: download html / zip / png (whole page and one part), preview runs scripts safely.
import { readFileSync, statSync } from 'node:fs'
import { check, editorFrame, OUT, openPage } from './browser.mjs'

const PAGE = `<!doctype html><html><head><title>Button Test</title>
<style>.hero{padding:40px;background:#fde8e1}</style></head>
<body><section class="hero"><h1>Hello</h1><button id="b">Click</button></section><footer>Bye</footer>
<script>document.getElementById('b').addEventListener('click',()=>{document.querySelector('h1').textContent='Clicked!'})</script>
</body></html>`

const { browser, page, errors } = await openPage('/try')
await page.getByLabel('Your code').fill(PAGE)
await page.getByRole('button', { name: 'Open in editor' }).click()
const { frame, box } = await editorFrame(page)

const download = async (choice) => {
  const [file] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: new RegExp(choice) }).click()])
  const path = OUT + file.suggestedFilename()
  await file.saveAs(path)
  await page.waitForTimeout(300)
  return path
}

// Whole page as .html
await page.getByRole('button', { name: 'Download', exact: true }).click()
const htmlPath = await download('Web page')
const html = readFileSync(htmlPath, 'utf8')
check('html file name from title', htmlPath.endsWith('button-test.html'), htmlPath)
check('html contains page and script', html.includes('<footer>Bye</footer>') && html.includes("addEventListener('click'"))

// Zip
await page.getByRole('button', { name: 'Download', exact: true }).click()
const zipPath = await download('Files for a developer')
check('zip downloaded', statSync(zipPath).size > 300, `${statSync(zipPath).size} bytes`)

// Only the selected section as png
const hero = await box('.hero')
await page.mouse.move(hero.x + 5, hero.y + 5)
await page.mouse.click(hero.x + 5, hero.y + 5)
await page.waitForTimeout(300)
await page.getByRole('button', { name: 'Download', exact: true }).click()
await page.getByRole('radio', { name: /Only/ }).click()
const pngPath = await download('Picture')
check('png of the part', pngPath.endsWith('-part.png') && statSync(pngPath).size > 1000, `${statSync(pngPath).size} bytes`)

// Preview runs the page's JavaScript
await page.getByRole('button', { name: 'Preview' }).click()
await page.waitForTimeout(800)
const preview = page.frames().find((item) => item.name() === '' && item !== page.mainFrame() && item !== frame)
await preview.click('#b')
await page.waitForTimeout(200)
check('script runs in preview', (await preview.$eval('h1', (el) => el.textContent)) === 'Clicked!')
await page.screenshot({ path: OUT + 'export-preview.png' })
// Keys pressed inside the (cross-origin) preview never reach the app, so focus the bar first.
await page.mouse.click(700, 28)
await page.keyboard.press('Escape')
await page.waitForTimeout(300)
check('Esc leaves preview', (await page.$('[aria-label="Preview"]')) === null)
check('editor page untouched by preview script', (await frame.$eval('h1', (el) => el.textContent)) === 'Hello')

check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
