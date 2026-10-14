import type { FormField } from '@/features/editor/model/forms'

/** A form's fields as a Zod schema: the rules from the editor, with messages people understand. */

const quoted = (label: string) => `“${label.replace(/[“”"]/g, '')}”`
/** A property key: plain when it is a valid name, else quoted. */
export const key = (name: string) => (/^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name))

function lengthRules(field: FormField, say: (text: string) => string): string {
  const label = quoted(field.label)
  return [
    field.minLength && `.min(${field.minLength}, ${say(`${label} needs at least ${field.minLength} characters.`)})`,
    field.maxLength && `.max(${field.maxLength}, ${say(`${label} can have at most ${field.maxLength} characters.`)})`,
    field.pattern && `.regex(new RegExp(${JSON.stringify(`^(?:${field.pattern})$`)}), ${say(`${label} isn't in the right format.`)})`,
  ].filter(Boolean).join('')
}

/** Text-like answers: required, length and format rules; optional ones may also stay empty. */
function textRule(field: FormField, say: (text: string) => string): string {
  const fill = say(`Please fill in ${quoted(field.label)}.`)
  const trim = field.kind === 'password' ? '' : '.trim()'
  const rules = lengthRules(field, say)
  const format = field.kind === 'email' ? `.pipe(z.email(${say('Please enter a valid email address.')}))`
    : field.kind === 'url' ? `.pipe(z.url(${say('Please enter a full web address (https://…).')}))` : ''
  if (field.required) return `z.string()${trim}.min(1, ${fill})${rules}${format}`
  return rules || format ? `z.literal('').or(z.string()${trim}${rules}${format})` : `z.string()${trim}`
}

function numberRule(field: FormField, say: (text: string) => string): string {
  const label = quoted(field.label)
  const check = `z.number({ error: ${say(`${label} must be a number.`)} })`
    + (field.min !== undefined ? `.min(${field.min}, ${say(`${label} must be at least ${field.min}.`)})` : '')
    + (field.max !== undefined ? `.max(${field.max}, ${say(`${label} can be at most ${field.max}.`)})` : '')
  return field.required
    ? `z.string().trim().min(1, ${say(`Please fill in ${label}.`)}).transform(Number).pipe(${check})`
    : `z.literal('').or(z.string().trim().transform(Number).pipe(${check}))`
}

/** The Zod rule for one field. */
export function fieldRule(field: FormField): string {
  const say = (text: string) => JSON.stringify(field.message || text)
  const label = quoted(field.label)
  switch (field.kind) {
    case 'checkbox': return field.required ? `z.literal(true, { error: ${say(`Please tick ${label}.`)} })` : 'z.boolean()'
    case 'radio': return field.required ? `z.string({ error: ${say(`Please choose ${label}.`)} })` : 'z.string().nullish()'
    case 'number': return numberRule(field, say)
    case 'select': return field.required ? `z.string().min(1, ${say(`Please choose ${label}.`)})` : 'z.string()'
    default: return textRule(field, say)
  }
}

/** `z.object({ … })` plus a check per "Same as" field. */
export function schemaSource(name: string, fields: FormField[]): string {
  const names = new Set(fields.map((field) => field.name))
  const matches = fields.filter((field) => field.match && names.has(field.match))
  // when: () => true checks matching boxes even while another answer still has a problem.
  return [
    `export const ${name} = z`,
    '  .object({',
    ...fields.map((field) => `    ${key(field.name)}: ${fieldRule(field)},`),
    '  })',
    ...matches.map((field) => `  .refine((values) => values[${JSON.stringify(field.name)}] === values[${JSON.stringify(field.match)}], { path: [${JSON.stringify(field.name)}], error: ${JSON.stringify(field.message || `${quoted(field.label)} doesn't match.`)}, when: () => true })`),
  ].join('\n')
}
