import type { SectionConfig } from '../fieldTypes'

/** Stacked vs side by side, read from the real layout (block = stacked, multi-column grid = side by side). */
const readDirection = (computed: Record<string, string>) => {
  const display = computed.display ?? ''
  if (display.includes('grid')) return (computed['grid-template-columns'] ?? '').trim().split(/\s+/).length > 1 ? 'row' : 'column'
  if (!display.includes('flex')) return 'column'
  return (computed['flex-direction'] ?? '').startsWith('column') ? 'column' : 'row'
}

/** Arranging children, shadows, picture fit. */
export const LAYOUT_AND_EFFECT_SECTIONS: SectionConfig[] = [
  {
    id: 'arrange', title: 'Arrange items', icon: 'layers',
    when: (ctx) => ctx.elementChildren >= 2,
    fields: [
      {
        prop: 'flex-direction', label: 'Direction', read: readDirection,
        control: { type: 'segmented', options: [{ value: 'column', label: 'Stacked' }, { value: 'row', label: 'Side by side' }] },
      },
      { prop: 'gap', label: 'Space between', control: { type: 'slider', min: 0, max: 120, unit: 'px' } },
      {
        prop: 'align-items', label: 'Line up', control: {
          type: 'select', options: [
            { value: 'stretch', label: 'Fill the space' }, { value: 'flex-start', label: 'At the start' },
            { value: 'center', label: 'In the middle' }, { value: 'flex-end', label: 'At the end' },
          ],
        },
      },
    ],
    more: [
      {
        prop: 'justify-content', label: 'Spread', control: {
          type: 'select', options: [
            { value: 'flex-start', label: 'Together at start' }, { value: 'center', label: 'Together in middle' },
            { value: 'flex-end', label: 'Together at end' }, { value: 'space-between', label: 'Spread out' },
          ],
        },
      },
      {
        prop: 'flex-wrap', label: 'When full', control: {
          type: 'segmented', options: [{ value: 'wrap', label: 'Next line' }, { value: 'nowrap', label: 'Squeeze' }],
        },
      },
    ],
  },
  {
    id: 'picture', title: 'Picture', icon: 'image',
    when: (ctx) => ctx.node.tag === 'img',
    fields: [
      {
        prop: 'object-fit', label: 'Fit', control: {
          type: 'select', options: [
            { value: 'cover', label: 'Fill (crop edges)' }, { value: 'contain', label: 'Show whole picture' },
            { value: 'fill', label: 'Stretch' },
          ],
        },
      },
    ],
  },
  {
    id: 'effects', title: 'Shadow', icon: 'sparkle',
    when: (ctx) => ctx.node.tag !== 'body',
    fields: [
      {
        prop: 'box-shadow', label: 'Shadow', control: {
          type: 'select', options: [
            { value: 'none', label: 'None' },
            { value: '0 2px 8px rgba(0,0,0,0.08)', label: 'Soft' },
            { value: '0 8px 24px rgba(0,0,0,0.14)', label: 'Medium' },
            { value: '0 20px 48px rgba(0,0,0,0.22)', label: 'Strong' },
            { value: '0 0 24px rgba(232,87,58,0.45)', label: 'Glow' },
          ],
        },
      },
    ],
  },
]
