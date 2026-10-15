import type { PageDoc } from '@/features/editor/model/types'

/**
 * A page is saved as one text: its JSON, squeezed with gzip (then written as base64) when the browser can,
 * so about three times more fits in one saved page. "gz1:" at the start tells the two kinds apart.
 */
const MARK = 'gz1:'
const MIN_TO_SQUEEZE = 20_000

const toBase64 = (bytes: Uint8Array) => {
  let text = ''
  for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(text)
}
const fromBase64 = (text: string) => Uint8Array.from(atob(text), (char) => char.charCodeAt(0))

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const input = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(bytes); controller.close() } })
  return new Uint8Array(await new Response(input.pipeThrough(stream as unknown as ReadableWritablePair<Uint8Array, Uint8Array>)).arrayBuffer())
}

export async function packDoc(doc: PageDoc): Promise<string> {
  const json = JSON.stringify(doc)
  if (json.length < MIN_TO_SQUEEZE || typeof CompressionStream === 'undefined') return json
  const squeezed = `${MARK}${toBase64(await pipe(new TextEncoder().encode(json), new CompressionStream('gzip')))}`
  return squeezed.length < json.length ? squeezed : json
}

export async function unpackDoc(raw: string): Promise<PageDoc> {
  if (!raw.startsWith(MARK)) return JSON.parse(raw) as PageDoc
  if (typeof DecompressionStream === 'undefined') throw new Error('This browser can’t open this saved page.')
  return JSON.parse(new TextDecoder().decode(await pipe(fromBase64(raw.slice(MARK.length)), new DecompressionStream('gzip')))) as PageDoc
}
