// Edit a component on its own: the rest of the page steps aside, new things go inside it, Done brings the page back.
import { check, openExample } from './browser.mjs'

const { browser, page, frame, errors } = await openExample()
await page.waitForTimeout(800)
const side = page.locator('aside').first()
const rail = (name) => side.getByRole('tab', { name }).click().then(() => page.waitForTimeout(250))
const shown = (selector) => frame.$eval(selector, (el) => el.getClientRects().length > 0).catch(() => false)

await rail('Components')
await side.getByRole('button', { name: 'Banner', exact: true }).click(); await page.waitForTimeout(500)
await side.getByRole('button', { name: 'Add a copy' }).click(); await page.waitForTimeout(400)
check('the page and the component are both visible at first', (await shown('.hero')) && (await shown('[data-fe-component="Banner"]')))

await side.getByRole('button', { name: 'Edit', exact: true }).click(); await page.waitForTimeout(600)
check('a bar says which component is being edited, and how many copies follow', (await page.getByRole('status', { name: 'Editing a component' }).innerText()).includes('Banner') && (await page.getByRole('status', { name: 'Editing a component' }).innerText()).includes('1 copy follows'))
check('the rest of the page steps aside', !(await shown('.hero')) && !(await shown('nav')) && !(await shown('[data-fe-instance]')))
check('the component itself is on screen', await shown('[data-fe-component="Banner"]'))

// Adding while focused puts the new thing inside the component, and the copy follows
await rail('Add')
await side.getByRole('button', { name: 'Heading', exact: true }).click(); await page.waitForTimeout(500)
check('a new heading went inside the component', (await frame.$$('[data-fe-component="Banner"] h2')).length === 2)
check('the copy got it too', (await frame.$$('[data-fe-instance] h2')).length === 2)

await page.getByRole('button', { name: 'Done' }).click(); await page.waitForTimeout(500)
check('Done brings the whole page back', (await shown('.hero')) && (await shown('[data-fe-instance]')) && (await page.getByRole('status', { name: 'Editing a component' }).count()) === 0)

// From a copy: Edit the main component; deleting the component while editing leaves focus mode
await rail('Components')
await side.getByRole('button', { name: 'Edit', exact: true }).click(); await page.waitForTimeout(400)
await rail('Components')
await side.getByRole('button', { name: 'Delete' }).click()
await side.getByRole('button', { name: 'Delete the component' }).click(); await page.waitForTimeout(600)
check('deleting the component leaves the editing view', (await page.getByRole('status', { name: 'Editing a component' }).count()) === 0 && (await shown('.hero')))
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
