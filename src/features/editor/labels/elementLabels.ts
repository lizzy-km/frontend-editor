import type { IconName } from '@/shared/ui'
import { getTextContent } from '../model/tree/queries'
import type { ElementNode, NodeMap } from '../model/types'

type Label = { name: string; icon: IconName }

/** Everyday names for HTML tags. Add a tag here to give it a friendly name. */
const TAG_LABELS: Record<string, Label> = {
  body: { name: 'Page', icon: 'desktop' },
  h1: { name: 'Big heading', icon: 'text' },
  h2: { name: 'Heading', icon: 'text' },
  h3: { name: 'Small heading', icon: 'text' },
  h4: { name: 'Small heading', icon: 'text' },
  h5: { name: 'Small heading', icon: 'text' },
  h6: { name: 'Small heading', icon: 'text' },
  p: { name: 'Text', icon: 'text' },
  span: { name: 'Text', icon: 'text' },
  strong: { name: 'Bold text', icon: 'text' },
  em: { name: 'Italic text', icon: 'text' },
  a: { name: 'Link', icon: 'link' },
  button: { name: 'Button', icon: 'box' },
  img: { name: 'Picture', icon: 'image' },
  picture: { name: 'Picture', icon: 'image' },
  svg: { name: 'Icon', icon: 'sparkle' },
  i: { name: 'Icon', icon: 'sparkle' },
  video: { name: 'Video', icon: 'image' },
  iframe: { name: 'Embedded content', icon: 'globe' },
  header: { name: 'Top area', icon: 'box' },
  nav: { name: 'Menu', icon: 'layers' },
  main: { name: 'Main content', icon: 'box' },
  section: { name: 'Section', icon: 'layers' },
  article: { name: 'Article', icon: 'box' },
  aside: { name: 'Side area', icon: 'box' },
  footer: { name: 'Bottom area', icon: 'box' },
  div: { name: 'Box', icon: 'box' },
  ul: { name: 'List', icon: 'layers' },
  ol: { name: 'Numbered list', icon: 'layers' },
  li: { name: 'List item', icon: 'text' },
  form: { name: 'Form', icon: 'box' },
  input: { name: 'Input box', icon: 'box' },
  textarea: { name: 'Text box', icon: 'box' },
  select: { name: 'Dropdown', icon: 'chevronDown' },
  label: { name: 'Label', icon: 'text' },
  table: { name: 'Table', icon: 'layers' },
  hr: { name: 'Divider line', icon: 'box' },
  br: { name: 'Line break', icon: 'box' },
}

export function labelForTag(tag: string): Label {
  return TAG_LABELS[tag] ?? { name: tag.toUpperCase(), icon: 'code' }
}

/** Icon fonts (Font Awesome, Bootstrap Icons...) use <i class="fa ...">. */
function isIconFont(node: ElementNode): boolean {
  return /\b(fa|fas|far|fab|bi|material-icons|icon)[-\s]|\bfa\b/.test(node.attrs.class ?? '')
}

/** A link styled as a button (class "btn", "button", "cta"...) is a button to a normal person. */
function looksLikeButton(node: ElementNode): boolean {
  return node.tag === 'a' && /\b(btn|button|cta)\b/i.test(node.attrs.class ?? '')
}

/** Friendly name + icon for an element, looking at its tag and classes. */
export function labelForNode(node: ElementNode): Label {
  if (looksLikeButton(node)) return labelForTag('button')
  if (node.tag === 'i' && !isIconFont(node)) return labelForTag('em')
  return labelForTag(node.tag)
}

/** e.g. 'Button “Get started”' — what the layers list and the overlay tag show. */
export function describeNode(nodes: NodeMap, node: ElementNode, maxText = 24): string {
  const label = labelForNode(node)
  if (node.tag === 'body') return label.name
  if (node.tag === 'img') return node.attrs.alt ? `${label.name} “${node.attrs.alt.slice(0, maxText)}”` : label.name

  const text = getTextContent(nodes, node.id)
  if (!text) return label.name
  return `${label.name} “${text.length > maxText ? `${text.slice(0, maxText)}…` : text}”`
}
