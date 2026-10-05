import type { SectionConfig } from '../fieldTypes'

/**
 * Text, spacing, size and border sections (Background is its own component: background/).
 * Labels are everyday words; CSS names never appear here in the UI.
 * To add a control: add a field. To add a section: add an entry.
 */
export const TEXT_AND_BOX_SECTIONS: SectionConfig[] = [
  {
    id: 'text', title: 'Text', icon: 'text',
    when: (ctx) => ctx.hasText,
    fields: [
      { prop: 'font-size', label: 'Text size', control: { type: 'slider', min: 8, max: 120, unit: 'px' } },
      { prop: 'color', label: 'Text color', control: { type: 'color' } },
      {
        prop: 'font-weight', label: 'Thickness', control: {
          type: 'select', options: [
            { value: '300', label: 'Thin' }, { value: '400', label: 'Normal' }, { value: '500', label: 'Medium' },
            { value: '600', label: 'Semi-bold' }, { value: '700', label: 'Bold' }, { value: '800', label: 'Extra bold' },
          ],
        },
      },
      {
        prop: 'text-align', label: 'Alignment', control: {
          type: 'segmented', options: [
            { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' },
          ],
        },
      },
    ],
    more: [
      { prop: 'line-height', label: 'Line spacing', control: { type: 'slider', min: 0.8, max: 3, step: 0.05, unit: '' } },
      { prop: 'letter-spacing', label: 'Letter spacing', control: { type: 'slider', min: -5, max: 20, step: 0.5, unit: 'px' } },
      {
        prop: 'font-style', label: 'Style', control: {
          type: 'segmented', options: [{ value: 'normal', label: 'Normal' }, { value: 'italic', label: 'Italic' }],
        },
      },
      {
        prop: 'text-transform', label: 'Capitals', control: {
          type: 'select', options: [
            { value: 'none', label: 'As typed' }, { value: 'uppercase', label: 'ALL CAPS' },
            { value: 'capitalize', label: 'First Letters' }, { value: 'lowercase', label: 'all small' },
          ],
        },
      },
      {
        prop: 'text-decoration-line', label: 'Line', control: {
          type: 'select', options: [
            { value: 'none', label: 'None' }, { value: 'underline', label: 'Underline' }, { value: 'line-through', label: 'Strike through' },
          ],
        },
      },
    ],
  },
  {
    id: 'spacing', title: 'Spacing', icon: 'box',
    when: (ctx) => ctx.node.tag !== 'body',
    fields: [
      { prop: 'padding', label: 'Space inside', control: { type: 'sides', max: 160 }, hint: 'Room between the edge and the content' },
      { prop: 'margin', label: 'Space outside', control: { type: 'sides', max: 160 }, hint: 'Room around this element' },
    ],
  },
  {
    id: 'size', title: 'Size', icon: 'desktop',
    when: (ctx) => ctx.node.tag !== 'body',
    fields: [
      { prop: 'width', label: 'Width', control: { type: 'size' } },
      { prop: 'height', label: 'Height', control: { type: 'size' } },
    ],
    more: [
      { prop: 'max-width', label: 'Max width', control: { type: 'size' } },
      { prop: 'min-height', label: 'Min height', control: { type: 'size' } },
    ],
  },
  {
    id: 'corners', title: 'Corners & border', icon: 'box',
    when: (ctx) => ctx.node.tag !== 'body',
    fields: [
      { prop: 'border-radius', label: 'Round corners', control: { type: 'slider', min: 0, max: 80, unit: 'px' } },
      { prop: 'border-width', label: 'Border', control: { type: 'slider', min: 0, max: 20, unit: 'px' } },
      { prop: 'border-color', label: 'Border color', control: { type: 'color' } },
    ],
    more: [
      {
        prop: 'border-style', label: 'Border style', control: {
          type: 'select', options: [
            { value: 'solid', label: 'Solid' }, { value: 'dashed', label: 'Dashed' }, { value: 'dotted', label: 'Dotted' }, { value: 'none', label: 'None' },
          ],
        },
      },
    ],
  },
]
