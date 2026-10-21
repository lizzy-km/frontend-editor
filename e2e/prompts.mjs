// "No code yet?" helper on the paste screen: pick an idea, edit it, copy the prompt.
import { check, OUT, openPage } from './browser.mjs'

const { browser, page, errors } = await openPage('/try')
await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(page.url()).origin })

const helper = page.locator('details', { has: page.getByText('No code yet?') }).first()
check('helper starts folded', (await helper.getAttribute('open')) === null)
await page.getByText('No code yet?').click()
const counts = []
for (const group of ['Business & services', 'Brands & launches', 'Events & celebrations', 'Portfolios']) {
  counts.push(await page.getByRole('radiogroup', { name: group }).getByRole('radio').count())
}
check('ideas grouped into 4 kinds of page', counts.every((count) => count >= 6), counts.join(' + '))

await page.getByRole('radio', { name: /Wedding/ }).click()
const brief = page.getByLabel('Your page (change anything)')
check('brief follows the chosen idea', (await brief.inputValue()).includes('Sofia & James'))
await brief.fill((await brief.inputValue()).replace('Sofia & James', 'Ana & Leo'))
await page.screenshot({ path: OUT + 'ai-prompt-helper.png', fullPage: true })

await page.getByRole('button', { name: 'Copy prompt' }).click()
await page.waitForTimeout(300)
const copied = await page.evaluate(() => navigator.clipboard.readText())
check('copied prompt has the edited brief', copied.includes('Ana & Leo') && !copied.includes('Sofia & James'))
check('copied prompt has the editor rules', copied.includes('PART 2') && copied.includes('@media (max-width: 640px)'))
check('copied prompt asks for an eye-catching design', copied.includes('MAKE IT EYE-CATCHING'))

await page.getByRole('radiogroup', { name: 'Portfolios' }).getByRole('radio', { name: /Developer/ }).click()
await page.getByRole('button', { name: 'Copy prompt' }).click()
await page.waitForTimeout(300)
const portfolio = await page.evaluate(() => navigator.clipboard.readText())
check('portfolio prompt uses the portfolio intro', portfolio.includes('portfolio website') && portfolio.includes('Arjun Mehta'))
check('AI links open in a new tab', (await page.getByRole('link', { name: /Open ChatGPT/ }).getAttribute('target')) === '_blank')
// A React project (TypeScript): the third choice
await page.getByRole('radio', { name: /A React project/ }).click()
check('React choice: the brief asks for the features it needs', (await brief.inputValue()).includes('Features it needs'))
await page.getByRole('radiogroup', { name: 'Business & services' }).getByRole('radio', { name: /Cafe|Café|Restaurant/i }).first().click()
await page.getByRole('button', { name: 'Copy prompt' }).click()
await page.waitForTimeout(300)
const react = await page.evaluate(() => navigator.clipboard.readText())
check('React prompt asks for a multi-page React + TypeScript project', react.includes('multi-page React + TypeScript web app') && react.includes('PART 2 — OUTPUT RULES FOR A REACT + TYPESCRIPT PROJECT'))
check('React prompt has the stack, folders, sign-in and mock data rules', ['react-router', 'src/features/<name>/', 'ProtectedRoute', 'VITE_USE_MOCK', 'admin@example.com'].every((text) => react.includes(text)))
check('React prompt is not the single html page rules', !react.includes('ONE html code block') && !react.includes('PART 3'))
check('React choice: step 3 says it does not open in Tweak', await page.getByText('does not open in Tweak').isVisible())
await page.getByRole('radio', { name: /A web page/ }).click()
check('back to a web page: the brief loses the React-only line', !(await brief.inputValue()).includes('Features it needs'))
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
