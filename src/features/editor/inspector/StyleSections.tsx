import type { StyleMap } from '../model/types'
import { BackgroundSection } from './background/BackgroundSection'
import { FieldRow } from './FieldRow'
import type { SectionContext, StyleField } from './fieldTypes'
import { BACKGROUND_AFTER, STYLE_SECTIONS } from './fields'
import { Section } from './Section'
import type { ComputedStyles } from './useComputedStyle'

type Props = { id: string; context: SectionContext; computed: ComputedStyles; overrides: StyleMap }

/** Renders every config-driven style section that applies to this element. */
export function StyleSections({ id, context, computed, overrides }: Props) {
  const rows = (fields: StyleField[] = []) =>
    fields.map((field) => <FieldRow key={field.prop} id={id} field={field} computed={computed} overrides={overrides} />)

  const sections = STYLE_SECTIONS.filter((section) => section.when(context))
  const split = STYLE_SECTIONS.findIndex((section) => section.id === BACKGROUND_AFTER) + 1
  const before = sections.filter((section) => STYLE_SECTIONS.indexOf(section) < split)
  const after = sections.filter((section) => STYLE_SECTIONS.indexOf(section) >= split)
  const render = (list: typeof sections) => list.map((section) => (
    <Section key={section.id} title={section.title} icon={section.icon} more={section.more && rows(section.more)}>
      {rows(section.fields)}
    </Section>
  ))

  return (
    <>
      {render(before)}
      <BackgroundSection key={id} id={id} computed={computed} overrides={overrides} hasText={context.hasText} />
      {render(after)}
    </>
  )
}
