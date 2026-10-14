// Multi-page sites: add pages (empty, pasted, copy), switch, rename, undo, delete. Header/footer are shared.
import { check, OUT, openExample } from './browser.mjs'

const { browser, page, frame, errors } = await openExample()
const sidebar = page.locator('aside').first()
const visible = (selector) => frame.$eval(selector, (el) => el.getClientRects().length > 0).catch(() => false)
const pageList = () => sidebar.getByRole('list', { name: 'Pages' }).getByRole('listitem')

await sidebar.getByRole('tab', { name: 'Pages' }).click()
check('one-page projects explain pages', await sidebar.getByText(/This project is one page/).isVisible())

// Empty page
await sidebar.getByRole('button', { name: 'Add a page' }).click()
await page.getByRole('dialog').getByLabel('Page name').fill('About us')
await page.getByRole('button', { name: 'Add page' }).click()
await page.waitForTimeout(500)
check('site now has Home and About us', (await pageList().count()) === 2)
check('new page shows, Home hides, header stays', (await frame.$eval('body', (b) => b.innerText)).includes('About us') && !(await visible('.hero')) && (await visible('nav')))
await page.screenshot({ path: OUT + 'pages-about.png' })

// Pasted page: its own header and footer are dropped
await sidebar.getByRole('button', { name: 'Add a page' }).click()
await page.getByRole('dialog').getByLabel('Page name').fill('Prices')
await page.getByRole('group', { name: 'Start with' }).getByRole('button', { name: 'Paste code' }).click()
const code = page.locator('.cm-editor', { has: page.getByLabel('Code for the new page') })
await code.waitFor()
await code.locator('.cm-content').click()
await page.keyboard.insertText('<header>Other header</header><section class="prices"><h2>Plans</h2></section>')
await page.getByRole('button', { name: 'Add page' }).click()
await page.waitForTimeout(500)
check('pasted page added without its own header', (await visible('.prices')) && (await frame.$$eval('header', (all) => all.filter((h) => h.innerText.includes('Other header')).length)) === 0)

// Switch back, rename, address
await sidebar.getByRole('button', { name: /^Home/ }).click()
await page.waitForTimeout(300)
check('switching shows Home again', (await visible('.hero')) && !(await visible('.prices')))
await sidebar.getByLabel('Page name').fill('Start')
await sidebar.getByLabel('Page name').press('Enter')
await page.waitForTimeout(200)
check('rename shows in the list', (await pageList().first().textContent()).includes('Start'))

const layers = await (async () => { await sidebar.getByRole('tab', { name: 'Layers' }).click(); return sidebar.getByRole('tree').textContent() })()
check('layers show the current page only', layers.includes('Page “Start”') && !layers.includes('Page “Prices”'))

// Undo the rename, then delete Prices
await page.mouse.click(700, 845)
await page.keyboard.press('Control+z')
await sidebar.getByRole('tab', { name: 'Pages' }).click()
check('undo brings the old name back', (await pageList().first().textContent()).includes('Home'))
page.once('dialog', (dialog) => dialog.accept())
await sidebar.getByRole('button', { name: 'Delete Prices' }).click()
await page.waitForTimeout(300)
check('page deleted', (await pageList().count()) === 2)
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
