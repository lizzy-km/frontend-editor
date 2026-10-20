import type { LegalSection } from '../types'

/** Privacy Policy, sections 9 to 15: keeping data, your rights, security, children, your own visitors, changes, contact. */
export const PRIVACY_PART_3: LegalSection[] = [
  {
    id: 'keep', title: 'How long we keep data',
    blocks: [
      { kind: 'table', head: ['Data', 'How long'], rows: [
        ['Account details and saved pages', 'Until you delete a page or ask us to close your account; then removed within 30 days (backups may take up to 90 days more to drop it)'],
        ['Uploaded pictures and thumbnails', 'As long as the page or account they belong to; then removed with it'],
        ['Usage stats', 'No longer than 14 months, in the analytics settings we use; they carry at most an anonymous account id, never your name or email'],
        ['Payment, order and payout records', 'As long as the law requires us to keep accounting and tax records (often several years), then deleted or anonymised'],
        ['Security logs', 'A short time, normally under 90 days'],
        ['Messages to us', 'As long as needed to deal with your question, and a reasonable time after'],
      ] },
    ],
  },
  {
    id: 'rights', title: 'Your choices and rights',
    blocks: [
      { kind: 'p', text: 'Whatever country you live in, you can ask us to tell you what we hold about you, correct it, delete it, or give you a copy. Depending on where you live (for example in the EU, the UK, Switzerland, California and other US states, Singapore or Australia) the law gives you more, including the right to:' },
      { kind: 'list', items: [
        '**access** your personal data and get a copy of it in a common format (portability);',
        '**correct** what is wrong, and **delete** what we no longer need;',
        '**object** to or **restrict** some uses, including use based on our legitimate interests;',
        '**withdraw consent** at any time (for usage stats: the account menu, “Share usage stats”, or a Do Not Track / Global Privacy Control setting in your browser). Withdrawing does not affect what was done before;',
        '**not be treated worse** for using these rights.',
      ] },
      { kind: 'p', text: 'You can already download all your pages yourself. For anything else, write to **{email}** from the address on your account so we can confirm it is you. We answer within 30 days (45 where the law allows). If you are not happy with our answer you can complain to your data protection authority (in the EU and UK, the authority of your country) and we would welcome the chance to put things right first.' },
      { kind: 'note', text: 'At the moment closing an account is done by email, not by a button. We will delete your account and saved pages as described above.' },
    ],
  },
  {
    id: 'security', title: 'Keeping your data safe',
    blocks: [{ kind: 'p', text: 'We use measures that fit the risk: encrypted connections, access rules that let each person reach only their own pages, a locked frame that keeps page code away from the editor and your account, money handled only on a separate server, and limits on who at the company can reach data. No system is perfectly secure. If a breach is likely to put your rights at risk we will tell you and the authorities as the law requires.' }],
  },
  {
    id: 'children', title: 'Children',
    blocks: [{ kind: 'p', text: 'Tweak is not meant for people under 16 and we do not knowingly collect their data. If you think a child has given us personal data, write to {email} and we will delete it.' }],
  },
  {
    id: 'visitors', title: 'If you build sites with Tweak',
    blocks: [{ kind: 'p', text: 'When you publish a site you made, **you** decide what it collects from your visitors (forms, sign-in, analytics, cookies, fonts and scripts from other companies) and you are responsible for telling them and following the law that applies to you. We do not add trackers to pages you download or share. If your page collects personal data from other people, you are the controller for it and we only store the page for you.' }],
  },
  {
    id: 'changes', title: 'Changes to this policy',
    blocks: [{ kind: 'p', text: 'We will update this policy when what we do changes. We will change the “last updated” date, and show a notice in the app or email you when a change matters to you.' }],
  },
  {
    id: 'contact', title: 'Contact us',
    blocks: [{ kind: 'p', text: 'For anything about your data, write to **{operator}**, **{email}**, {address}.' }],
  },
]
