// Looks (variants) and options: add a look, edit it on its own, switch a copy to it, show or hide a named part in one copy.
import { check, inspectorTab, openExample } from './browser.mjs'

const { browser, page, frame, box, errors } = await openExample()
await page.waitForTimeout(800)
const side = page.locator('aside').first()
const settings = page.locator('aside').last()
const rail = (name) => side.getByRole('tab', { name }).click().then(() => page.waitForTimeout(250))
const count = async (selector) => (await frame.$$(selector)).length
const click = async (selector) => { const b = await box(selector); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(350) }

await rail('Components')
await side.getByRole('button', { name: 'Card', exact: true }).click(); await page.waitForTimeout(500)
for (let i = 0; i < 2; i++) { await side.getByRole('button', { name: 'Add a copy' }).click(); await page.waitForTimeout(400) }

// A second look called Dark
await side.getByRole('button', { name: '+ Add a look' }).click()
await side.getByLabel('Name of the new look').fill('Dark')
await side.getByRole('button', { name: 'Add', exact: true }).click(); await page.waitForTimeout(500)
check('the component now has two looks', (await side.getByRole('group', { name: 'Looks' }).getByRole('button').count()) === 3) // Default, Dark, + Add a look
check('both looks are main components of one component', (await count('[data-fe-component="Card"]')) === 2)

// Edit the Dark look on its own and change its title
await side.getByRole('button', { name: 'Edit', exact: true }).click(); await page.waitForTimeout(600)
check('only the Dark look is on screen', (await count('[data-fe-variant="Dark"]')) === 1 && !(await frame.$eval('[data-fe-variant="Default"]', (el) => el.getClientRects().length > 0)))
const title = await box('[data-fe-variant="Dark"] h3')
await page.mouse.dblclick(title.x + title.width / 2, title.y + title.height / 2); await page.waitForTimeout(500)
await page.keyboard.press('Control+A'); await page.keyboard.type('Dark title')
await page.mouse.click(5, 300); await page.waitForTimeout(600)
await page.getByRole('button', { name: 'Done' }).click(); await page.waitForTimeout(400)
check('the Dark look has its own title; copies of Default are unchanged', (await frame.$eval('[data-fe-variant="Dark"] h3', (el) => el.textContent.trim())) === 'Dark title' && (await frame.$$eval('[data-fe-instance] h3', (all) => all.map((el) => el.textContent.trim()))).every((text) => text === 'Card title'))

// Name the picture of the Default look as an option, then hide it in one copy only
await rail('Components')
await side.getByRole('button', { name: 'Default', exact: false }).first().click()
await side.getByRole('button', { name: 'Edit', exact: true }).click(); await page.waitForTimeout(600)
await click('[data-fe-variant="Default"] img')
await inspectorTab(page, 'Actions')
await settings.getByRole('button', { name: /Part of/ }).click()
await settings.getByLabel('Option name').fill('Picture'); await settings.getByLabel('Option name').press('Enter'); await page.waitForTimeout(400)
await page.getByRole('button', { name: 'Done' }).click(); await page.waitForTimeout(400)

// Select the first copy: switch its look, hide its picture
await rail('Components')
await side.getByRole('button', { name: /\d copies/ }).click()
await side.locator('ul ul li button').first().click(); await page.waitForTimeout(400)
await inspectorTab(page, 'Actions')
check('the copy offers its option', await settings.getByText('Show “Picture”').isVisible())
await settings.getByText('Show “Picture”').click(); await page.waitForTimeout(400)
const pictures = await frame.$$eval('[data-fe-instance] img', (all) => all.map((el) => el.hasAttribute('data-fe-hidden')))
check('the picture is hidden in that copy only', pictures.filter(Boolean).length === 1 && pictures.length === 2, JSON.stringify(pictures))

await settings.getByLabel('Look of this copy').selectOption({ label: 'Dark' }); await page.waitForTimeout(500)
const titles = await frame.$$eval('[data-fe-instance] h3', (all) => all.map((el) => el.textContent.trim()))
check('the copy switched to the Dark look and the other copy did not', titles.includes('Dark title') && titles.includes('Card title'), titles.join(' | '))
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
