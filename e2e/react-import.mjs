// Open a React project that Tweak did not make: the project runs in a locked frame, every page is visited and becomes a page of a Tweak site.
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { zipSync } from 'fflate'
import { check, OUT, openPage } from './browser.mjs'

/** A .zip of a folder, like the one a person would upload. */
function zipFolder(folder, target) {
  const files = {}
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      if (name === 'node_modules' || name === 'dist') continue
      const path = join(dir, name)
      if (statSync(path).isDirectory()) walk(path)
      else files[`my-shop/${relative(folder, path).split('\\').join('/')}`] = new Uint8Array(readFileSync(path))
    }
  }
  walk(folder)
  // Text that only LOOKS like an import must not break the import (it once asked a CDN for a library called " type=").
  files['my-shop/src/zz-trap.ts'] = new TextEncoder().encode('export const trap = [\'Read more from " type=" here\', \'import " x" later\', "from \'Google Fonts\'"]\n')
  mkdirSync(OUT, { recursive: true })
  writeFileSync(target, zipSync(files))
}

const fixture = process.env.REACT_FIXTURE ?? new URL('./fixtures/ai-react-shop', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const zip = join(OUT, 'ai-react-project.zip')
zipFolder(fixture, zip)

const { browser, page, errors } = await openPage('/try')
await page.waitForTimeout(800)
await page.locator('input[aria-label="React project .zip"]').setInputFiles(zip)
await page.getByText('This React project was not made by Tweak').waitFor({ timeout: 20000 })
check('a React project not made by Tweak is offered to be opened by running it', await page.getByRole('button', { name: 'Open it as a Tweak site' }).isVisible())
await page.getByRole('button', { name: 'Open it as a Tweak site' }).click()
const started = Date.now()
const card = page.locator('section[aria-label="Opening your project"]')
await card.waitFor({ timeout: 10000 })
check('a progress screen shows while the project opens', await card.isVisible())
check('it lists the steps (reading, starting, visiting, building)', (await card.locator('ol li').count()) >= 4)
await page.waitForFunction(() => document.querySelectorAll('section[aria-label="Opening your project"] [title]').length >= 3, null, { timeout: 120000 })
check('pages pop in as they are found', (await card.locator('[aria-label="Pages found"] span[title]').count()) >= 3)
check('a little browser shows the address being visited', (await card.locator('span', { hasText: /^\// }).count()) >= 1)
await page.getByText(/Found \d+ pages?/).waitFor({ timeout: 240000 })
check('the progress screen is replaced by the result', (await card.count()) === 0)
const found = await page.getByText(/Found \d+ pages?/).innerText()
console.log(`  (${Math.round((Date.now() - started) / 1000)}s) ${found.slice(0, 600)}`)
const count = Number(/Found (\d+)/.exec(found)[1])
check('the project\'s pages were found', count >= 8, found.slice(0, 200))
check('members-only pages were found by signing in', /members only/.test(found))
await page.screenshot({ path: `${OUT}react-import-found.png` })
await page.getByRole('button', { name: 'Open in the editor' }).click()
await page.waitForSelector('iframe[title="Your page"]')
await page.waitForTimeout(2500)
const frame = page.frames().find((item) => item !== page.mainFrame())
check('the home page opens in the editor with the app\'s header and footer', (await frame.$$('header')).length >= 1 && (await frame.$$('footer')).length >= 1)
check('the home page has its words', (await frame.$eval('h1', (el) => el.textContent)).length > 3)
await page.screenshot({ path: `${OUT}react-import-editor.png` })
const side = page.locator('aside').first()
await side.getByRole('tab', { name: 'Pages' }).click()
await page.waitForTimeout(500)
for (const name of ['Shop', 'Log in', 'About', 'Contact']) check(`the Pages panel lists "${name}"`, (await side.getByText(name, { exact: true }).count()) >= 1)
check('members-only pages are marked as such', (await side.getByText(/Members only|Signed in|private/i).count()) >= 1)

// Preview: the imported site works like a site (menu links open the other pages; the members-only ones send a visitor to log in)
await page.getByRole('button', { name: 'Preview' }).click()
await page.waitForTimeout(2500)
const view = page.frameLocator('iframe[title="Preview of your page"]')
await view.getByRole('link', { name: 'Shop', exact: true }).first().click()
await page.waitForTimeout(1500)
check('Preview: the menu opens the Shop page with its products', (await view.locator('main a, main article').count()) >= 6)
await page.screenshot({ path: `${OUT}react-import-preview.png` })
const real = errors.filter((message) => !/Failed to load resource|favicon|firestore|identitytoolkit|googleapis/i.test(message))
check('no console errors in the editor', real.length === 0, real.join(' | '))
await browser.close()
