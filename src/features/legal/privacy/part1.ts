import type { LegalSection } from '../types'

/** Privacy Policy, sections 1 to 3: who we are, the short version, what we collect. */
export const PRIVACY_PART_1: LegalSection[] = [
  {
    id: 'who', title: 'Who we are',
    blocks: [
      { kind: 'p', text: '**{operator}** (“we”, “us”) runs Tweak, the website editor you are using. We decide why and how your personal data is used, which makes us the “controller” of it under laws such as the EU and UK GDPR. You can reach us at **{email}**, or by post at {address}.' },
      { kind: 'p', text: 'This policy explains what personal data we handle, why, who else sees it, how long we keep it, and what choices you have. It goes with our [Terms of Use](/terms).' },
    ],
  },
  {
    id: 'short', title: 'The short version',
    blocks: [
      { kind: 'list', items: [
        '**You can try Tweak without an account.** The page you work on then stays in your own browser.',
        '**With an account** we keep your name, email and the pages you save, so you can come back to them.',
        '**We never see your password.** Sign-in is handled by Google’s Firebase.',
        '**We do not sell your personal data** and we do not show ads.',
        '**Usage stats are counts** (for example “a page was downloaded”), never the content of your pages, and tied at most to an anonymous account id, never to your name or email. They switch off by themselves if your browser sends Do Not Track, and you can switch them off in the account menu.',
        '**Pages you make public are public.** Anyone with the link can see and copy them.',
        '**Pages you download or share do not carry our tracking.**',
      ] },
    ],
  },
  {
    id: 'collect', title: 'What we collect',
    blocks: [
      { kind: 'table', head: ['What', 'Details', 'Where it comes from'], rows: [
        ['Account details', 'Your name, email address, profile picture (when you sign in with Google or GitHub), a sign-in method and account id, your plan and how many pages you have saved. Passwords are stored by Firebase Authentication in protected form; we cannot read them.', 'You, or Google / GitHub when you choose to sign in with them'],
        ['Your content', 'The pages you save or publish: their HTML, CSS, JavaScript, words, pictures, settings, data tables you type or import, and the addresses of any API you connect. An API key you type to test a connection is used in your browser only and is not saved in your page.', 'You'],
        ['Pictures and thumbnails', 'Pictures you upload and the small preview picture made of each saved page.', 'You, and the app when it makes a thumbnail'],
        ['Usage stats', 'Counts of what is used (for example pasting code, adding a block, downloading), which screen was opened (page addresses with ids removed), the kind of error that occurred, and how fast pages load. Never the content of your pages, your code, names or emails. When you are signed in they carry your anonymous account id and plan, so we can tell one account’s use from another’s.', 'Your browser, while usage stats are on'],
        ['Payments and earnings (when switched on)', 'The payment’s number, amount, status and date, the plan or page it was for; a seller’s sales, balance and payout requests, and the wallet address a seller gives us. We never receive your wallet’s private keys. Card details are not used: payments are in cryptocurrency through a payment service.', 'You, and the payment service'],
        ['Technical data', 'Your IP address, browser and device type, and the time of each request. Our hosting and database providers process this to deliver the Service and keep it secure.', 'Your browser'],
        ['Messages', 'What you write to us and our replies, and the emails the Service sends for you (such as a password-reset email).', 'You'],
      ] },
      { kind: 'p', text: 'We do not knowingly collect “special category” data (such as health or political opinions). Please do not put it in pages you save with us unless you have to, and never put other people’s sensitive data there.' },
    ],
  },
]
