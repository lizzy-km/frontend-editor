// Auth pages render; without Firebase keys they explain and point to Try it.
// (Real sign-in needs a Firebase project — covered manually / with the emulator.)
import { check, OUT, openPage } from './browser.mjs'

const { browser, page, errors } = await openPage('/login')
await page.waitForTimeout(800)
await page.screenshot({ path: OUT + 'auth-login.png' })
const configured = await page.getByLabel('Email').isVisible().catch(() => false)

if (configured) {
  check('login form shows', true)
  await page.goto(page.url().replace('/login', '/signup'))
  await page.waitForTimeout(500)
  check('signup form shows', await page.getByLabel('Your name').isVisible())
} else {
  check('explains accounts are off', await page.getByText('Accounts aren’t switched on yet.').isVisible())
  await page.getByRole('link', { name: 'Try it' }).click()
  await page.waitForTimeout(500)
  check('points to Try it', page.url().endsWith('/try'))
}

check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
