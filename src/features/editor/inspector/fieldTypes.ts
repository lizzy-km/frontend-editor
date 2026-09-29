import type { IconName } from '@/shared/ui'
import type { ElementNode, NodeMap } from '../model/types'
import type { Option } from './controls/types'

export type FieldControl =
  | { type: 'color' }
  | { type: 'slider'; min: number; max: number; step?: number; unit: string }
  | { type: 'select'; options: Option[] }
  | { type: 'segmented'; options: Option[] }
  | { type: 'size' }
  | { type: 'text'; placeholder?: string }
  /** padding / margin: one value for all sides, or each side separately. */
  | { type: 'sides'; max: number }

/** One control bound to one CSS property. */
export type StyleField = {
  prop: string
  label: string
  control: FieldControl
  /** Short help shown on hover. */
  hint?: string
  /** Custom way to read the current value when the raw computed one would mislead. */
  read?: (computed: Record<string, string>) => string
}

/** What a section needs to decide whether it applies. */
export type SectionContext = {
  node: ElementNode
  nodes: NodeMap
  hasText: boolean
  isTextEditable: boolean
  elementChildren: number
}

export type SectionConfig = {
  id: string
  title: string
  icon: IconName
  when: (context: SectionContext) => boolean
  /** Always visible. Keep it to the 2–4 things people change most. */
  fields: StyleField[]
  /** Behind "More options". */
  more?: StyleField[]
}
