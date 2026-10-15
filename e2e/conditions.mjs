// "Who can see this" + "Viewing as": elements hidden by sign-in, role and flag, in the editor and Preview.
import { check, OUT, openExample, inspectorTab } from './browser.mjs'

const { browser, page, frame, box, errors } = await openExample()
const panel = page.locator('aside').last()
const shown = (selector) => frame.$eval(selector, (el) => el.getClientRects().length > 0).catch(() => false)
const viewAs = async (text) => {
  await page.getByRole('button', { name: /Viewing as/ }).click()
  await page.getByRole('dialog', { name: 'Viewing as' }).getByLabel(text, { exact: true }).check()
  await page.mouse.click(700, 845)
  await page.waitForTimeout(300)
}

check('no "Viewing as" until something uses it', (await page.getByRole('button', { name: /Viewing as/ }).count()) === 0)
const link = await box('nav a:last-child')
await page.mouse.move(link.x + 4, link.y + 4)
await page.mouse.click(link.x + 4, link.y + 4)
await page.waitForTimeout(300)
await inspectorTab(page, 'Actions')
await panel.getByRole('button', { name: 'Who can see this' }).click()
await panel.getByRole('group', { name: 'Who can see this' }).getByRole('button', { name: 'Signed in' }).click()
await page.waitForTimeout(400)
check('signed-in only link is hidden for visitors', !(await shown('nav a:last-child')))
check('"Viewing as" appears', await page.getByRole('button', { name: /Viewing as: Visitor/ }).isVisible())

await viewAs('Signed in')
check('shown when viewing as signed in', await shown('nav a:last-child'))

// Admins only
await page.locator('aside').first().getByRole('tab', { name: 'Layers' }).click()
await page.locator('aside').first().getByRole('treeitem', { name: 'Link “Visit us”' }).click()
await page.waitForTimeout(300)
await panel.getByLabel('admin').check()
await page.waitForTimeout(300)
check('admin-only link hidden for other signed-in visitors', !(await shown('nav a:last-child')))
await viewAs('Signed in as admin')
check('admin sees it', await shown('nav a:last-child'))
await page.screenshot({ path: OUT + 'conditions.png' })

// Preview follows "Viewing as"
await page.getByRole('button', { name: 'Preview' }).click()
const preview = page.frameLocator('iframe[title="Preview of your page"]')
check('Preview as admin shows it', (await preview.locator('nav').innerText()).includes('Visit us'))
await page.getByRole('button', { name: 'Back to editing' }).click()
await viewAs('Visitor (signed out)')
await page.getByRole('button', { name: 'Preview' }).click()
check('Preview as visitor leaves it out', !(await preview.locator('nav').innerText()).includes('Visit us'))

// The roles can be switched inside Preview itself
const previewMenu = page.getByRole('dialog', { name: 'Preview' })
check('Preview has a "Viewing as" control', await previewMenu.getByRole('button', { name: /Viewing as/ }).isVisible())
await previewMenu.getByRole('button', { name: /Viewing as/ }).click()
await page.getByRole('radio', { name: 'Signed in as admin' }).check()
await page.waitForTimeout(600)
check('switching to admin inside Preview shows it', (await preview.locator('nav').innerText()).includes('Visit us'))
await page.getByRole('radio', { name: 'Visitor (signed out)' }).check() // the menu stays open
await page.waitForTimeout(600)
check('and back to a visitor hides it again', !(await preview.locator('nav').innerText()).includes('Visit us'))
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
