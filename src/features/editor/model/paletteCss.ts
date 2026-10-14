import { recolor, scanColors, type ColorToken } from '@/lib/colorTokens'

/**
 * Colors in a page's CSS text. Only declaration blocks are read (so an id
 * selector like #fade is never a color), comments are ignored, and a
 * declaration like `--primary: #c2410c` is a theme color: its token is kept
 * apart from the literal colors.
 */
export type CssVarColor = { name: string; token: ColorToken }
export type CssColors = { literals: ColorToken[]; vars: CssVarColor[] }

const maskComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, (comment) => ' '.repeat(comment.length))

export function scanCss(css: string): CssColors {
  const text = maskComments(css)
  const literals: ColorToken[] = []
  const vars: CssVarColor[] = []
  for (const block of text.matchAll(/\{([^{}]*)\}/g)) {
    const base = block.index! + 1
    const body = block[1]!
    const own = new Set<number>()
    for (const decl of body.matchAll(/(--[\w-]+)\s*:\s*([^;]*)/g)) {
      const value = decl[2]!
      const start = decl.index! + decl[0].length - value.length
      const tokens = scanColors(value)
      // A lone color is the theme color itself; shadows and gradients with colors stay literal.
      if (tokens.length === 1 && tokens[0]!.text === value.replace(/!important/i, '').trim()) {
        const token = { ...tokens[0]!, index: base + start + tokens[0]!.index }
        vars.push({ name: decl[1]!, token })
        own.add(token.index)
      }
    }
    for (const token of scanColors(body)) if (!own.has(base + token.index)) literals.push({ ...token, index: base + token.index })
  }
  return { literals, vars }
}

/** Changes the given tokens (found by scanCss) to a new color. */
function apply(css: string, tokens: ColorToken[], toHex: string): string {
  let out = css
  for (const token of [...tokens].sort((a, b) => b.index - a.index)) {
    out = `${out.slice(0, token.index)}${recolor(token, toHex)}${out.slice(token.index + token.text.length)}`
  }
  return out
}

/** Every literal color equal to `fromKey` becomes `toHex`. */
export const replaceCssColor = (css: string, fromKey: string, toHex: string) =>
  apply(css, scanCss(css).literals.filter((token) => token.key === fromKey), toHex)

/** The theme color `name` (every declaration of it that holds `fromKey`) becomes `toHex`. */
export const setCssVarColor = (css: string, name: string, fromKey: string, toHex: string) =>
  apply(css, scanCss(css).vars.filter((each) => each.name === name && each.token.key === fromKey).map((each) => each.token), toHex)
