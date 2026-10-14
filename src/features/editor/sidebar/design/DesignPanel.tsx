import { Section } from '../../inspector/Section'
import { ColorsPanel } from '../colors/ColorsPanel'
import { LayoutPanel } from './LayoutPanel'

/** Project-wide look: every color, and the ready-made layouts (top bar, side menu). */
export function DesignPanel() {
  return (
    <div>
      <Section title="Layout" icon="layers" defaultOpen={false}><LayoutPanel /></Section>
      <Section title="Colors" icon="sun"><ColorsPanel /></Section>

    </div>
  )
}
