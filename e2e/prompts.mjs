// "No code yet?" helper on the paste screen: pick an idea, edit it, copy the prompt.
import { check, OUT, openPage } from './browser.mjs'

const { browser, page, errors } = await openPage('/try')
await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(page.url()).origin })

const helper = page.locator('details', { has: page.getByText('No code yet?') }).first()
check('helper starts folded', (await helper.getAttribute('open')) === null)
await page.getByText('No code yet?').click()
const chips = page.getByRole('radiogroup', { name: 'Page idea' }).getByRole('radio')
check('blank + 10 ideas', (await chips.count()) === 11, String(await chips.count()))

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
check('AI links open in a new tab', (await page.getByRole('link', { name: /Open ChatGPT/ }).getAttribute('target')) === '_blank')
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
