/** Elements that never have a closing tag. */
export const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr',
])

export function escapeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

/** Stops user code from closing the <script>/<style> tag it lives in. */
export function escapeRawTag(code: string, tag: 'script' | 'style'): string {
  return code.replace(new RegExp(`</${tag}`, 'gi'), `<\\/${tag}`)
}

/**
 * Keeps a CSS value from breaking out of its rule block or the <style> tag.
 * ";" is allowed on purpose: data URLs need it and it can't escape the rule.
 */
export function sanitizeCssValue(value: string): string {
  return value.replace(/[{}<]/g, '').trim()
}

/** Only allow sane CSS property names (letters, digits, dashes). */
export function isValidCssProperty(property: string): boolean {
  return /^-{0,2}[a-z][a-z0-9-]*$/i.test(property)
}
