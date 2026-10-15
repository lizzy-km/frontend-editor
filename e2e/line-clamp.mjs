// Text > Max lines: cut long text after N lines with …; back to "No limit" cleans up; one undo step.
import { check, openExample } from './browser.mjs'

const { browser, page, frame, box, errors } = await openExample()
const panel = page.locator('aside').last()
const para = await box('.hero p')
await page.mouse.click(para.x + 10, para.y + 10)
await page.waitForTimeout(400)

const height = () => frame.$eval('.hero p', (el) => el.getBoundingClientRect().height)
const lineHeight = await frame.$eval('.hero p', (el) => parseFloat(getComputedStyle(el).lineHeight))
const before = await height()
check('the paragraph has more than one line to begin with', before > lineHeight * 1.5, `${before}px`)
check('the Text settings offer Max lines, starting at No limit', (await panel.getByLabel('Max lines', { exact: true }).inputValue()) === 'none')

await panel.getByLabel('Max lines', { exact: true }).selectOption('1')
await page.waitForTimeout(500)
const after = await height()
check('one line is shown', Math.abs(after - lineHeight) < 2, `${after}px`)
check('the rest ends with …', (await frame.$eval('.hero p', (el) => getComputedStyle(el).textOverflow)) === 'ellipsis')
check('the setting reads back as 1 line', (await panel.getByLabel('Max lines', { exact: true }).inputValue()) === '1')

await page.getByRole('button', { name: 'Preview' }).click()
const preview = page.frameLocator('iframe[title="Preview of your page"]')
await page.waitForTimeout(700)
const previewHeight = await preview.locator('.hero p').evaluate((el) => el.getBoundingClientRect().height)
check('Preview shows it too', previewHeight < before)
await page.keyboard.press('Escape')
await page.waitForTimeout(300)

await panel.getByLabel('Max lines', { exact: true }).selectOption('none')
await page.waitForTimeout(500)
check('No limit brings all the lines back', Math.abs((await height()) - before) < 2)
check('and the helper styles are gone', (await frame.$eval('.hero p', (el) => getComputedStyle(el).display)) !== '-webkit-box')

await page.mouse.click(12, 845)
await page.keyboard.press('Control+z')
await page.waitForTimeout(400)
check('undo goes back to the one-line limit in one step', Math.abs((await height()) - lineHeight) < 2)
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
