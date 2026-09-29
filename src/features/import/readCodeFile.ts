const MAX_FILE_BYTES = 5 * 1024 * 1024

/** Reads a dropped/picked .html (or .txt) file as text. */
export async function readCodeFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) throw new Error('That file is bigger than 5 MB — is it really a web page?')
  if (!/\.(html?|txt|htm)$/i.test(file.name) && !file.type.startsWith('text/')) {
    throw new Error('Please pick an .html file.')
  }
  return file.text()
}
