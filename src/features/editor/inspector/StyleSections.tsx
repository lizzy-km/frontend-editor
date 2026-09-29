import type { StyleMap } from '../model/types'
import { FieldRow } from './FieldRow'
import type { SectionContext, StyleField } from './fieldTypes'
import { STYLE_SECTIONS } from './fields'
import { Section } from './Section'
import type { ComputedStyles } from './useComputedStyle'

type Props = { id: string; context: SectionContext; computed: ComputedStyles; overrides: StyleMap }

/** Renders every config-driven style section that applies to this element. */
export function StyleSections({ id, context, computed, overrides }: Props) {
  const rows = (fields: StyleField[] = []) =>
    fields.map((field) => <FieldRow key={field.prop} id={id} field={field} computed={computed} overrides={overrides} />)

  return (
    <>
      {STYLE_SECTIONS.filter((section) => section.when(context)).map((section) => (
        <Section key={section.id} title={section.title} icon={section.icon} more={section.more && rows(section.more)}>
          {rows(section.fields)}
        </Section>
      ))}
    </>
  )
}
