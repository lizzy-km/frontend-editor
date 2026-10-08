// "No code yet?" helper on the paste screen: pick an idea, edit it, copy the prompt.
import { check, OUT, openPage } from './browser.mjs'

const { browser, page, errors } = await openPage('/try')
await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(page.url()).origin })

const helper = page.locator('details', { has: page.getByText('No code yet?') }).first()
check('helper starts folded', (await helper.getAttribute('open')) === null)
await page.getByText('No code yet?').click()
const everyday = await page.getByRole('radiogroup', { name: 'Everyday pages' }).getByRole('radio').count()
const portfolios = await page.getByRole('radiogroup', { name: 'Portfolios' }).getByRole('radio').count()
check('ideas grouped: everyday pages and portfolios', everyday >= 9 && portfolios >= 12, `${everyday} + ${portfolios}`)

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
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
