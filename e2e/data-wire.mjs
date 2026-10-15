// Data wiring: any box shows one record of a data source; connect fields for me; row choice; Preview shows the values.
import { check, inspectorTab, openExample } from './browser.mjs'

const { browser, page, frame, box, errors } = await openExample()
const sidebar = page.locator('aside').first()
const panel = page.locator('aside').last()

await sidebar.getByRole('tab', { name: 'Data' }).click()
await sidebar.getByLabel('Start from').selectOption('Store products (Fake Store API)')
await sidebar.getByRole('button', { name: 'Add data' }).click()
await page.waitForTimeout(300)
await sidebar.getByRole('tab', { name: 'Layers' }).click()

// Select the second card (the first click on its heading selects the card box)
const heading = await box('.card:nth-child(2) h3')
await page.mouse.move(heading.x + 12, heading.y + 12)
await page.mouse.click(heading.x + 12, heading.y + 12)
await page.waitForTimeout(300)
await page.keyboard.press('Escape') // the heading's parent is the card
await page.waitForTimeout(400)
await inspectorTab(page, 'Actions')
await panel.getByRole('button', { name: 'Data', exact: true }).click()
await page.waitForTimeout(200)

await panel.getByLabel('Data to show').selectOption('storeProducts')
await page.waitForTimeout(300)
check('one record is the default way', (await panel.getByRole('group', { name: 'How the data shows' }).getByRole('button', { pressed: true }).innerText()) === 'One item')
check('the box is a Data box in the layers', (await sidebar.innerText()).length > 0 && (await frame.$eval('.card:nth-child(2)', (el) => el.getAttribute('data-fe-record'))) === 'storeProducts')

await panel.getByRole('button', { name: 'Fill in the fields for me' }).click()
await page.waitForTimeout(400)
check('heading connected to a text field', (await frame.$eval('.card:nth-child(2) h3', (el) => el.getAttribute('data-fe-bind'))) === 'title')
check('paragraph connected to the description', (await frame.$eval('.card:nth-child(2) p', (el) => el.getAttribute('data-fe-bind'))) === 'description')

await panel.getByLabel('Which item').selectOption('number')
await page.waitForTimeout(300)
check('row choice saved', (await frame.$eval('.card:nth-child(2)', (el) => el.getAttribute('data-fe-row'))) === '1')
await panel.getByLabel('Which item').selectOption('param')
await page.waitForTimeout(300)
check('page address choice saved', (await frame.$eval('.card:nth-child(2)', (el) => el.getAttribute('data-fe-row'))) === '?id')

await page.getByRole('button', { name: 'Preview' }).click()
const preview = page.frameLocator('iframe[title="Preview of your page"]')
await page.waitForTimeout(800)
const shown = await preview.locator('.card:nth-child(2) h3').innerText()
check('Preview shows the first product (no address given)', shown.includes('Fjallraven'), shown)
check('the other cards keep their own words', (await preview.locator('.card:nth-child(1) h3').innerText()).includes('Sourdough'))
await page.keyboard.press('Escape')
await page.waitForTimeout(300)

await page.mouse.click(12, 845)
await page.keyboard.press('Control+z')
await page.waitForTimeout(300)
check('undo takes the row choices back in one step', (await frame.$eval('.card:nth-child(2)', (el) => el.getAttribute('data-fe-row'))) === 'first')
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
