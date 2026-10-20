import { PLANS } from '@/features/billing/plans'
import type { LegalSection } from '../types'

const free = PLANS.free
const pro = PLANS.pro

/** Terms, sections 1 to 5: the agreement, the service, accounts, your content, acceptable use. */
export const TERMS_PART_1: LegalSection[] = [
  {
    id: 'agreement', title: 'Who these terms are between',
    blocks: [
      { kind: 'p', text: 'These Terms of Use (the “Terms”) are an agreement between you and **{operator}** (“we”, “us”, “our”). They apply when you visit or use Tweak, the website editor at this address, including the editor, the examples, the guides, the gallery, your saved pages and, where they are switched on, paid plans and the marketplace (together, the “Service”).' },
      { kind: 'p', text: 'By opening the editor, creating an account or otherwise using the Service you agree to these Terms and to our [Privacy Policy](/privacy). If you do not agree, please do not use the Service.' },
      { kind: 'p', text: 'You must be at least **16 years old** (or the age at which you can form a binding contract where you live, if that is higher). If you use the Service for an organisation, you confirm that you may bind it, and “you” includes the organisation.' },
    ],
  },
  {
    id: 'service', title: 'What the Service is',
    blocks: [
      { kind: 'p', text: 'Tweak is an editor for web pages. You paste the HTML, CSS and JavaScript of a page (for example one an AI wrote) or start from a blank page or one of our examples, change it by clicking, and then preview it, share it, or download it as a web page, a .zip file, a picture or a React project.' },
      { kind: 'list', items: [
        '**Trying it** needs no account. The page you work on is kept in your own browser.',
        '**With an account** you can save pages, share a public link, use the gallery, keep components and upload pictures.',
        'The Service is provided as it is and keeps changing. We may add, change, limit or remove features, and we may take the Service down for maintenance. We will try to give notice of changes that matter to you.',
      ] },
      { kind: 'note', text: 'Tweak is a tool. It does not check that a page is correct, safe, accessible, lawful or suitable for your purpose. That stays your responsibility.' },
    ],
  },
  {
    id: 'accounts', title: 'Your account and plan',
    blocks: [
      { kind: 'list', items: [
        'Give correct information when you sign up and keep it up to date. One account is for one person.',
        'You can sign in with an email and password, or with a Google or GitHub account. Keep your password and your sign-in accounts safe. You are responsible for what happens under your account, and you should tell us at once at {email} if you think someone else is using it.',
        `The **${free.name}** plan lets you save up to ${free.maxProjects} pages and download or copy the code of each saved page ${free.maxDownloadsPerMonth ?? 'many'} times a calendar month. The **${pro.name}** plan raises this to ${pro.maxProjects} saved pages with no monthly download limit. Limits can change; a change never removes pages you already saved.`,
        'You may stop using the Service at any time. See “Ending your use” below for what happens to your pages.',
      ] },
    ],
  },
  {
    id: 'content', title: 'Your content and what you let us do with it',
    blocks: [
      { kind: 'p', text: '**You keep all rights in what you make.** “Your content” means the pages, code, text, pictures, data, components and listings you create, paste, import, upload or publish with the Service. We do not claim ownership of it.' },
      { kind: 'p', text: 'To run the Service for you, you give us a worldwide, non-exclusive, royalty-free licence to host, store, copy, process, display and transmit your content, only as needed to provide, protect and improve the Service (for example to save your page, show it in Preview, make a thumbnail, deliver a download, and keep backups).' },
      { kind: 'p', text: '**Public pages.** If you choose to make a page public, anyone with the link can see it, it can appear in the gallery with your display name, and other people can **make their own copy** of it and change it. By making a page public you give every person who views it a non-exclusive licence to view it and to copy and edit it for their own use through the Service. You can make it private again at any time; copies already made stay with the people who made them.' },
      { kind: 'p', text: 'You promise that you have the rights needed to use your content this way, and that it (and its use as described here) does not break the law or anyone else’s rights. This includes code, pictures, fonts, text and data from other people or from an AI tool: check the terms they come with. Content you paste from an AI may be similar to what others receive; we make no promise that it is original.' },
    ],
  },
  {
    id: 'use', title: 'What you must not do',
    blocks: [
      { kind: 'p', text: 'You agree not to use the Service, and not to build or publish with it, anything that:' },
      { kind: 'list', items: [
        'is illegal, or helps someone else to break the law;',
        'infringes copyright, trademark, privacy or other rights of others, or uses someone else’s name, brand or look to mislead;',
        'is harmful code: malware, scripts that attack other sites or visitors, cryptominers, or code meant to damage or take control of a device;',
        'collects passwords, card or wallet details, or other personal data under false pretenses (phishing), or pretends to be a bank, a company or a person you are not;',
        'is hateful, threatens or harasses people, sexually exploits children, promotes violence or self-harm, or is sexually explicit;',
        'sends spam, or is made to deceive, scam or defraud people;',
        'tries to get around limits, security, the sandbox that keeps page code away from the editor, or access rules, probes or overloads the Service, or scrapes it automatically without our written permission;',
        'uses the Service to build a competing copy of it, or resells access to it, without our written permission.',
      ] },
      { kind: 'p', text: 'We may remove content, hide a public page or listing, limit features, or suspend or close an account if we reasonably believe these Terms are being broken, if the law requires it, or to protect people or the Service. Where we reasonably can, we will tell you why and give you a chance to fix the problem first.' },
    ],
  },
]
