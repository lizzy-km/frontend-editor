import type { PageScript } from './types'

/**
 * While EDITING, the page's own JavaScript is off: it could fight the editor
 * (moving elements, sliders, popups). A few style-only libraries are allowed
 * because AI-made pages look broken without them. Everything runs in Preview.
 */
const TRUSTED_SCRIPT_PREFIXES = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@tailwindcss/browser',
  'https://unpkg.com/@tailwindcss/browser',
]

/**
 * `tailwind.config = { ... }` is allowed only when it is plain data: without
 * parentheses, "=", backticks or `new`, a JS object literal cannot call code.
 */
export function isPlainTailwindConfig(code = ''): boolean {
  const match = code.trim().match(/^tailwind\.config\s*=\s*(\{[\s\S]*\})\s*;?$/)
  return Boolean(match?.[1] && !/[()`=]|\bnew\b|\bimport\b/.test(match[1]))
}

export function runsWhileEditing(script: PageScript): boolean {
  if (script.src) return TRUSTED_SCRIPT_PREFIXES.some((prefix) => script.src!.startsWith(prefix))
  return isPlainTailwindConfig(script.code)
}

/** Blocks inline event handlers and javascript: links inside the editor. */
export function isSafeEditorAttribute(name: string, value: string): boolean {
  if (name.startsWith('on')) return false
  return !(/^(href|src|action|formaction|xlink:href)$/.test(name) && /^\s*javascript:/i.test(value))
}
