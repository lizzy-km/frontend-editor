import type { IconName } from '@/shared/ui'

export type Label = { name: string; icon: IconName }

const text = (name: string): Label => ({ name, icon: 'text' })
const box = (name: string): Label => ({ name, icon: 'box' })
const group = (name: string): Label => ({ name, icon: 'layers' })
const iconPart: Label = { name: 'Icon part', icon: 'sparkle' }

/** Everyday names for HTML tags. Add a tag here to give it a friendly name. */
export const TAG_LABELS: Record<string, Label> = {
  body: { name: 'Page', icon: 'desktop' },
  // Text
  h1: text('Big heading'), h2: text('Heading'), h3: text('Small heading'),
  h4: text('Small heading'), h5: text('Small heading'), h6: text('Small heading'),
  p: text('Text'), span: text('Text'), strong: text('Bold text'), b: text('Bold text'),
  em: text('Italic text'), u: text('Underlined text'), small: text('Small text'), mark: text('Highlighted text'),
  sub: text('Small low text'), sup: text('Small raised text'), code: text('Code text'), pre: text('Code block'),
  blockquote: text('Quote'), cite: text('Quote source'), q: text('Quote'), abbr: text('Short form'),
  time: text('Date or time'), address: text('Address'), figcaption: text('Picture caption'),
  dt: text('Term'), dd: text('Description'), label: text('Label'), legend: text('Group title'),
  summary: text('Question (click to open)'),
  // Links, buttons, media
  a: { name: 'Link', icon: 'link' }, button: box('Button'),
  img: { name: 'Picture', icon: 'image' }, picture: { name: 'Picture', icon: 'image' },
  figure: { name: 'Picture with caption', icon: 'image' },
  video: { name: 'Video', icon: 'image' }, audio: box('Sound'), iframe: { name: 'Embedded content', icon: 'globe' },
  svg: { name: 'Icon', icon: 'sparkle' }, i: { name: 'Icon', icon: 'sparkle' },
  // SVG insides
  g: iconPart, path: iconPart, circle: iconPart, rect: iconPart, line: iconPart, polyline: iconPart,
  polygon: iconPart, ellipse: iconPart, use: iconPart, symbol: iconPart, defs: iconPart, tspan: iconPart,
  text: { name: 'Icon text', icon: 'text' },
  // Areas and boxes
  header: box('Top area'), nav: group('Menu'), main: box('Main content'), section: group('Section'),
  article: box('Article'), aside: box('Side area'), footer: box('Bottom area'), div: box('Box'),
  details: group('Fold-out (question and answer)'), dialog: box('Pop-up'),
  // Lists and tables
  ul: group('List'), ol: group('Numbered list'), li: text('List item'), dl: group('List of details'),
  table: group('Table'), thead: group('Table top row'), tbody: group('Table rows'), tr: group('Table row'),
  th: text('Table heading'), td: text('Table cell'),
  // Forms
  form: box('Form'), fieldset: group('Group of choices'), input: box('Input box'), textarea: box('Text box'),
  select: { name: 'Dropdown', icon: 'chevronDown' }, option: text('Dropdown choice'),
  // Other
  hr: box('Divider line'), br: box('Line break'),
}

export function labelForTag(tag: string): Label {
  return TAG_LABELS[tag] ?? { name: `Page part (${tag})`, icon: 'code' }
}
