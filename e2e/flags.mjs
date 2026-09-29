// Future features stay hidden while their flags are off.
import { check, openPage } from './browser.mjs'

const { browser, page, errors } = await openPage('/market')
await page.waitForTimeout(800)
check('/market is hidden (flag off)', await page.getByText('We couldn\'t find that page').isVisible())

await page.goto(page.url().replace('/market', '/plans'))
await page.waitForTimeout(800)
check('/plans is hidden (flag off)', await page.getByText('We couldn\'t find that page').isVisible())

check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
