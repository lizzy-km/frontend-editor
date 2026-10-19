import { track } from '@/features/analytics/track'
import { FLAG_ATTR, FLAG_MODE_ATTR, type FlagMode } from '../model/flagClicks'
import { setAttributes } from './nodeActions'

/** What clicking an element does to a flag (an empty name = nothing). One undo step. */
export function setFlagClick(id: string, flag: string, mode: FlagMode) {
  setAttributes(id, { [FLAG_ATTR]: flag, [FLAG_MODE_ATTR]: flag ? mode : '' })
  if (flag) track('popup_set', { kind: 'flag' })
}
