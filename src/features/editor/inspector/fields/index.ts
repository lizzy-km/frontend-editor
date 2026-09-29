import type { SectionConfig } from '../fieldTypes'
import { LAYOUT_AND_EFFECT_SECTIONS } from './layoutAndEffects'
import { TEXT_AND_BOX_SECTIONS } from './textAndBox'

/** Display order of the sections in the settings panel. */
const ORDER = ['text', 'picture', 'arrange', 'background', 'spacing', 'size', 'corners', 'effects']

const ALL = [...TEXT_AND_BOX_SECTIONS, ...LAYOUT_AND_EFFECT_SECTIONS]

/**
 * All config-driven style sections, in display order.
 * To add a control: add a field. To add a section: add an entry + its id above.
 */
export const STYLE_SECTIONS: SectionConfig[] = ORDER.flatMap((id) => ALL.filter((section) => section.id === id))
