/**
 * Pulls top-level @import / @charset rules out of a stylesheet so they can
 * stay first (they are invalid anywhere else, e.g. inside @layer).
 *
 * A real scanner, not a regex: Google Fonts URLs contain ";" and quotes
 * (…wght@400;500;700…), and cutting at the first ";" broke the whole sheet.
 */
export function splitImports(css: string): { imports: string[]; rest: string } {
  const imports: string[] = []
  let rest = ''
  let depth = 0 // { } nesting — only top-level rules are hoisted
  let index = 0

  while (index < css.length) {
    const char = css[index]!
    if (char === '/' && css[index + 1] === '*') {
      const end = css.indexOf('*/', index + 2)
      const stop = end === -1 ? css.length : end + 2
      rest += css.slice(index, stop)
      index = stop
      continue
    }
    if (char === '"' || char === "'") {
      const stop = endOfString(css, index)
      rest += css.slice(index, stop)
      index = stop
      continue
    }
    if (char === '{') depth++
    if (char === '}') depth = Math.max(0, depth - 1)
    if (depth === 0 && char === '@' && /^@(import|charset)\b/i.test(css.slice(index, index + 9))) {
      const stop = endOfStatement(css, index)
      imports.push(css.slice(index, stop).trim())
      index = stop
      continue
    }
    rest += char
    index++
  }
  return { imports, rest }
}

/** Index just after the closing quote (a string can't span a newline in CSS). */
function endOfString(css: string, start: number): number {
  const quote = css[start]
  for (let index = start + 1; index < css.length; index++) {
    if (css[index] === '\\') index++
    else if (css[index] === quote || css[index] === '\n') return index + 1
  }
  return css.length
}

/** Index just after the ";" ending an at-rule, skipping strings and url(...). */
function endOfStatement(css: string, start: number): number {
  let parens = 0
  for (let index = start; index < css.length; index++) {
    const char = css[index]
    if (char === '"' || char === "'") index = endOfString(css, index) - 1
    else if (char === '(') parens++
    else if (char === ')') parens = Math.max(0, parens - 1)
    else if (char === ';' && parens === 0) return index + 1
  }
  return css.length
}
