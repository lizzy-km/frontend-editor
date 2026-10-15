// Open a React project from Tweak again: .zip, folder, a changed file, and a folder from somewhere else.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
import { allowTryDownloads, check, editorFrame, openExample, OUT } from './browser.mjs'

const { browser, page, errors } = await openExample()
await allowTryDownloads(page)
await page.getByRole('button', { name: 'Paste new code' }).click()
await page.getByLabel('Your code').fill('<!doctype html><html><head><title>Bread</title></head><body><section><h1>Fresh bread</h1></section><footer>Bye</footer></body></html>')
await page.getByRole('button', { name: 'Open in editor' }).click()
await editorFrame(page)
await page.getByRole('button', { name: 'Download', exact: true }).click()
const [file] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /React project/ }).click()])
const zipPath = OUT + 'reimport-source.zip'
await file.saveAs(zipPath)
const files = unzipSync(readFileSync(zipPath))
check('the download carries the hidden .tweak file', Object.keys(files).some((name) => name.endsWith('/.tweak/project.json')))
await page.keyboard.press('Escape')

const startScreen = async () => { await page.getByRole('button', { name: 'Paste new code' }).click(); await page.getByText('Already have a React project').waitFor() }
const headline = async () => { const { frame } = await editorFrame(page); return frame.$eval('h1', (el) => el.textContent) }

// 1) the .zip, untouched
await startScreen()
await page.getByLabel('React project .zip').setInputFiles(zipPath)
check('the .zip opens the same page', (await headline()).includes('Fresh bread'))

// 2) a folder
const folder = OUT + 'reimport-folder'
rmSync(folder, { recursive: true, force: true })
for (const [name, bytes] of Object.entries(files)) {
  const target = `${folder}/${name}`
  mkdirSync(target.slice(0, target.lastIndexOf('/')), { recursive: true })
  writeFileSync(target, bytes)
}
await startScreen()
await page.getByLabel('React project folder').setInputFiles(`${folder}/${Object.keys(files)[0].split('/')[0]}`)
check('a folder opens the same page', (await headline()).includes('Fresh bread'))

// 3) a file changed outside Tweak: warned first, opens only after "Open anyway"
const changed = { ...files }
const appPath = Object.keys(files).find((name) => name.endsWith('src/App.tsx'))
changed[appPath] = strToU8(strFromU8(files[appPath]) + '\n// my change')
writeFileSync(OUT + 'reimport-changed.zip', zipSync(changed))
await startScreen()
await page.getByLabel('React project .zip').setInputFiles(OUT + 'reimport-changed.zip')
await page.getByText('changed outside Tweak').waitFor()
check('a changed file is named in the warning', (await page.getByText('changed outside Tweak').textContent()).includes('src/App.tsx'))
await page.getByRole('button', { name: 'Open anyway' }).click()
check('"Open anyway" opens it', (await headline()).includes('Fresh bread'))

// 4) a zip that still contains node_modules (20 MB) and .git: they are left out, the project opens
const withModules = { ...files }
const root = Object.keys(files)[0].split('/')[0]
withModules[`${root}/node_modules/big/index.js`] = strToU8('x'.repeat(20 * 1024 * 1024))
withModules[`${root}/.git/HEAD`] = strToU8('ref: refs/heads/main')
writeFileSync(OUT + 'reimport-modules.zip', zipSync(withModules))
await startScreen()
const started = Date.now()
await page.getByLabel('React project .zip').setInputFiles(OUT + 'reimport-modules.zip')
check('a zip with node_modules still opens the page', (await headline()).includes('Fresh bread'), `${Date.now() - started} ms`)

// 5) a zip that Tweak did not make
const other = { ...files }
for (const name of Object.keys(other)) if (name.includes('.tweak/')) delete other[name]
writeFileSync(OUT + 'reimport-other.zip', zipSync(other))
await startScreen()
await page.getByLabel('React project .zip').setInputFiles(OUT + 'reimport-other.zip')
await page.getByText('wasn’t downloaded from Tweak').waitFor()
check('a project without .tweak is refused kindly', true)
check('no console errors', errors.length === 0, errors.join(' | '))
rmSync(folder, { recursive: true, force: true })
await browser.close()
