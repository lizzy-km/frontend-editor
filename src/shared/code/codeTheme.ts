import { cssLanguage } from '@codemirror/lang-css'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { Prec } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

/**
 * Code boxes look like VS Code's "Dark Modern" theme in light and dark mode alike:
 * the same dark editor people see in their own tools, so the colors feel familiar.
 */
const C = {
  bg: '#1f1f1f', fg: '#cccccc', gutter: '#6e7681', gutterActive: '#cccccc', line: '#ffffff0a', selection: '#264f78',
  cursor: '#aeafad', border: '#2b2b2b', focus: '#0078d4', panel: '#181818', widget: '#202020', widgetBorder: '#454545',
  input: '#313131', matchBracket: '#0064001a', findMatch: '#9e6a03', findMatchOther: '#515c6a',
}

export const appCodeTheme = EditorView.theme({
  '&': { fontSize: '12.5px', backgroundColor: C.bg, color: C.fg, border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden' },
  '&.cm-focused': { outline: 'none', borderColor: C.focus },
  '.cm-scroller': { fontFamily: "'Cascadia Code', Consolas, 'Courier New', ui-monospace, monospace", lineHeight: '1.55' },
  '.cm-content': { caretColor: C.cursor, padding: '8px 0' },
  '.cm-gutters': { backgroundColor: C.bg, color: C.gutter, border: 'none' },
  '.cm-activeLine': { backgroundColor: C.line },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: C.gutterActive },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': { backgroundColor: `${C.selection} !important` },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: C.cursor },
  '&.cm-focused .cm-matchingBracket': { backgroundColor: C.matchBracket, outline: '1px solid #888888' },
  '.cm-selectionMatch': { backgroundColor: '#3a3d41' },
  '.cm-searchMatch': { backgroundColor: C.findMatchOther },
  '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: C.findMatch },
  '.cm-placeholder': { color: C.gutter },
  // Search box, tooltips and other panels
  '.cm-panels': { backgroundColor: C.panel, color: C.fg, borderColor: C.border },
  '.cm-panels input, .cm-panels button': { fontSize: '12px' },
  '.cm-textfield': { backgroundColor: C.input, color: C.fg, border: `1px solid ${C.border}`, borderRadius: '4px', padding: '2px 6px' },
  '.cm-button': { backgroundImage: 'none', backgroundColor: '#2b2b2b', color: C.fg, border: `1px solid ${C.widgetBorder}`, borderRadius: '4px' },
  '.cm-tooltip': { backgroundColor: C.widget, color: C.fg, border: `1px solid ${C.widgetBorder}`, borderRadius: '6px' },
  // Folding: arrows in the gutter and a visible "…" pill for folded blocks.
  '.cm-foldGutter .cm-gutterElement': { color: '#c5c5c5', cursor: 'pointer', padding: '0 4px', fontSize: '14px' },
  '.cm-foldGutter .cm-gutterElement:hover': { backgroundColor: '#ffffff1a', borderRadius: '4px' },
  '.cm-foldPlaceholder': { backgroundColor: '#3a3d41', color: C.fg, border: 'none', borderRadius: '999px', padding: '0 8px', margin: '0 2px', cursor: 'pointer', fontWeight: '600' },
}, { dark: true })

/** Dark Modern's token colors. */
const darkModernColors = HighlightStyle.define([
  { tag: [t.keyword, t.modifier, t.operatorKeyword, t.definitionKeyword, t.self, t.bool, t.null, t.atom], color: '#569cd6' },
  { tag: [t.controlKeyword, t.moduleKeyword], color: '#c586c0' },
  { tag: [t.string, t.special(t.string), t.attributeValue], color: '#ce9178' },
  { tag: [t.number, t.unit, t.color], color: '#b5cea8' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: '#6a9955' },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.macroName], color: '#dcdcaa' },
  { tag: [t.typeName, t.className, t.namespace], color: '#4ec9b0' },
  { tag: [t.variableName, t.propertyName, t.attributeName, t.labelName, t.definition(t.variableName)], color: '#9cdcfe' },
  { tag: t.tagName, color: '#569cd6' },
  { tag: t.angleBracket, color: '#808080' },
  { tag: [t.operator, t.punctuation, t.separator], color: '#d4d4d4' },
  { tag: [t.bracket, t.squareBracket, t.brace, t.paren], color: '#ffd700' },
  { tag: [t.regexp, t.escape], color: '#d16969' },
  { tag: [t.meta, t.documentMeta, t.processingInstruction], color: '#808080' },
  { tag: t.heading, color: '#569cd6', fontWeight: 'bold' },
  { tag: t.invalid, color: '#f44747' },
  { tag: t.link, color: '#4daafc', textDecoration: 'underline' },
])

/** In CSS, VS Code colors selectors gold and keyword values (flex, none…) orange. */
const cssColors = HighlightStyle.define([
  { tag: [t.className, t.tagName, t.labelName], color: '#d7ba7d' },
  { tag: t.keyword, color: '#ce9178' },
  { tag: t.atom, color: '#ce9178' },
], { scope: cssLanguage })

export const darkModern = [syntaxHighlighting(darkModernColors), Prec.high(syntaxHighlighting(cssColors))]
