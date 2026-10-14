import { codeName } from '@/features/editor/model/data'
import { fieldsOf, formSettings, SUBMIT_ATTR } from '@/features/editor/model/forms'
import { collectSubtreeIds } from '@/features/editor/model/tree/queries'
import { isElement, type ElementNode, type NodeMap } from '@/features/editor/model/types'
import { AUTH_DEPS } from '../auth/authFiles'
import { clientFiles } from '../dataTemplates'
import { motionImports, motionState, showImport } from '../jsxExtras'
import { closeTag, openTag, writeElement, type JsxContext } from '../jsxWriter'
import { FORM_DEPS, formKitFiles } from './formKit'
import { schemaSource } from './zodSchema'

type ComponentFile = { name: string; code: string }
type TakeName = (wanted: string, alternative?: string) => string

const pascal = (name: string) => name.charAt(0).toUpperCase() + name.slice(1)

/** Forms set up in the editor ("Check the answers and send them") that have fields. */
export const isCheckedForm = (nodes: NodeMap, id: string) => {
  const node = nodes[id]
  return isElement(node) && node.tag === 'form' && Boolean(node.attrs[SUBMIT_ATTR]) && fieldsOf(nodes, id).length > 0
}

/** A name from the form's first heading or button ("Get in touch" -> GetInTouchForm). */
function formName(nodes: NodeMap, form: ElementNode): string {
  const heading = collectSubtreeIds(nodes, form.id).map((id) => nodes[id]).find((node) => isElement(node) && /^h[1-6]$/.test(node.tag))
  const words = heading && isElement(heading) ? heading.children.map((id) => (nodes[id]?.kind === 'text' ? nodes[id].text : '')).join(' ') : ''
  const base = pascal(codeName(words.split(/\s+/).slice(0, 3).join(' '), 'contact'))
  return base.endsWith('Form') ? base : `${base}Form`
}

function sendLines(address: string): string[] {
  return address
    ? ['      await api.post(ADDRESS, values)']
    : ['      // No address set in the editor yet: send the answers to your API here.', "      console.info('Form answers', values)"]
}

function formFile(parent: JsxContext, form: ElementNode, name: string, base: string): ComponentFile {
  const fields = fieldsOf(parent.nodes, form.id)
  const { address, success } = formSettings(form)
  const ctx: JsxContext = {
    nodes: parent.nodes, classFor: parent.classFor, motion: motionState(), show: { used: false },
    form: { id: form.id, fields: new Map(fields.flatMap((field) => field.ids.map((id) => [id, field.name]))), last: new Set(fields.map((field) => field.ids.at(-1)!)) },
  }
  const schema = `${name.charAt(0).toLowerCase()}${name.slice(1)}Schema`
  const body = writeElement(ctx, form.id, '    ')
  const thanks = `${openTag(ctx, form)}<p role="status">{THANKS}</p>${closeTag(ctx, form)}`
  return {
    name,
    code: [
      "import { zodResolver } from '@hookform/resolvers/zod'",
      "import { useState } from 'react'",
      "import { useForm } from 'react-hook-form'",
      "import { z } from 'zod'",
      ...(address ? [`import { api } from '${base}/api/client'`] : []),
      `import FieldError from '${base}/components/form/FieldError'`,
      ...motionImports(ctx.motion, base), ...showImport(ctx.show, base), '',
      '/** The rules each answer must follow (from the editor). Change a rule or a message here. */',
      schemaSource(schema, fields), '',
      `export type ${name}Values = z.infer<typeof ${schema}>`, '',
      ...(address ? ['/** Where the answers are sent (POST, as JSON). */', `const ADDRESS = ${JSON.stringify(address)}`] : []),
      `const THANKS = ${JSON.stringify(success)}`, '',
      `/** Checks every answer with Zod before sending; shows each problem next to its box. */`,
      `export default function ${name}() {`,
      `  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm({ resolver: zodResolver(${schema}) })`,
      '  const [sent, setSent] = useState(false)', '',
      `  const onSubmit = async (values: ${name}Values) => {`,
      '    try {', ...sendLines(address), '      setSent(true)', '      reset()',
      '    } catch {', "      setError('root', { message: 'Couldn’t send. Please try again.' })", '    }', '  }', '',
      `  if (sent) return ${thanks}`,
      '  return (', body, '  )', '}', '',
    ].join('\n'),
  }
}

/** Finds the set-up forms in a part and writes a component for each (React Hook Form + Zod). */
export function formComponents(ctx: JsxContext, rootId: string, takeName: TakeName, base: string) {
  const forms = new Map<string, string>()
  const files: ComponentFile[] = []
  for (const id of collectSubtreeIds(ctx.nodes, rootId)) {
    if (!isCheckedForm(ctx.nodes, id) || [...forms.keys()].some((outer) => collectSubtreeIds(ctx.nodes, outer).includes(id))) continue
    const name = takeName(formName(ctx.nodes, ctx.nodes[id] as ElementNode))
    files.push(formFile(ctx, ctx.nodes[id] as ElementNode, name, base))
    forms.set(id, name)
  }
  return { forms, files }
}

/** Does the project have a form that needs the form libraries (and the API client, for sending)? */
export function formNeeds(nodes: NodeMap): { forms: boolean; api: boolean } {
  const forms = Object.keys(nodes).filter((id) => isCheckedForm(nodes, id))
  return { forms: forms.length > 0, api: forms.some((id) => Boolean(formSettings(nodes[id] as ElementNode).address)) }
}

/** The form kit, libraries and (when a form sends somewhere) the API client a project's forms need. */
export function formProject(nodes: NodeMap): { files: Record<string, string>; deps: Record<string, string> } {
  const needs = formNeeds(nodes)
  if (!needs.forms) return { files: {}, deps: {} }
  return {
    files: { ...formKitFiles(), ...(needs.api ? clientFiles() : {}) },
    deps: { ...FORM_DEPS, ...(needs.api ? { axios: AUTH_DEPS.axios } : {}) },
  }
}
