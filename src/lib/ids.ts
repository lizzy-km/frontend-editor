const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'

/** Short random id, e.g. "k3x9q2ab". Good enough for node ids inside one page. */
export function createId(length = 8): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  let id = ''
  for (const byte of bytes) id += ALPHABET[byte % ALPHABET.length]
  return id
}
