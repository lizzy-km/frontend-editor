import type { StyleMap } from '../types'

/**
 * Splits `a: 1; b: url(x;y)` into declarations. Semicolons inside quotes or
 * parentheses (data URLs, gradients) do not end a declaration.
 */
function splitDeclarations(text: string): string[] {
  const parts: string[] = []
  let depth = 0
  let quote = ''
  let current = ''
  for (const char of text) {
    if (quote) {
      if (char === quote) quote = ''
    } else if (char === '"' || char === "'") quote = char
    else if (char === '(') depth++
    else if (char === ')') depth = Math.max(0, depth - 1)
    else if (char === ';' && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += char
  }
  parts.push(current)
  return parts
}

/** "color: red; font-size: 2rem" -> { color: 'red', 'font-size': '2rem' } */
export function parseStyleText(text: string): StyleMap {
  const styles: StyleMap = {}
  for (const declaration of splitDeclarations(text)) {
    const colon = declaration.indexOf(':')
    if (colon < 1) continue
    const property = declaration.slice(0, colon).trim().toLowerCase()
    const value = declaration.slice(colon + 1).trim()
    if (property && value) styles[property] = value
  }
  return styles
}

/** Inverse of parseStyleText. */
export function stringifyStyle(styles: StyleMap): string {
  return Object.entries(styles).map(([property, value]) => `${property}: ${value}`).join('; ')
}
