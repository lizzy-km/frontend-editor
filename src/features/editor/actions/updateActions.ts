import { track } from '@/features/analytics/track'
import { UPDATE_ATTR, updateAttrValue, type UpdateClick } from '../model/updateClicks'
import { setAttribute } from './nodeActions'

/** What clicking an element changes in an API's data (null = nothing). One undo step. */
export function setUpdateClick(id: string, click: UpdateClick | null) {
  setAttribute(id, UPDATE_ATTR, updateAttrValue(click))
  if (click) track('popup_set', { kind: 'update' })
}
