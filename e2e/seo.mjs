// SEO: each screen has its own title, description and robots; moving around the app updates them; structured data appears; nothing is doubled.
import { check, openPage } from './browser.mjs'

const { browser, page, errors } = await openPage('/')
const head = async () => page.evaluate(() => ({
  title: document.title,
  descriptions: document.querySelectorAll('meta[name="description"]').length,
  description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
  robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '',
  titles: document.querySelectorAll('title').length,
  ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((el) => JSON.parse(el.textContent ?? '{}')['@type']),
  ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? '',
}))
await page.waitForTimeout(800)
let h = await head()
check('home: title, one description, indexable', h.title.startsWith('Tweak —') && h.descriptions === 1 && h.robots.startsWith('index'), JSON.stringify(h))
check('home: structured data for the app', ['Organization', 'WebSite', 'SoftwareApplication'].every((type) => h.ld.includes(type)), h.ld.join(','))
check('home: the share title matches', h.ogTitle === h.title)

// Moving around the app keeps the head right (no page reload)
await page.getByRole('link', { name: 'Guide', exact: true }).first().click()
await page.waitForTimeout(600)
h = await head()
check('guide: its own title and description', h.title.startsWith('Quick guide') && h.descriptions === 1 && h.titles === 1, JSON.stringify(h))
check('guide: breadcrumb data, and the home data is gone', h.ld.includes('BreadcrumbList') && !h.ld.includes('SoftwareApplication'), h.ld.join(','))
await page.getByRole('tab', { name: 'Full guide' }).click()
await page.waitForTimeout(600)
h = await head()
check('full guide: title and how-to data for the recipes', h.title.startsWith('Full guide') && h.ld.filter((type) => type === 'HowTo').length >= 4, h.ld.join(','))

for (const [path, titlePart, indexed] of [['/gallery', 'Explore', true], ['/try', 'Try Tweak', true], ['/login', 'Sign in', false], ['/signup', 'Create a free account', false], ['/this-does-not-exist', 'not found', false]]) {
  await page.goto(`http://localhost:5317${path}`)
  await page.waitForTimeout(700)
  h = await head()
  check(`${path}: title "${titlePart}", ${indexed ? 'indexable' : 'noindex'}`, h.title.includes(titlePart) && h.robots.startsWith(indexed ? 'index' : 'noindex') && h.descriptions === 1, JSON.stringify(h))
}
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
