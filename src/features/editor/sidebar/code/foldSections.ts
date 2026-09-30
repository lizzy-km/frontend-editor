import { foldable, foldEffect } from '@codemirror/language'
import type { StateEffect } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'

/** The page's frame stays open so its parts (style block, sections) show as a tidy list. */
const KEEP_OPEN = /^\s*<(!doctype|html|head|body)\b/i

/**
 * "Fold all" that's useful for a whole page: everything foldable is folded
 * EXCEPT <html>, <head> and <body> themselves — so you see the <style> block
 * and each section as one line. For CSS/JS it simply folds every top-level block.
 */
export function foldSections(view: EditorView): boolean {
  const { state } = view
  const effects: StateEffect<unknown>[] = []
  for (let lineNumber = 1; lineNumber <= state.doc.lines; lineNumber++) {
    const line = state.doc.line(lineNumber)
    if (KEEP_OPEN.test(line.text)) continue
    const range = foldable(state, line.from, line.to)
    if (!range) continue
    effects.push(foldEffect.of(range))
    lineNumber = state.doc.lineAt(range.to).number // skip what's now hidden inside
  }
  if (effects.length) view.dispatch({ effects })
  return effects.length > 0
}
