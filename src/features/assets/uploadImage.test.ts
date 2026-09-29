import { describe, expect, it } from 'vitest'
import { MAX_EMBED_BYTES, pictureFromFile } from './uploadImage'

// No VITE_ASSETS_URL in tests -> uploads are off -> small pictures are embedded.
describe('pictureFromFile without uploads', () => {
  it('embeds a small picture as a data address', async () => {
    const file = new File([new Uint8Array([137, 80, 78, 71])], 'dot.png', { type: 'image/png' })
    await expect(pictureFromFile(file)).resolves.toMatch(/^data:image\/png;base64,/)
  })

  it('refuses SVG (it can carry scripts)', async () => {
    const file = new File(['<svg/>'], 'x.svg', { type: 'image/svg+xml' })
    await expect(pictureFromFile(file)).rejects.toThrow(/PNG, JPG/)
  })

  it('explains when a picture is too big to embed', async () => {
    const file = new File([new Uint8Array(MAX_EMBED_BYTES + 1)], 'big.jpg', { type: 'image/jpeg' })
    await expect(pictureFromFile(file)).rejects.toThrow(/too big/)
  })
})
