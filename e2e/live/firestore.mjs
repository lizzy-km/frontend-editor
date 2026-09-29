// Live Firestore smoke test — needs a real .env and deployed rules/indexes.
// Run: E2E_URL=http://localhost:<port> node e2e/live/firestore.mjs (not part of npm run e2e).
// Visits the pages that read Firestore and fails on any Firestore/abort error.
import { check, openPage } from '../browser.mjs'

const { browser, page, errors } = await openPage('/gallery')
await page.waitForTimeout(3000)
const empty = await page.getByText(/No shared pages yet|Nothing to explore yet/).isVisible()
const cards = await page.locator('a[href^="/p/"]').count()
check('gallery loads from Firestore (cards or empty state)', empty || cards > 0, `${cards} cards`)
check('gallery did not fail to load', !(await page.getByText('We couldn’t load pages right now').isVisible()))

await page.goto(page.url().replace('/gallery', '/p/does-not-exist'))
await page.waitForTimeout(2500)
check('private/missing page handled', await page.getByText('This page isn’t shared').isVisible())

await page.goto(page.url().replace(/\/p\/.*$/, '/login'))
await page.waitForTimeout(1500)
check('login form shows (accounts on)', await page.getByLabel('Email').isVisible())

const bad = errors.filter((error) => /abort|firestore|webchannel/i.test(error))
check('no Firestore / abort errors in the console', bad.length === 0, bad.join(' | '))
await browser.close()
