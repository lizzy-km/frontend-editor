import type { Group } from '../guideTypes'

export const FORMS: Group = {
  id: 'forms', title: 'Forms', icon: 'check',
  intro: 'Contact and sign-up forms that check what people type.',
  topics: [
    {
      id: 'add-form', title: 'Add a form', summary: 'Ready-made contact and sign-up forms.',
      brief: "Add → Contact form or Sign-up form. Select the form, then Actions → Form → Check the answers and send them.",
      blocks: [
        { kind: 'steps', items: [
          'Open **Add** and click **Contact form** (name, email, topic, message) or **Sign-up form** (name, email, password twice, terms).',
          'Select the form and open **Actions → Form**.',
          'Turn on **Check the answers and send them**. Now the form checks every answer before it is sent.',
          'Under **Send to**, paste the address that should receive the answers (optional). Under **Thank-you text**, write what people see afterwards.',
        ] },
        { kind: 'p', text: 'Any form you pasted from an AI works too: select the form and turn the same switch on.' },
        { kind: 'note', text: 'Tweak sends the answers to the address you give it (as data). It doesn’t send emails by itself: ask your form service or developer for the address that receives answers.' },
      ],
    },
    {
      id: 'form-rules', title: 'Rules for each box', summary: 'Must be filled in, length, numbers, same as, messages.',
      brief: "Click an input box → Actions → Input box: set what is allowed and the message people see.",
      blocks: [
        { kind: 'p', text: 'Click a box inside a form and open **Actions → Input box**:' },
        { kind: 'table', head: ['Setting', 'What it does'], rows: [
          ['**Hint text**', 'Grey example text shown before someone types.'],
          ['**Kind**', 'Text, email, password, phone, web address, number, date, tick box, or “one of several”.'],
          ['**Name**', 'What the answer is called when sent.'],
          ['**Must be filled in**', 'The form can’t be sent while it is empty.'],
          ['**Fewest / Most letters**', 'Limits for text. **Smallest / Largest** for numbers.'],
          ['**Same as**', 'For “Repeat password”: must equal another box.'],
          ['**Error message**', 'Your own words when a rule is broken. Left empty, Tweak writes a clear message for each rule.'],
        ] },
      ],
    },
    {
      id: 'form-kinds', title: 'Forms that log people in', summary: 'Log in, create account and reset passwords.',
      brief: "Form → It will: choose Log people in, Create an account, Email a reset link… (the React download makes it real).",
      blocks: [
        { kind: 'p', text: 'In **Actions → Form**, the **It will** choice decides what sending does: **Send the answers**, **Log people in**, **Create an account**, **Email a reset link**, **Set a new password**, or **Confirm email / resend link**. The ready-made sign-in pages already use these.' },
        { kind: 'p', text: 'These need boxes with the usual names (email, password, name). The settings tell you which ones. In **Preview** the form only shows its thank-you text; the React download really signs people in.' },
      ],
    },
  ],
}
