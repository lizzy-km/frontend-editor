// Explore and public pages. Without Firebase keys they must fail gracefully.
import { check, OUT, openPage } from './browser.mjs'

const { browser, page, errors } = await openPage('/gallery')
await page.waitForTimeout(1200)
await page.screenshot({ path: OUT + 'gallery.png' })
check('gallery heading', await page.getByRole('heading', { name: 'Explore pages' }).isVisible())
const empty = await page.getByText(/Nothing to explore yet|No shared pages yet/).isVisible()
const cards = await page.locator('a[href^="/p/"]').count()
check('gallery shows cards or a friendly empty state', empty || cards > 0)

await page.goto(page.url().replace('/gallery', '/p/does-not-exist'))
await page.waitForTimeout(1500)
check('unknown page explains itself', await page.getByText('This page isn’t shared').isVisible())
await page.getByRole('link', { name: 'Explore other pages' }).click()
await page.waitForTimeout(500)
check('links back to Explore', page.url().endsWith('/gallery'))

// Without Firebase config, calls fail and are caught; nothing else should be logged.
const unexpected = errors.filter((error) => !/Firebase is not configured/.test(error))
check('no unexpected console errors', unexpected.length === 0, unexpected.join(' | '))
await browser.close()
