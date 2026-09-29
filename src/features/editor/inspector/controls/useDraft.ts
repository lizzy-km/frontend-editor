import { useState } from 'react'

/**
 * Local text for an input that saves later (on Enter/blur).
 * When the real value changes (undo, another element selected) the draft
 * follows it. This is React's "adjust state when a prop changes" pattern.
 */
export function useDraft(value: string): [string, (next: string) => void] {
  const [source, setSource] = useState(value)
  const [draft, setDraft] = useState(value)
  if (source !== value) {
    setSource(value)
    setDraft(value)
  }
  return [draft, setDraft]
}
