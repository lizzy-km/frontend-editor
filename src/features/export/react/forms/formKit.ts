/** Ready-made form parts (src/components/form/) for React Hook Form + Zod, added with the first form. */

export const FORM_DEPS = { 'react-hook-form': '^7.62.0', '@hookform/resolvers': '^5.2.0', zod: '^4.1.0' }

const FIELD_ERROR = `import type { FieldError as Problem } from 'react-hook-form'

/** The message for a field that breaks a rule (nothing when it is fine). */
export default function FieldError({ error }: { error?: Pick<Problem, 'message'> }) {
  if (!error?.message) return null
  return <p role="alert" className="field-error" style={{ color: '#b91c1c', fontSize: 13, fontWeight: 500, margin: '4px 0 0' }}>{error.message}</p>
}
`

const FORM = `import type { ReactNode } from 'react'
import { FormProvider, type FieldValues, type SubmitHandler, type UseFormReturn } from 'react-hook-form'
import FieldError from './FieldError'

type Props<T extends FieldValues, Out> = {
  /** useForm({ resolver: zodResolver(schema) }) */
  form: UseFormReturn<T, unknown, Out>
  onSubmit: SubmitHandler<Out>
  children: ReactNode
  className?: string
}

/**
 * A form whose fields (TextField, PasswordField…) find their rules and errors
 * by name. Problems the server reports go in setError('root', …).
 */
export default function Form<T extends FieldValues, Out>({ form, onSubmit, children, className }: Props<T, Out>) {
  return (
    <FormProvider {...form}>
      <form className={className} noValidate onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'grid', gap: 16 }}>
        {children}
        <FieldError error={form.formState.errors.root} />
      </form>
    </FormProvider>
  )
}
`

const SHARED = `import type { ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import FieldError from './FieldError'

export const labelStyle = { display: 'grid', gap: 6, fontSize: 14, fontWeight: 600 } as const
export const inputStyle = { font: 'inherit', fontWeight: 400, padding: '11px 14px', border: '1px solid #d6d3d1', borderRadius: 10 } as const

/** Label, the control, a hint and the error: the frame every field shares. */
export function FieldFrame({ name, label, hint, children }: { name: string; label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  const { formState } = useFormContext()
  return (
    <label style={labelStyle}>
      {label}
      {children}
      {hint && <small style={{ fontWeight: 400, color: '#57534e' }}>{hint}</small>}
      <FieldError error={formState.errors[name] as { message?: string } | undefined} />
    </label>
  )
}
`

const TEXT_FIELD = `import type { InputHTMLAttributes, ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { FieldFrame, inputStyle } from './FieldFrame'

type Props = { name: string; label: ReactNode; hint?: ReactNode } & Omit<InputHTMLAttributes<HTMLInputElement>, 'name'>

/** A one-line answer: text, email, phone, number, date… */
export default function TextField({ name, label, hint, ...input }: Props) {
  const { register, formState } = useFormContext()
  return (
    <FieldFrame name={name} label={label} hint={hint}>
      <input style={inputStyle} aria-invalid={Boolean(formState.errors[name])} {...input} {...register(name)} />
    </FieldFrame>
  )
}
`

const PASSWORD_FIELD = `import { useState, type ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { FieldFrame, inputStyle } from './FieldFrame'

/** A password with a Show / Hide button. */
export default function PasswordField({ name, label, hint, autoComplete = 'current-password' }: { name: string; label: ReactNode; hint?: ReactNode; autoComplete?: string }) {
  const { register, formState } = useFormContext()
  const [visible, setVisible] = useState(false)
  return (
    <FieldFrame name={name} label={label} hint={hint}>
      <span style={{ display: 'flex', gap: 6 }}>
        <input style={{ ...inputStyle, flex: 1 }} type={visible ? 'text' : 'password'} autoComplete={autoComplete} aria-invalid={Boolean(formState.errors[name])} {...register(name)} />
        <button type="button" onClick={() => setVisible(!visible)} aria-pressed={visible}>{visible ? 'Hide' : 'Show'}</button>
      </span>
    </FieldFrame>
  )
}
`

const CHOICE_FIELDS = `import type { ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import FieldError from './FieldError'
import { FieldFrame, inputStyle } from './FieldFrame'

/** Pick one from a list. */
export function SelectField({ name, label, options, placeholder = 'Choose one' }: { name: string; label: ReactNode; options: { value: string; label: string }[]; placeholder?: string }) {
  const { register } = useFormContext()
  return (
    <FieldFrame name={name} label={label}>
      <select style={inputStyle} {...register(name)}>
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </FieldFrame>
  )
}

/** A longer answer. */
export function TextareaField({ name, label, rows = 5 }: { name: string; label: ReactNode; rows?: number }) {
  const { register } = useFormContext()
  return <FieldFrame name={name} label={label}><textarea style={inputStyle} rows={rows} {...register(name)} /></FieldFrame>
}

/** A tick box ("I accept the terms"). */
export function CheckboxField({ name, label }: { name: string; label: ReactNode }) {
  const { register, formState } = useFormContext()
  return (
    <div>
      <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14 }}><input type="checkbox" {...register(name)} /> {label}</label>
      <FieldError error={formState.errors[name] as { message?: string } | undefined} />
    </div>
  )
}

/** The send button: shows it is busy while sending. */
export function SubmitButton({ children, busy = 'Sending…' }: { children: ReactNode; busy?: ReactNode }) {
  const { formState } = useFormContext()
  return <button type="submit" disabled={formState.isSubmitting}>{formState.isSubmitting ? busy : children}</button>
}
`

/** src/components/form/*: FieldError (used by every exported form) and the kit for new forms. */
export const formKitFiles = (): Record<string, string> => ({
  'src/components/form/FieldError.tsx': FIELD_ERROR,
  'src/components/form/Form.tsx': FORM,
  'src/components/form/FieldFrame.tsx': SHARED,
  'src/components/form/TextField.tsx': TEXT_FIELD,
  'src/components/form/PasswordField.tsx': PASSWORD_FIELD,
  'src/components/form/fields.tsx': CHOICE_FIELDS,
})
