import { track } from '@/features/analytics/track'
import { applyMarkup, type ApplyResult, type ComponentRef } from '@/features/export/react/jsxEdit/applyJsx'
import { getDoc } from '../store/doc.store'
import { updateDoc } from './commit'

/**
 * Applies edited React markup to the page elements a component was made from.
 * One undo step; elements that still match keep their id and styles. Returns the problem when the markup can't be applied.
 */
export function applyComponentMarkup(rootId: string, markup: string, others: ComponentRef[]): ApplyResult {
  const result = applyMarkup(getDoc(), rootId, markup, others)
  if (result.ok) {
    updateDoc(() => result.doc)
    track('component_edit', { lines: markup.split('\n').length })
  }
  return result
}
