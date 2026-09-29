import { Switch } from '@/shared/ui'
import { setStyle } from '../../actions/styleActions'
import { BREAKPOINT_ORDER } from '../../model/breakpoints'
import type { Breakpoint, ElementNode } from '../../model/types'
import { useViewStore } from '../../store/view.store'
import styles from '../Inspector.module.css'
import { Section } from '../Section'

const SHOW_LABEL = { desktop: 'Show on the page', tablet: 'Show on tablets & phones', mobile: 'Show on phones' }

/** Did a bigger screen size hide it? (Its styles cascade down to this one.) */
function hiddenByBiggerSize(node: ElementNode, breakpoint: Breakpoint): boolean {
  const bigger = BREAKPOINT_ORDER.slice(0, BREAKPOINT_ORDER.indexOf(breakpoint))
  return bigger.some((size) => node.styles[size]?.display === 'none')
}

/** Hide something on one screen size only (e.g. a big picture on phones). */
export function VisibilitySection({ node, computedDisplay }: { node: ElementNode; computedDisplay: string }) {
  const breakpoint = useViewStore((state) => state.breakpoint)
  const visible = computedDisplay !== 'none'

  const toggle = (show: boolean) => {
    if (!show) return setStyle(node.id, 'display', 'none')
    const onlyHiddenHere = node.styles[breakpoint]?.display === 'none' && !hiddenByBiggerSize(node, breakpoint)
    // "revert" = the browser's normal display for this tag, which beats a "none"
    // coming from a bigger screen size or from the page's own CSS.
    setStyle(node.id, 'display', onlyHiddenHere ? '' : 'revert')
  }

  return (
    <Section title="Show or hide" icon="eye">
      <Switch label={SHOW_LABEL[breakpoint]} checked={visible} onChange={toggle} />
      {!visible && <p className={styles.note}>Hidden here. It still exists — switch on to bring it back.</p>}
    </Section>
  )
}
