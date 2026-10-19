// Marketplace (development only): the public screens open without accounts and say so in plain words; the private ones ask people to sign in.
// Buying, selling and payouts need accounts and the billing Worker, so they are covered by unit tests (workers/billing) and the rules tests.
import { check, openPage } from './browser.mjs'

const { browser, page, errors } = await openPage('/')
// Stand in for the database: nothing for sale, and no such listing (so these checks never depend on what is deployed).
await page.route('https://firestore.googleapis.com/**', (route) => {
  const request = route.request()
  const readTime = '2026-10-20T00:00:00Z'
  const reply = (body) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  if (request.url().includes(':batchGet')) return reply(JSON.parse(request.postData()).documents.map((name) => ({ missing: name, readTime })))
  return reply([]) // a query with no results
})
await page.goto(page.url().replace(/\/$/, '') + '/market')
await page.waitForTimeout(1000)
check('browse: the marketplace opens', await page.getByRole('heading', { name: 'Marketplace' }).isVisible())
check('browse: an empty market says so in plain words', await page.getByText('Nothing for sale yet').first().isVisible())
check('browse: search and sort are there', (await page.getByLabel('Search pages').isVisible()) && (await page.getByLabel('Sort pages').isVisible()))
check('browse: the top bar offers sign in', await page.getByRole('link', { name: 'Sign in' }).isVisible())

await page.goto(page.url().replace(/\/market$/, '/market/some-listing'))
await page.waitForTimeout(800)
check('a listing that does not exist says so', await page.getByText('This page is not for sale').isVisible())

for (const path of ['sell', 'orders', 'earnings']) {
  await page.goto(page.url().replace(/\/market\/.*$/, `/market/${path}`))
  await page.waitForTimeout(800)
  check(`/market/${path} asks to sign in`, page.url().includes('/login') || (await page.getByText(/sign in/i).first().isVisible()))
}
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
