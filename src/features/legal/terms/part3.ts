import type { LegalSection } from '../types'

/** Terms, sections 11 to 20: our rights, privacy, warranties, liability, ending, changes, law, copyright, general, contact. */
export const TERMS_PART_3: LegalSection[] = [
  {
    id: 'our-rights', title: 'Our rights in Tweak',
    blocks: [
      { kind: 'p', text: 'The Service itself (its software, design, texts, examples, guides, names and logos) belongs to us or our licensors and is protected by law. We give you a limited, personal, non-exclusive, non-transferable, revocable right to use it as these Terms allow. You may not copy, sell, reverse engineer or take it apart, except where the law says you may. Our example sites are free for you to use and change in your own projects.' },
      { kind: 'p', text: 'If you send us ideas or feedback, we may use them without having to pay or credit you.' },
    ],
  },
  {
    id: 'privacy', title: 'Privacy',
    blocks: [{ kind: 'p', text: 'How we handle personal data is explained in the [Privacy Policy](/privacy). It is part of these Terms.' }],
  },
  {
    id: 'warranty', title: 'No promises about results',
    blocks: [
      { kind: 'p', text: 'We work to keep the Service useful and safe, but it is provided **“as is” and “as available”**. As far as the law allows, we do not promise that it will be uninterrupted, error-free or secure, that your pages will never be lost, or that it fits your purpose. Keep your own copy of anything important: you can download your pages at any time.' },
      { kind: 'p', text: 'Some places do not allow some of these limits, and nothing here removes rights you have by law as a consumer.' },
    ],
  },
  {
    id: 'liability', title: 'Limits on what we are responsible for',
    blocks: [
      { kind: 'p', text: 'As far as the law allows, we are not liable for indirect or consequential losses, lost profit, lost revenue, lost data or lost goodwill, or for anything caused by content that people other than us made, by the services of other companies, or by events outside our control.' },
      { kind: 'p', text: 'Our total liability to you for everything connected with the Service is limited to the larger of **the amount you paid us in the 12 months before the claim** and **US$50**. Nothing in these Terms limits liability that cannot be limited by law, such as for fraud, or for death or personal injury caused by negligence.' },
    ],
  },
  {
    id: 'indemnity', title: 'If your content causes a claim',
    blocks: [{ kind: 'p', text: 'If someone makes a claim against us because of your content, your use of the Service in breach of these Terms, or a page you published, you will cover our reasonable costs and losses from that claim (including reasonable legal fees), as far as the law allows. We will tell you about the claim and let you help to deal with it.' }],
  },
  {
    id: 'ending', title: 'Ending your use',
    blocks: [
      { kind: 'list', items: [
        'You can stop using the Service at any time. To close your account and delete your saved pages, write to {email} from the address on your account. Download what you want to keep first.',
        'We may suspend or close your account as described in “What you must not do”, or if the account has been unused for a long time (we will warn you first), or if we stop providing the Service (we will give you reasonable notice and time to download your pages).',
        'When an account closes, your right to use the Service ends and we delete or anonymise its personal data as the Privacy Policy describes. Sections that by their nature should continue (such as content licences already given, payments owed, liability and the law that applies) continue.',
      ] },
    ],
  },
  {
    id: 'changes', title: 'Changes to these Terms',
    blocks: [{ kind: 'p', text: 'We may update these Terms. When a change matters we will show a notice in the app or email you, and we will change the “last updated” date above. If you keep using the Service after a change takes effect you accept it. If you do not accept it, stop using the Service and tell us to close your account.' }],
  },
  {
    id: 'law', title: 'Governing law and disputes',
    blocks: [
      { kind: 'p', text: 'These Terms are governed by the laws of **{country}**, without its rules about conflicts of law. Courts there have exclusive authority over disputes about them, except that you keep any right you have to bring a claim in your own country’s courts, and any mandatory consumer protection of the place where you live.' },
      { kind: 'p', text: 'Before starting a claim please write to {email} and give us 30 days to try to solve the problem.' },
    ],
  },
  {
    id: 'copyright', title: 'Copyright complaints',
    blocks: [
      { kind: 'p', text: 'If you believe a page or listing on the Service infringes your copyright, write to {email} with: your name and contact details; what work was copied and where it is shown (the address of the page); a statement that you believe in good faith the use is not allowed by the owner, its agent or the law; a statement that your notice is accurate and that you are the owner or authorised to act for the owner; and your signature (typed is fine).' },
      { kind: 'p', text: 'We may remove or disable the content and tell the person who posted it. If you posted content that was removed by mistake you may send a counter-notice by email. We close the accounts of people who repeatedly infringe.' },
    ],
  },
  {
    id: 'general', title: 'The small print',
    blocks: [
      { kind: 'list', items: [
        '**Whole agreement.** These Terms and the Privacy Policy are the whole agreement between you and us about the Service and replace earlier ones.',
        '**If a part does not work.** If a part of these Terms is found unenforceable, the rest stays in force.',
        '**No waiver.** If we do not enforce a right straight away, we can still do so later.',
        '**Transfers.** You may not transfer your rights under these Terms without our consent. We may transfer ours as part of a merger, sale or reorganisation.',
        '**Events outside our control.** We are not responsible for failures caused by things we cannot reasonably control, such as outages of internet, hosting or payment services, or disasters.',
        '**Language.** If these Terms are translated, the English version prevails when they differ.',
      ] },
    ],
  },
  {
    id: 'contact', title: 'Contact us',
    blocks: [
      { kind: 'p', text: 'Questions about these Terms, a complaint, or a copyright notice: write to **{operator}** at **{email}**. Our postal address is: {address}.' },
    ],
  },
]
