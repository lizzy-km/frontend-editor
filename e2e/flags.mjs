// Billing and the marketplace are development only for now (flags follow import.meta.env.DEV).
// Dev server (default): they exist. Production build: they are hidden. Check the build with
//   npx vite build && npx vite preview --port 4173   then   E2E_URL=http://localhost:4173 E2E_PRODUCTION=1 node e2e/flags.mjs
import { check, openPage } from './browser.mjs'

const production = Boolean(process.env.E2E_PRODUCTION)
const { browser, page, errors } = await openPage('/market')
await page.waitForTimeout(800)
const missing = () => page.getByText('We couldn\'t find that page').isVisible()
check(production ? '/market is hidden in the production build' : '/market exists while developing', production ? await missing() : !(await missing()))

await page.goto(page.url().replace('/market', '/plans'))
await page.waitForTimeout(800)
check(production ? '/plans is hidden in the production build' : '/plans exists while developing (signed-out people are sent to sign in)', production ? await missing() : !(await missing()))

if (!production) check('no console errors', errors.length === 0, errors.join(' | ')) // the preview server answers unknown addresses with a 404 status
await browser.close()
