// Dynamic routes: Detail page (/store-product/:id), a card that opens it, Preview shows the clicked row.
import { check, inspectorTab, openExample, openSection, openAddFolds } from './browser.mjs'

const { browser, page, frame, box, errors } = await openExample()
const sidebar = page.locator('aside').first()
const panel = page.locator('aside').last()

await sidebar.getByRole('tab', { name: 'Data' }).click()
await sidebar.getByLabel('Start from').selectOption('Store products (Fake Store API)')
await sidebar.getByRole('button', { name: 'Add data' }).click()

// a website with a list of the store products
const frameBox = await page.locator('iframe[title="Your page"]').boundingBox()
await page.mouse.click(frameBox.x + frameBox.width / 2, frameBox.y + frameBox.height - 30)
await page.waitForTimeout(300)
await panel.getByRole('button', { name: /Make this a website/ }).click()
await page.waitForTimeout(400)
await page.mouse.click(12, 845)
await sidebar.getByRole('tab', { name: 'Add' }).click()
await openAddFolds(page)
await sidebar.getByRole('button', { name: 'List from data' }).click()
await page.waitForTimeout(700)

// the detail page: its address has a changing part
await sidebar.getByRole('tab', { name: 'Pages' }).click()
await sidebar.getByRole('button', { name: 'Add a page' }).click()
const dialog = page.getByRole('dialog')
await dialog.getByRole('radio', { name: 'Detail page' }).click().catch(async () => { await dialog.getByRole('button', { name: 'Detail page' }).click() })
await page.waitForTimeout(300)
check('the detail page starts with a changing address', (await dialog.getByLabel('Address').inputValue()) === '/store-product/:id')
check('and a name made from the data', (await dialog.getByLabel('Page name').inputValue()) === '' && (await dialog.getByText('Shows one item of').isVisible()))
await dialog.getByRole('button', { name: 'Add page' }).click()
await page.waitForTimeout(600)
check('the page is listed with its address', (await sidebar.getByRole('list', { name: 'Pages' }).innerText()).includes('/store-product/:id'))
check('its box shows one record from the address', (await frame.$eval('[data-fe-record]', (el) => el.getAttribute('data-fe-row'))) === '?id')
check('the page settings explain the changing part', await sidebar.getByText('A changing page').isVisible())

// back to Home: the first card opens the detail page
await sidebar.getByRole('list', { name: 'Pages' }).getByRole('button', { name: /^Home/ }).click()
await page.waitForTimeout(500)
await sidebar.getByRole('tab', { name: 'Layers' }).click()
const list = await box('[data-fe-list]')
await page.mouse.move(list.x + 4, list.y + 4)
await page.mouse.click(list.x + 4, list.y + 4) // the list box itself
await page.waitForTimeout(400)
await inspectorTab(page, 'Actions')
await openSection(page, 'Data')
await panel.getByRole('group', { name: 'What clicking a card does' }).getByRole('button', { name: 'Open page' }).click()
await page.waitForTimeout(400)
const chosen = await panel.getByLabel('Page a card opens').inputValue()
check('the card opens the changing page', chosen === '/store-product/:id', chosen)
check('the address uses the card\'s own id', await panel.getByText(/for its own item/).isVisible())
check('the card design keeps the address', (await frame.$eval('[data-fe-list] > article:first-child', (el) => el.getAttribute('data-fe-go'))) === '/store-product/:id')

await page.getByRole('button', { name: 'Preview' }).click()
const preview = page.frameLocator('iframe[title="Preview of your page"]')
await page.waitForTimeout(900)
await preview.locator('[data-fe-list] > article').nth(2).click()
await page.waitForTimeout(800)
const shown = await preview.locator('h1').first().innerText()
check('Preview shows the clicked product on the detail page', shown.includes('Mens Cotton Jacket'), shown)
await page.keyboard.press('Escape')
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
