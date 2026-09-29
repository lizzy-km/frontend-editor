import type { IconName } from '@/shared/ui'

type Block = { id: string; label: string; icon: IconName; html: string }

/**
 * Things people can add. Plain HTML with light inline styles so they look OK
 * on any page — every style becomes a normal, editable setting.
 * Add a block = add an entry.
 */
export const BLOCKS: Block[] = [
  { id: 'heading', label: 'Heading', icon: 'text', html: '<h2>Your heading</h2>' },
  { id: 'text', label: 'Text', icon: 'text', html: '<p>Write something here. Double-click to change it.</p>' },
  {
    id: 'button', label: 'Button', icon: 'box',
    html: '<a href="#" style="display: inline-block; padding: 12px 24px; border-radius: 8px; background: #e8573a; color: #ffffff; text-decoration: none; font-weight: 600">Click me</a>',
  },
  {
    id: 'picture', label: 'Picture', icon: 'image',
    html: '<img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200" alt="A landscape" style="width: 100%; max-width: 640px; border-radius: 12px">',
  },
  { id: 'link', label: 'Link', icon: 'link', html: '<a href="#">A link</a>' },
  { id: 'list', label: 'List', icon: 'layers', html: '<ul><li>First point</li><li>Second point</li><li>Third point</li></ul>' },
  {
    id: 'box', label: 'Box', icon: 'box',
    html: '<div style="padding: 24px; border-radius: 12px; background: #f3eee6"><p>Put anything in this box.</p></div>',
  },
  {
    id: 'columns', label: 'Two columns', icon: 'layers',
    html: '<div style="display: flex; gap: 24px; flex-wrap: wrap"><div style="flex: 1 1 240px"><h3>Left</h3><p>Some text.</p></div><div style="flex: 1 1 240px"><h3>Right</h3><p>Some text.</p></div></div>',
  },
  { id: 'divider', label: 'Divider line', icon: 'box', html: '<hr style="border: 0; border-top: 1px solid #e6ded2; margin: 24px 0">' },
  { id: 'space', label: 'Empty space', icon: 'box', html: '<div style="height: 48px"></div>' },
]
