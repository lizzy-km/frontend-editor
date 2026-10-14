import type { JsxContext } from '../jsxWriter'

/** Inside a form component: the form's id and its fields (element id -> answer name). */
export type FormSlot = { id: string; fields: Map<string, string>; last: Set<string> }

/** errors.email, or errors["first-name"] for names that aren't plain words. */
export const errorRef = (name: string) => (/^[A-Za-z_$][\w$]*$/.test(name) ? `errors.${name}` : `errors[${JSON.stringify(name)}]`)

const FORM_OWN = new Set(['action', 'method', 'novalidate', 'target', 'enctype'])

/** Attributes React Hook Form takes over: where the form goes, and each field's name. */
export function formHandlesAttr(ctx: JsxContext, id: string, name: string): boolean {
  if (!ctx.form) return false
  if (id === ctx.form.id) return FORM_OWN.has(name)
  return name === 'name' && ctx.form.fields.has(id)
}

/** The form checks with Zod on send; each field registers its answer. */
export function formAttrs(ctx: JsxContext, id: string): string {
  if (!ctx.form) return ''
  if (id === ctx.form.id) return ' noValidate onSubmit={handleSubmit(onSubmit)}'
  const name = ctx.form.fields.get(id)
  return name ? ` aria-invalid={${errorRef(name)} ? true : undefined} {...register(${JSON.stringify(name)})}` : ''
}

/** The error after a field (after the last radio button of a question), and the form's own error before it closes. */
export function withFormExtras(ctx: JsxContext, id: string, out: string, pad: string): string {
  const form = ctx.form
  if (!form) return out
  if (form.last.has(id)) {
    const line = `<FieldError error={${errorRef(form.fields.get(id)!)}} />`
    return pad ? `${out}\n${pad}${line}` : `${out}${line}`
  }
  if (id !== form.id) return out
  const close = out.lastIndexOf('</')
  const lineStart = out.lastIndexOf('\n', close) + 1
  return lineStart > 0 && !out.slice(lineStart, close).trim()
    ? `${out.slice(0, lineStart)}${pad}  <FieldError error={errors.root} />\n${out.slice(lineStart)}`
    : `${out.slice(0, close)}<FieldError error={errors.root} />${out.slice(close)}`
}
