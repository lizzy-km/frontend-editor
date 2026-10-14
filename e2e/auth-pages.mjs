// Sign-in pages: one button adds log in, create account, forgot / new password and confirm email; undo.
import { check, openExample } from './browser.mjs'

const { browser, page, frame, errors } = await openExample()
const sidebar = page.locator('aside').first()
const pageList = () => sidebar.getByRole('list', { name: 'Pages' }).getByRole('listitem')

const frameBox = await page.locator('iframe[title="Your page"]').boundingBox()
await page.mouse.click(frameBox.x + frameBox.width / 2, frameBox.y + frameBox.height - 30)
await page.waitForTimeout(300)
await page.locator('aside').last().getByRole('button', { name: /Make this a website/ }).click()
await page.waitForTimeout(300)

await sidebar.getByRole('button', { name: 'Add sign-in pages' }).click()
await page.waitForTimeout(600)
const titles = await pageList().allTextContents()
check('five sign-in pages added after Home', (await pageList().count()) === 6 && ['Log in', 'Create account', 'Forgot password', 'Set a new password', 'Confirm email'].every((t) => titles.join('|').includes(t)), titles.join(' | '))
check('log in page opens with its form', (await frame.$$eval('form[data-fe-submit="sign-in"] input', (all) => all.length)) === 2)
check('button gone once all pages exist', (await sidebar.getByRole('button', { name: 'Add sign-in pages' }).count()) === 0)

await page.locator('aside').last().getByText('Form', { exact: true }).first().click().catch(() => {})
await page.keyboard.press('Control+z')
await page.waitForTimeout(400)
check('undo removes them in one step', (await pageList().count()) === 1)
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
