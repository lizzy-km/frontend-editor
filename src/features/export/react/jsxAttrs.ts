/** HTML attribute names React spells differently. */
const RENAMED: Record<string, string> = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength',
  minlength: 'minLength', colspan: 'colSpan', rowspan: 'rowSpan', srcset: 'srcSet', crossorigin: 'crossOrigin',
  autoplay: 'autoPlay', playsinline: 'playsInline', autocomplete: 'autoComplete', autofocus: 'autoFocus',
  enterkeyhint: 'enterKeyHint', contenteditable: 'contentEditable', spellcheck: 'spellCheck', datetime: 'dateTime',
  frameborder: 'frameBorder', allowfullscreen: 'allowFullScreen', novalidate: 'noValidate', formnovalidate: 'formNoValidate',
  accesskey: 'accessKey', inputmode: 'inputMode', referrerpolicy: 'referrerPolicy', fetchpriority: 'fetchPriority',
  usemap: 'useMap', cellpadding: 'cellPadding', cellspacing: 'cellSpacing', hreflang: 'hrefLang', enctype: 'encType',
  'accept-charset': 'acceptCharset', 'http-equiv': 'httpEquiv', 'xlink:href': 'xlinkHref', 'xml:space': 'xmlSpace',
  'xml:lang': 'xmlLang', 'xmlns:xlink': 'xmlnsXlink', srcdoc: 'srcDoc', marginheight: 'marginHeight', marginwidth: 'marginWidth',
}

/** Attributes that are on/off. In React they take true/false, never "". */
export const BOOLEAN_ATTRS = new Set(['disabled', 'required', 'hidden', 'open', 'multiple', 'muted', 'loop', 'controls',
  'playsinline', 'readonly', 'novalidate', 'formnovalidate', 'allowfullscreen', 'async', 'defer', 'itemscope', 'inert',
  'reversed', 'autoplay', 'autofocus', 'default', 'nomodule', 'checked', 'selected'])

const camel = (name: string) => name.replace(/[-:]([a-z])/g, (_, letter: string) => letter.toUpperCase())

/** Attributes React types as numbers (rows={3}, tabIndex={0}). */
const NUMBER_ATTRS = new Set(['rows', 'cols', 'tabindex', 'colspan', 'rowspan', 'maxlength', 'minlength', 'size', 'span', 'start'])

/** Inline handlers (onclick="…") keep working: React can't take strings, so they ride along as data-on* and are restored after mount. */
export const HANDLER_PREFIX = 'data-on'

/**
 * The React name of an attribute, or null to leave it out. Form defaults
 * become defaultValue / defaultChecked so fields stay editable.
 */
export function jsxAttrName(tag: string, name: string, inSvg: boolean): string | null {
  const lower = name.toLowerCase()
  if (lower.startsWith('on')) return `${HANDLER_PREFIX}${lower.slice(2)}`
  if (lower === 'style' || lower === 'selected') return null // styles live in the CSS; <select> gets defaultValue
  if (lower === 'value' && ['input', 'textarea', 'select'].includes(tag)) return 'defaultValue'
  if (lower === 'checked' && tag === 'input') return 'defaultChecked'
  if (lower.startsWith('data-') || lower.startsWith('aria-')) return lower
  if (RENAMED[lower]) return RENAMED[lower]!
  if (inSvg && /[-:]/.test(name)) return camel(name)
  return name
}

/** A string as a JSX attribute value: "…" when safe, otherwise {"…"}. */
export function jsxString(value: string): string {
  return /["\\{}\n]|&[#\w]+;/.test(value) ? `{${JSON.stringify(value)}}` : `"${value}"`
}

/** One attribute in JSX form (` name="value"`), or '' when it is left out. */
export function jsxAttr(tag: string, name: string, value: string, inSvg: boolean): string {
  const jsxName = jsxAttrName(tag, name, inSvg)
  if (!jsxName) return ''
  if (BOOLEAN_ATTRS.has(name.toLowerCase()) && (value === '' || value.toLowerCase() === name.toLowerCase())) return ` ${jsxName}`
  if (NUMBER_ATTRS.has(name.toLowerCase()) && /^-?\d+$/.test(value.trim())) return ` ${jsxName}={${value.trim()}}`
  return ` ${jsxName}=${jsxString(value)}`
}
