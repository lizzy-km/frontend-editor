// Pictures from the computer: without the uploads worker, small ones are embedded.
import { check, openExample } from './browser.mjs'

// 1x1 transparent PNG
const DOT = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')

const { browser, page, frame, box, errors } = await openExample()

const img = await box('.hero img')
await page.mouse.move(img.x + 40, img.y + 40)
await page.mouse.click(img.x + 40, img.y + 40)
await page.getByRole('toolbar', { name: 'Quick actions' }).getByRole('button', { name: 'Change picture' }).click()

await page.locator('dialog input[type="file"]').setInputFiles({ name: 'dot.png', mimeType: 'image/png', buffer: DOT })
await page.waitForTimeout(300)
check('shows "using your picture" instead of a huge address', await page.getByPlaceholder('Using the picture from your computer').isVisible())
await page.getByRole('button', { name: 'Use this picture' }).click()
await page.waitForTimeout(300)
check('picture embedded in the page', (await frame.$eval('.hero img', (el) => el.getAttribute('src'))).startsWith('data:image/png'))

// SVG is refused with a friendly message
await page.getByRole('toolbar', { name: 'Quick actions' }).getByRole('button', { name: 'Change picture' }).click()
await page.locator('dialog input[type="file"]').setInputFiles({ name: 'x.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') })
await page.waitForTimeout(300)
check('svg refused kindly', await page.getByText(/PNG, JPG, WebP/).isVisible())

check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
