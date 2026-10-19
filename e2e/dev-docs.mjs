// Developer docs (/dev, development server only): overview, workflow diagrams, architecture, code reference, rules, history. Hidden: nothing links to it.
import { check, openPage } from './browser.mjs'

const { browser, page, errors } = await openPage('/')
await page.waitForTimeout(800)
check('nothing on the home page links to /dev', (await page.locator('a[href^="/dev"]').count()) === 0)
await page.goto('http://localhost:5317/guide'); await page.waitForTimeout(500)
check('nothing in the guide links to /dev', (await page.locator('a[href^="/dev"]').count()) === 0)

await page.goto('http://localhost:5317/dev'); await page.waitForTimeout(2500)
check('the page opens in development', await page.getByRole('heading', { name: 'Tweak developer docs' }).isVisible())
check('it says it is for development only', await page.getByText('Development only').first().isVisible())
check('it is not indexed', (await page.locator('meta[name="robots"]').getAttribute('content')) === 'noindex, nofollow')

// Overview: facts read from the project
check('overview: numbers and the routes table', (await page.getByText('Source files').isVisible()) && (await page.locator('table tbody tr').count()) > 15)
check('overview: the /dev route says development only', (await page.locator('tr', { hasText: '/dev' }).first().innerText()).includes('development only'))
check('overview: feature flags and settings are listed', (await page.getByText('enable_oauth').isVisible()) && (await page.getByText('VITE_SITE_URL').isVisible()))

// Workflow
await page.getByRole('tab', { name: 'Workflow' }).click()
check('workflow: twelve diagrams (nine workflow, three ER)', (await page.getByRole('navigation', { name: 'Diagrams' }).getByRole('button').count()) === 12)
await page.getByRole('navigation', { name: 'Diagrams' }).getByRole('button', { name: /Reusable components/ }).click()
await page.waitForTimeout(600)
check('workflow: the diagram picture shows', await page.locator('img[alt="Reusable components"]').isVisible())
await page.getByRole('button', { name: 'Mermaid source' }).click()
await page.waitForTimeout(500)
check('workflow: the Mermaid source shows', (await page.locator('pre').innerText()).includes('sequenceDiagram'))
await page.getByRole('navigation', { name: 'Diagrams' }).getByRole('button', { name: /System architecture/ }).click()
await page.getByRole('button', { name: 'Picture' }).click().catch(() => {})
await page.waitForTimeout(400)

// Architecture: the repo's ARCHITECTURE.md with a table of contents
await page.getByRole('tab', { name: 'Architecture' }).click()
await page.waitForTimeout(1200)
check('architecture: the document shows', (await page.getByRole('heading', { name: 'Architecture', exact: true }).isVisible()) && (await page.getByRole('heading', { name: 'Stack' }).isVisible()))
check('architecture: it has a table of contents with the newest sections', (await page.getByRole('navigation', { name: 'On this page' }).getByText(/Reusable components/).count()) > 0)

// Code reference: read from the source
await page.getByRole('tab', { name: 'Code reference' }).click()
await page.getByText(/exports,/).waitFor({ timeout: 30000 })
const stats = await page.getByText(/exports,/).innerText()
check('code reference: counts the source files', /\d{3} files/.test(stats), stats)
await page.getByLabel('Search the code').fill('propagate')
await page.waitForTimeout(500)
const results = await page.locator('ul li').allInnerTexts()
check('code reference: search finds propagate with its comment', results.some((text) => text.includes('propagate') && text.includes('Carries') || text.includes('propagate') && text.includes('main component')), results[0] ?? '')
await page.getByLabel('Search the code').fill('')

// Rules and history
await page.getByRole('tab', { name: 'Rules' }).click()
await page.waitForTimeout(1000)
check('rules: the project rules show', (await page.getByRole('heading', { name: /Adding a feature|Editor model/ }).count()) > 0)
await page.getByRole('tab', { name: 'History' }).click()
await page.waitForTimeout(1000)
check('history: the newest entry is there', (await page.getByRole('heading', { name: /dev-docs|workflow-diagrams|reusable-components/ }).count()) > 0)
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
