import { EditorView } from '@codemirror/view'

/**
 * Makes CodeMirror look like the rest of the app. Uses the app's CSS
 * variables, so light/dark mode switches automatically.
 */
export const appCodeTheme = EditorView.theme({
  '&': {
    fontSize: '12.5px',
    backgroundColor: 'var(--surface-2)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  '&.cm-focused': { outline: 'none', borderColor: 'var(--focus)', backgroundColor: 'var(--surface)' },
  '.cm-scroller': { fontFamily: "ui-monospace, 'Cascadia Code', Consolas, monospace", lineHeight: '1.55' },
  '.cm-content': { caretColor: 'var(--text)', padding: '8px 0' },
  '.cm-gutters': { backgroundColor: 'transparent', color: 'var(--text-soft)', border: 'none' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'color-mix(in srgb, var(--accent) 7%, transparent)' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'color-mix(in srgb, var(--focus) 25%, transparent) !important',
  },
  '.cm-cursor': { borderLeftColor: 'var(--text)' },
  '.cm-panels': { backgroundColor: 'var(--surface)', color: 'var(--text)' },
  // Folding: clear arrows in the gutter and a visible "…" pill for folded blocks.
  '.cm-foldGutter .cm-gutterElement': { color: 'var(--accent)', cursor: 'pointer', padding: '0 4px', fontSize: '14px' },
  '.cm-foldGutter .cm-gutterElement:hover': { backgroundColor: 'var(--accent-soft)', borderRadius: '4px' },
  '.cm-foldPlaceholder': {
    backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', border: 'none',
    borderRadius: '999px', padding: '0 8px', margin: '0 2px', cursor: 'pointer', fontWeight: '600',
  },
})
