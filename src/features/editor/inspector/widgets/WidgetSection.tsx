import type { ComponentType } from 'react'
import type { IconName } from '@/shared/ui'
import { widgetAround, type WidgetKind } from '../../model/widgets/attrs'
import type { ElementNode } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { Section } from '../Section'
import { ConnectPanel } from './ConnectPanel'
import { DatePanel } from './DatePanel'
import { FieldPanel } from './FieldPanel'
import { SelectPanel } from './SelectPanel'
import { TablePanel } from './TablePanel'
import { TabsPanel } from './TabsPanel'

type Panel = { title: string; icon: IconName; Body: ComponentType<{ widget: ElementNode }> }

/** The settings of each ready-made widget, in everyday words. */
const PANELS: Partial<Record<WidgetKind, Panel>> = {
  tabs: { title: 'Tabs', icon: 'tabs', Body: TabsPanel },
  select: { title: 'Select list', icon: 'select', Body: SelectPanel },
  datepicker: { title: 'Date picker', icon: 'calendar', Body: DatePanel },
  calendar: { title: 'Calendar', icon: 'calendar', Body: DatePanel },
  table: { title: 'Table', icon: 'table', Body: TablePanel },
  search: { title: 'Search bar', icon: 'search', Body: ConnectPanel },
  filter: { title: 'Filter', icon: 'filter', Body: ConnectPanel },
  field: { title: 'Input', icon: 'input', Body: FieldPanel },
  switch: { title: 'Switch', icon: 'toggle', Body: FieldPanel },
}

/** Settings for the ready-made widget around the selection (shown for the widget itself and for anything inside it). */
export function WidgetSection({ nodeId }: { nodeId: string }) {
  const widget = useDocStore((state) => widgetAround(state.doc.nodes, nodeId))
  const panel = widget && PANELS[widget.attrs['data-ui'] as WidgetKind]
  if (!widget || !panel) return null
  return (
    <Section title={panel.title} icon={panel.icon} key={widget.id}>
      <panel.Body widget={widget} />
    </Section>
  )
}
