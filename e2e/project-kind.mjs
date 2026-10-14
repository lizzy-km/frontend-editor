// The paste screen asks what you are making; both choices can start from a blank page.
import { check, editorFrame, OUT, openPage } from './browser.mjs'

const { browser, page, errors } = await openPage('/try')
const kinds = page.getByRole('radiogroup', { name: 'What are you making?' })
check('one page is chosen at first', (await kinds.getByRole('radio', { checked: true }).textContent()).includes('One page'))
await page.screenshot({ path: OUT + 'project-kind.png' })

// Blank one-page: no Pages tab
await page.getByRole('button', { name: 'Start with a blank page' }).click()
let { frame } = await editorFrame(page)
const sidebar = page.locator('aside').first()
check('blank page opens with a starter heading', (await frame.$eval('h1', (el) => el.textContent)) === 'Your new page')
check('a one-page project has no Pages tab', (await sidebar.getByRole('tab', { name: 'Pages' }).count()) === 0)
await page.getByRole('button', { name: 'Paste new code' }).click()
await page.waitForTimeout(500)

// Blank website: header, footer and a Pages tab with Home
await kinds.getByRole('radio', { name: /several pages/ }).click()
await page.getByRole('button', { name: 'Start with a blank page' }).click()
;({ frame } = await editorFrame(page))
check('blank website has a shared header and footer', (await frame.$$('header.site-header')).length === 1 && (await frame.$$('footer.site-footer')).length === 1)
await sidebar.getByRole('tab', { name: 'Pages' }).click()
check('blank website shows Home in Pages', (await sidebar.getByRole('list', { name: 'Pages' }).textContent()).includes('Home'))
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
