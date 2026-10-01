import { track } from '@/features/analytics/track'
import { Icon } from '@/shared/ui'
import { BREAKPOINT_ORDER, BREAKPOINTS } from '../model/breakpoints'
import { useViewStore } from '../store/view.store'
import styles from './Toolbar.module.css'

/** Computer / Tablet / Phone. Edits made on a size apply to that size (and smaller). */
export function DeviceSwitch() {
  const breakpoint = useViewStore((state) => state.breakpoint)
  const setBreakpoint = useViewStore((state) => state.setBreakpoint)

  return (
    <div className={styles.segmented} role="radiogroup" aria-label="Screen size">
      {BREAKPOINT_ORDER.map((key) => (
        <button
          key={key} type="button" role="radio" aria-checked={breakpoint === key}
          className={styles.segment} title={`See and edit on ${BREAKPOINTS[key].label.toLowerCase()}`}
          onClick={() => {
            if (key !== breakpoint) track('switch_screen', { size: key })
            setBreakpoint(key)
          }}
        >
          <Icon name={BREAKPOINTS[key].icon} size={17} />
          <span className={styles.segmentLabel}>{BREAKPOINTS[key].label}</span>
        </button>
      ))}
    </div>
  )
}
