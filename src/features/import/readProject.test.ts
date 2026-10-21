import { zipSync, strToU8 } from 'fflate'
import { describe, expect, it } from 'vitest'
import { readFolder, readZip, type ReadProgress } from './readProject'

describe('reading a project reports its progress', () => {
  it('a .zip reports bytes read, ending at the full size', async () => {
    const bytes = zipSync({ 'app/package.json': strToU8('{}'), 'app/src/main.tsx': strToU8('x'.repeat(5000)) })
    // jsdom's File has no stream(), which readZip uses in the browser
    const file = Object.assign(new File([bytes], 'app.zip'), { stream: () => new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(bytes); controller.close() } }) })
    const seen: ReadProgress[] = []
    const files = await readZip(file, (progress) => seen.push(progress))
    expect(Object.keys(files)).toContain('src/main.tsx')
    expect(seen.length).toBeGreaterThan(0)
    expect(seen.at(-1)!.done).toBe(file.size)
    expect(seen.at(-1)!.total).toBe(file.size)
  })

  it('a folder reports files read, skipping the ones it never opens', async () => {
    const make = (path: string) => Object.assign(new File(['x'], path.split('/').pop()!), { webkitRelativePath: path })
    const list = [make('p/package.json'), make('p/src/a.ts'), make('p/node_modules/x/i.js')] as unknown as FileList
    const seen: ReadProgress[] = []
    await readFolder(list, (progress) => seen.push(progress))
    expect(seen.map((item) => item.done)).toEqual([1, 2])
    expect(seen.every((item) => item.total === 2)).toBe(true)
  })
})
