import { useState } from 'react'
import { Icon } from '@/shared/ui'
import { browserSaysNoTracking, optedOut } from './consent'
import { setUsageStats, usageStatsAvailable } from './track'

/**
 * "Share usage stats" on/off, as a menu item. Hidden when this build sends
 * no stats or the browser already asks not to be tracked (then nothing is sent).
 */
export function UsageStatsToggle() {
  const [on, setOn] = useState(() => !optedOut())
  if (!usageStatsAvailable || browserSaysNoTracking()) return null

  const toggle = () => {
    setUsageStats(!on)
    setOn(!on)
  }
  return (
    <button type="button" role="menuitemcheckbox" aria-checked={on} onClick={toggle}
      title="Anonymous counts of what people use, so we know what to improve. Never your page or what you type.">
      <Icon name={on ? 'check' : 'close'} size={16} /> Share usage stats: {on ? 'on' : 'off'}
    </button>
  )
}
