// "List from data": one card design, live copies from the data, field bindings, page size, Preview.
import { check, OUT, openExample, inspectorTab } from './browser.mjs'

const { browser, page, frame, box, errors } = await openExample()
const sidebar = page.locator('aside').first()
const panel = page.locator('aside').last()
const cards = () => frame.$$eval('[data-fe-list] > article', (all) => all.length)
const copies = () => frame.$$eval('[data-fe-list] > [data-fe-clone] h3', (all) => all.map((h) => h.textContent))

await page.mouse.click(12, 845) // nothing selected: the block goes at the end of the page
await sidebar.getByRole('tab', { name: 'Add' }).click()
await sidebar.getByRole('button', { name: 'List from data' }).click()
await page.waitForTimeout(600)
check('design card + 6 copies from sample products', (await cards()) === 7, String(await cards()))
check('copies show the data', (await copies())[0] === 'Linen shirt', (await copies()).join(', '))
await frame.evaluate(() => document.querySelector('[data-fe-list]').scrollIntoView({ block: 'center' }))
await page.waitForTimeout(300)
await page.screenshot({ path: OUT + 'data-list-editor.png' })

// The box: fewer cards per page
const list = await box('[data-fe-list]')
await page.mouse.move(list.x + 4, list.y + 4)
await page.mouse.click(list.x + 4, list.y + 4)
await page.waitForTimeout(300)
check('box settings show', await panel.getByText('List from data').first().isVisible())
await inspectorTab(page, 'Actions')
await panel.getByLabel('Cards per page value').fill('3')
await page.waitForTimeout(400)
check('page size 3 shows 3 copies', (await cards()) === 4, String(await cards()))

// The design's heading shows another field
const heading = await box('[data-fe-list] > article:first-child h3')
await page.mouse.move(heading.x + 4, heading.y + 4)
await page.mouse.click(heading.x + 4, heading.y + 4)
await page.waitForTimeout(300)
await panel.getByLabel('Text from data').selectOption('description')
await page.waitForTimeout(400)
check('binding a field changes every copy', (await copies())[0]?.startsWith('Breathable'), (await copies())[0])

// Editing the data updates the copies
await sidebar.getByRole('tab', { name: 'Data' }).click()
await sidebar.getByRole('button', { name: 'Edit fields and rows' }).click()
await page.getByRole('dialog').getByLabel('description, row 1').fill('Brand new words')
await page.getByRole('dialog').getByRole('button', { name: 'Done' }).click()
await page.waitForTimeout(400)
check('data edits show in the copies', (await copies())[0] === 'Brand new words', (await copies())[0])

// Preview: real cards only (no design placeholder)
await page.getByRole('button', { name: 'Preview' }).click()
const preview = page.frameLocator('iframe[title="Preview of your page"]')
check('Preview shows one filled card per row', (await preview.locator('[data-fe-list] > article').count()) === 6)
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
