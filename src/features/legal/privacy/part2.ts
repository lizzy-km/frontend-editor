import type { LegalSection } from '../types'

/** Privacy Policy, sections 4 to 8: why we use data, sharing, public content, transfers, browser storage. */
export const PRIVACY_PART_2: LegalSection[] = [
  {
    id: 'use', title: 'Why we use your data, and the legal reason',
    blocks: [
      { kind: 'table', head: ['Purpose', 'Legal reason (EU / UK GDPR)'], rows: [
        ['Make the Service work: sign you in, save and open your pages, make downloads, show the gallery, deliver uploads, handle plans and purchases', 'Performing our contract with you (our Terms)'],
        ['Keep the Service safe and fair: stop abuse and fraud, fix faults, keep logs, enforce limits and our Terms', 'Our legitimate interests in a secure and reliable service'],
        ['Understand what is used and what is slow, so we can improve the editor (usage stats)', 'Your consent, shown by leaving usage stats on; we ask for none while your browser says Do Not Track. You can turn it off at any time'],
        ['Answer you, send the emails you ask for (such as password reset) and service notices', 'Performing our contract; our legitimate interests in supporting you'],
        ['Keep payment and tax records, and respond to lawful requests', 'Our legal obligations'],
      ] },
      { kind: 'p', text: 'We do not use your data to build advertising profiles, we do not sell it, and we do not make decisions about you by automated means that have legal or similarly significant effects.' },
    ],
  },
  {
    id: 'public', title: 'What other people can see',
    blocks: [
      { kind: 'list', items: [
        '**Public pages** can be opened by anyone with the link, appear in the gallery with the name you use on your account, and can be copied by other people. Make a page private again at any time: copies others already made stay theirs.',
        '**Marketplace listings** (when switched on) show your title, description, picture, price and display name to everyone. A buyer receives a private copy of the page you sold.',
        '**Private pages, your email and your payment details** are not shown to other people.',
      ] },
    ],
  },
  {
    id: 'share', title: 'Who we share data with',
    blocks: [
      { kind: 'p', text: 'We use trusted companies (“processors”) to run parts of the Service. They may only use your data to provide their service to us, under their agreements with us.' },
      { kind: 'table', head: ['Company', 'What for', 'What they handle'], rows: [
        ['Google (Firebase Authentication, Cloud Firestore, Google Analytics)', 'Sign-in, the database that stores accounts and pages, and usage stats', 'Account details, your saved pages, anonymous usage stats, technical data'],
        ['Google and GitHub (sign-in)', 'When you choose “Continue with Google / GitHub”', 'The sign-in details they share with us: name, email, picture'],
        ['Cloudflare', 'Storing the pictures you upload and page thumbnails, and running our small servers (Workers)', 'Uploaded pictures and thumbnails, technical data'],
        ['Vercel', 'Hosting the website and counting page views without cookies (Web Analytics)', 'Technical data, page addresses with ids removed'],
        ['NOWPayments (when payments are switched on)', 'Taking and confirming cryptocurrency payments', 'The amount, the payment number and what you pay with, on their own page under their own policy'],
      ] },
      { kind: 'p', text: 'We may also share data when the law requires it (a court order, for example), to protect people or the Service from harm or fraud, or in a merger, sale or reorganisation of our business (you would be told, and this policy would keep applying to your data). We do not sell or “share” personal data for advertising as those words are used in the California privacy laws.' },
      { kind: 'note', text: 'The pages you paste can load fonts, pictures, scripts and data from other websites (for example Google Fonts, Unsplash or a CDN). When you edit or preview such a page your browser contacts those sites, which can see your IP address. We do not control them.' },
    ],
  },
  {
    id: 'transfers', title: 'Moving data between countries',
    blocks: [{ kind: 'p', text: 'Our providers run servers in several countries, including the United States, so your data may be processed outside the country where you live. Where the law requires it, we rely on safeguards such as the European Commission’s standard contractual clauses or an adequacy decision for these transfers.' }],
  },
  {
    id: 'storage', title: 'Cookies and storage in your browser',
    blocks: [
      { kind: 'p', text: 'We keep a few small items in your browser. Apart from the optional analytics cookies, they are needed for the Service to work or to remember a choice you made, and none are used for advertising.' },
      { kind: 'table', head: ['Name', 'What it is for', 'Kept'], rows: [
        ['tweak:try-draft', 'The page you are working on when you try Tweak without an account', 'Until you clear it or start another page'],
        ['tweak:signed-in', 'A note that you signed in before, so menus can say “My pages”', 'Until you sign out'],
        ['tweak:analytics', 'Your “Share usage stats” choice', 'Until you change it'],
        ['theme', 'Light or dark look', 'Until you change it'],
        ['tweak:code-sections', 'Which code sections you left open in the editor', 'Until you clear it'],
        ['auth:redirect', 'Where to go after you sign in', 'Until you close the tab'],
        ['Firebase sign-in data', 'Keeps you signed in on this device (set by Firebase Authentication)', 'Until you sign out'],
        ['_ga, _ga_*', 'Google Analytics cookies that tell visits apart; set only while usage stats are on', 'Up to two years'],
      ] },
      { kind: 'p', text: 'You can delete these in your browser settings. Clearing the page draft means losing a page you did not save.' },
    ],
  },
]
