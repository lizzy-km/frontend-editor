// Reusable components: make one, add copies, change the main one (copies follow), override a copy, Preview hides the main one.
import { check, inspectorTab, openAddFolds, openExample } from './browser.mjs'

const { browser, page, frame, box, errors } = await openExample()
await page.waitForTimeout(800)
const side = page.locator('aside').first()
const settings = page.locator('aside').last()
const headings = () => frame.$$eval('.card h3', (all) => all.map((el) => el.textContent.trim()))
const cards = () => frame.$$eval('.card', (all) => all.length)

// Select the first card: click its heading, then its parent
const h = await box('.card:nth-child(1) h3')
await page.mouse.click(h.x + h.width / 2, h.y + h.height / 2)
await page.waitForTimeout(300)
await page.keyboard.press('Escape')
await page.waitForTimeout(300)
await inspectorTab(page, 'Actions')
await settings.getByRole('button', { name: 'Component', exact: true }).click()
await settings.getByLabel('Component name').fill('Bakery card')
await settings.getByLabel('Component name').press('Enter')
await settings.getByRole('button', { name: 'Make a component' }).click()
await page.waitForTimeout(400)
check('the card is now a main component', (await settings.innerText()).includes('main component'))
check('its Layers name says so', (await (async () => { await side.getByRole('tab', { name: 'Layers' }).click(); return side.getByRole('tree').innerText() })()).includes('Component “Bakery card”'))

// Two copies from Add → Your components (each goes next to the selected component)
await side.getByRole('tab', { name: 'Add' }).click()
await openAddFolds(page)
for (let i = 0; i < 2; i++) { await side.getByRole('button', { name: 'Bakery card' }).click(); await page.waitForTimeout(400) }
check('two copies were added', (await cards()) === 5, String(await cards()))
check('a copy looks like the main component', (await headings()).filter((text) => text === 'Sourdough').length === 3, (await headings()).join('|'))

// Change the main card's heading in place: copies follow
const mainHeading = await box('.card:nth-child(1) h3')
await page.mouse.dblclick(mainHeading.x + mainHeading.width / 2, mainHeading.y + mainHeading.height / 2)
await page.waitForTimeout(500)
await page.keyboard.press('Control+A')
await page.keyboard.type('Rye loaf')
await page.mouse.click(5, 300) // click away to save
await page.waitForTimeout(600)
const after = await headings()
check('the main card changed', after[0] === 'Rye loaf', after.join('|'))
check('both copies followed', after.filter((text) => text === 'Rye loaf').length === 3, after.join('|'))

// A copy changes its own words: it keeps them when the main card changes again
const copyHeading = await box('.card:nth-child(2) h3')
await page.mouse.dblclick(copyHeading.x + copyHeading.width / 2, copyHeading.y + copyHeading.height / 2)
await page.waitForTimeout(500)
await page.keyboard.press('Control+A')
await page.keyboard.type('My own loaf')
await page.mouse.click(5, 300)
await page.waitForTimeout(600)
const main2 = await box('.card:nth-child(1) h3')
await page.mouse.dblclick(main2.x + main2.width / 2, main2.y + main2.height / 2)
await page.waitForTimeout(500)
await page.keyboard.press('Control+A')
await page.keyboard.type('Seeded loaf')
await page.mouse.click(5, 300)
await page.waitForTimeout(600)
const later = await headings()
check('the copy keeps its own words, the other follows', later[0] === 'Seeded loaf' && later.includes('My own loaf') && later.filter((text) => text === 'Seeded loaf').length === 2, later.join('|'))

// Preview and downloads: the main component is only for editing
await page.getByRole('button', { name: 'Preview' }).click()
const view = page.frameLocator('iframe[title="Preview of your page"]')
await view.locator('.card').first().waitFor()
const shown = await view.locator('.card h3').allInnerTexts()
check('Preview leaves the main component out and shows the copies', shown.length === 4 && !shown.includes('Seeded loaf') === false && shown.includes('My own loaf'), shown.join('|'))
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
