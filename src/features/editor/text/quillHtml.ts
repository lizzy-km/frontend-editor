/**
 * Quill always wraps text in <p> paragraphs. Headings, buttons and links
 * can't contain paragraphs, so paragraphs become line breaks instead.
 */
export function quillToInlineHtml(html: string): string {
  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((match) => match[1] ?? '')
  const lines = paragraphs.length > 0 ? paragraphs : [html]
  return lines
    .map((line) => line.replace(/^<br\s*\/?>$/, ''))
    .join('<br>')
    .replace(/&nbsp;/g, ' ')
    .replace(/(<br>)+$/, '')
}

/** Plain text -> safe HTML (used when setting a single piece of text). */
export function textToHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
