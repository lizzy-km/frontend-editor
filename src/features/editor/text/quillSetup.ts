import Quill from 'quill'
import type { InlineBlot } from 'parchment'

let registered = false

/**
 * Teaches Quill to keep <span class="..."> (AI pages use them for colored
 * words, e.g. Tailwind's text-blue-600). Without this Quill strips the class.
 */
export function setupQuill(): typeof Quill {
  if (registered) return Quill
  registered = true

  const Inline = Quill.import('blots/inline') as typeof InlineBlot

  class ClassSpan extends Inline {
    static blotName = 'classSpan'
    static tagName = 'SPAN'

    static create(value?: unknown): HTMLElement {
      const node = super.create(value)
      if (typeof value === 'string') node.setAttribute('class', value)
      return node
    }

    static formats(node: HTMLElement): string | undefined {
      return node.getAttribute('class') || undefined
    }
  }

  Quill.register(ClassSpan, true)
  return Quill
}

/** Toolbar shown when text is selected: everyday formatting only. */
export const TEXT_TOOLBAR = [['bold', 'italic', 'underline'], [{ color: [] }], ['link'], ['clean']]
