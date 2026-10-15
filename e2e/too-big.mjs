// A page too big to save: the real reason is shown, pasted pictures are found, the fix is offered; saving packs pages in real Chrome.
import { check, openExample, pasteCode } from './browser.mjs'

const { browser, page, frame, errors } = await openExample()
const loader = `(part, fallback) => import(performance.getEntriesByType('resource').map((entry) => entry.name).find((name) => name.includes(part)) ?? fallback)`


// the page is saved squeezed and reads back the same (real browser streams)
const round = await page.evaluate(async (LOADER) => {
  const { packDoc, unpackDoc } = await (eval(LOADER))('packDoc.ts', '/src/features/workspace/api/packDoc.ts')
  const { useDocStore } = await (eval(LOADER))('doc.store.ts', '/src/features/editor/store/doc.store.ts')
  const base = useDocStore.getState().doc
  const doc = { ...base, css: base.css + '\n' + '.x{color:red}\n'.repeat(5000) }
  const packed = await packDoc(doc)
  return { squeezed: packed.startsWith('gz1:'), smaller: packed.length < JSON.stringify(doc).length / 3, same: JSON.stringify(await unpackDoc(packed)) === JSON.stringify(doc) }
}, loader)
check('a big page is saved squeezed, and reads back exactly', round.squeezed && round.smaller && round.same, JSON.stringify(round))

// a picture pasted inside the code
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
await page.evaluate(async ([uri, LOADER]) => {
  const { useDocStore } = await (eval(LOADER))('doc.store.ts', '/src/features/editor/store/doc.store.ts')
  const state = useDocStore.getState()
  const img = Object.values(state.doc.nodes).find((node) => node.kind === 'element' && node.tag === 'img')
  state.commit({ ...state.doc, nodes: { ...state.doc.nodes, [img.id]: { ...img, attrs: { ...img.attrs, src: uri } } } })
}, [PNG, loader])
await page.waitForTimeout(400)

// pretend the account save said "too big"
await page.evaluate(async (LOADER) => {
  const { useSaveStore } = await (eval(LOADER))('save.store.ts', '/src/features/editor/persistence/save.store.ts')
  useSaveStore.getState().setStatus('error', 'This page is too big to save to your account (Pictures pasted inside the code take about 3.2 MB). You can still download it.')
}, loader)
await page.waitForTimeout(300)
const status = page.getByRole('status').filter({ hasText: 'Too big to save' })
check('the indicator says it is too big, not "check your connection"', await status.isVisible())
check('with the reason on hover', ((await status.getAttribute('title')) ?? '').includes('Pictures pasted inside the code'))
const move = page.getByRole('button', { name: 'Move pictures out of the code' })
check('and offers to move pasted pictures out', await move.isVisible())
await move.click()
await page.waitForTimeout(600)
check('without an upload service it explains instead of failing', await page.getByText(/can’t be uploaded right now/).first().isVisible())

// no pictures pasted: no button
await page.evaluate(async (LOADER) => {
  const { useDocStore } = await (eval(LOADER))('doc.store.ts', '/src/features/editor/store/doc.store.ts')
  const { replaceEmbedded, embeddedPictures } = await (eval(LOADER))('embedded.ts', '/src/features/editor/model/embedded.ts')
  const state = useDocStore.getState()
  const map = Object.fromEntries(embeddedPictures(state.doc).map((uri) => [uri, 'https://cdn.test/a.png']))
  state.commit(replaceEmbedded(state.doc, map))
}, loader)
await page.waitForTimeout(300)
check('once nothing is pasted any more the button goes', (await page.getByRole('button', { name: 'Move pictures out of the code' }).count()) === 0)
const unexpected = errors.filter((text) => !text.includes('cdn.test'))
check('no console errors', unexpected.length === 0, unexpected.join(' | '))
await browser.close()
