import type { ComputedStyles } from './useComputedStyle'

type Styles = Record<string, string>
type Companion = (computed: ComputedStyles) => Styles

const NONE: Styles = {}
const when = (condition: boolean, styles: Styles): Styles => (condition ? styles : NONE)
const isFlexOrGrid = (computed: ComputedStyles) => /(flex|grid)/.test(computed.display ?? '')

/**
 * Some properties do nothing alone. When the user sets one of these, the
 * extra styles returned here are set too, so the change is always visible.
 */
const COMPANIONS: Record<string, Companion> = {
  // A border needs a style, otherwise width/color are invisible.
  'border-width': (computed) => when(computed['border-top-style'] === 'none', { 'border-style': 'solid' }),
  'border-color': (computed) => when(computed['border-top-style'] === 'none', {
    'border-style': 'solid',
    'border-width': computed['border-top-width'] && computed['border-top-width'] !== '0px' ? computed['border-top-width'] : '2px',
  }),
  // Stacked / side by side, line up and gap need a flex container.
  'flex-direction': (computed) => when(!(computed.display ?? '').includes('flex'), { display: 'flex' }),
  'align-items': (computed) => when(!isFlexOrGrid(computed), { display: 'flex', 'flex-direction': 'column' }),
  gap: (computed) => when(!isFlexOrGrid(computed), { display: 'flex', 'flex-direction': 'column' }),
  // A width set by hand should not be capped by the page's max-width.
  width: (computed) => when(Boolean(computed['max-width']) && computed['max-width'] !== 'none', { 'max-width': 'none' }),
}

/** Extra styles to set together with `property` (empty when none are needed). */
export function companionStyles(property: string, value: string, computed: ComputedStyles): Styles {
  return value ? COMPANIONS[property]?.(computed) ?? NONE : NONE
}
