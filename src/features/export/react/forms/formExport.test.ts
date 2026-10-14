import { describe, expect, it } from 'vitest'
import { CONTACT_FORM_HTML, SIGN_UP_FORM_HTML } from '@/features/editor/model/formBlocks'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { buildReactProject } from '../buildReactProject'

const project = (html: string) => buildReactProject(parseHtmlDocument(`<body><header>Hi</header>${html}</body>`))
const fileWith = (files: Record<string, string>, text: string) => Object.entries(files).find(([, code]) => code.includes(text))

describe('form export', () => {
  it('writes a React Hook Form + Zod component for a set-up form', () => {
    const files = project(CONTACT_FORM_HTML.replace('<form ', '<form action="https://api.example.com/contact" '))
    const form = files['src/components/GetInTouchForm.tsx']!
    expect(form).toContain('useForm({ resolver: zodResolver(getInTouchFormSchema) })')
    expect(form).toContain("name: z.string().trim().min(1, \"Please fill in “Your name”.\").min(2,")
    expect(form).toContain('email: z.string().trim().min(1, "Please fill in “Email”.").pipe(z.email(')
    expect(form).toContain('newsletter: z.boolean()')
    expect(form).toContain(`{...register("email")}`)
    expect(form).toContain('<FieldError error={errors.email} />')
    expect(form).toContain('<FieldError error={errors.root} />')
    expect(form).toContain('noValidate onSubmit={handleSubmit(onSubmit)}')
    expect(form).toContain('await api.post(ADDRESS, values)')
    expect(form).not.toContain('name="email"')
    expect(fileWith(files, '<GetInTouchForm />')).toBeTruthy()
    expect(files['src/components/form/FieldError.tsx']).toBeTruthy()
    expect(files['src/api/client.ts']).toBeTruthy()
    expect(Object.keys(JSON.parse(files['package.json']!).dependencies)).toEqual(expect.arrayContaining(['react-hook-form', 'zod', '@hookform/resolvers', 'axios']))
  })

  it('checks "Same as" fields and needs no API client without an address', () => {
    const files = project(SIGN_UP_FORM_HTML)
    const form = files['src/components/CreateYourAccountForm.tsx']!
    expect(form).toContain(`.refine((values) => values["confirmPassword"] === values["password"], { path: ["confirmPassword"]`)
    expect(form).toContain('terms: z.literal(true')
    expect(form).toContain("console.info('Form answers', values)")
    expect(files['src/api/client.ts']).toBeUndefined()
  })

  it('leaves forms that were not set up as plain JSX', () => {
    const files = project('<form><input name="q"><button>Search</button></form>')
    expect(fileWith(files, 'useForm')).toBeUndefined()
    expect(files['src/components/form/FieldError.tsx']).toBeUndefined()
  })
})
