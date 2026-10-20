import { PLANS } from '@/features/billing/plans'
import { LISTING_PRICE, MARKET_FEE_PERCENT, MIN_PAYOUT_USD } from '@/features/marketplace/types'
import type { LegalSection } from '../types'

const pro = PLANS.pro

/** Terms, sections 6 to 10: running page code, downloads, paid plans, the marketplace, other services. */
export const TERMS_PART_2: LegalSection[] = [
  {
    id: 'page-code', title: 'Page code and what visitors see',
    blocks: [
      { kind: 'p', text: 'Pages can contain JavaScript. While you edit or preview, the code runs inside a locked frame that is kept apart from the editor and from your account. We do not read or review the pages you make, and a page shown to visitors is run by their browsers, not by us.' },
      { kind: 'list', items: [
        'You are responsible for every page you publish, share or download, and for the way it treats its visitors: their data, their consent, accessibility, and the laws that apply where you and they are.',
        'Pages and exports can load other things from the internet (fonts, pictures, libraries, data from an API). Those come from third parties under their own terms and privacy policies; we are not responsible for them.',
        'Opening someone else’s public page means running code you did not write. Only open pages you trust, and do not enter passwords or payment details into a page you are not sure about.',
      ] },
    ],
  },
  {
    id: 'downloads', title: 'Downloads and exports',
    blocks: [
      { kind: 'p', text: 'What you download (a web page, a .zip, a picture or a React project) is your content. We give you a licence to use the code we generate for it, including in commercial projects, with no need to credit us. Libraries and files included in a download come with their own licences, and the generated projects are provided “as is”: test them before you rely on them.' },
      { kind: 'p', text: 'A downloaded or shared site does not contain our analytics. If you add analytics, cookies, sign-in or payments to your own site, you are the one who must tell your visitors and follow the rules for them.' },
    ],
  },
  {
    id: 'plans', title: 'Paid plans and payments', when: 'billing',
    blocks: [
      { kind: 'list', items: [
        `The **${pro.name}** plan costs US$${pro.priceUsd} per month and is paid for in advance in cryptocurrency, through a payment service we use (currently NOWPayments). There is **no automatic renewal**: each payment adds the months you paid for, and paying again before the end adds to what you have left.`,
        'The plan starts when the payment service confirms that the full amount has arrived. If too little arrives, or the payment expires or fails, your plan does not change and you can try again. Network fees and exchange rates are set by the payment service and the blockchain, not by us.',
        'When your paid time ends your account returns to the Free plan. Nothing is deleted, but Free limits apply: if you have more pages than the Free plan allows, you can still open, download and delete them, and you cannot save new ones until you are under the limit.',
        'Cryptocurrency payments cannot be reversed by us once confirmed. We give a refund only when the law requires it, or when we charged you by mistake or could not provide the plan. Write to {email} within 14 days of the payment with your payment number.',
        'Prices may change. A new price applies to payments made after the change is shown on the Plans page. Taxes (such as VAT or sales tax) are your responsibility unless we state that they are included.',
      ] },
    ],
  },
  {
    id: 'marketplace', title: 'The marketplace', when: 'marketplace',
    blocks: [
      { kind: 'p', text: 'The marketplace lets people sell a copy of a page they made to other people. We provide the place, the checkout and the hand-over. **The sale is between the seller and the buyer**; we are not a party to it and we do not check or endorse what is sold.' },
      { kind: 'p', text: '**Sellers.** You promise that you own, or have the right to sell, everything in the page; that it follows the “What you must not do” section; and that its description is honest. You choose a price between US$' + LISTING_PRICE.min + ' and US$' + LISTING_PRICE.max + '. We keep **' + MARKET_FEE_PERCENT + '%** of each sale as a fee; the rest is added to your earnings. You can pause or change a listing at any time; a listing that has sold can be paused but not deleted. A sale already made keeps the price it was made at.' },
      { kind: 'p', text: '**Payouts.** You can ask for your earnings to be paid out from US$' + MIN_PAYOUT_USD + ', to a wallet address you give us. Payouts are made by hand, in cryptocurrency, to the address you provide: check it carefully, because we cannot recover funds sent to a wrong address. You are responsible for any tax on what you earn. We may delay or refuse a payout, or reverse earnings, where we reasonably suspect fraud, a refund, a breach of these Terms or a legal requirement.' },
      { kind: 'p', text: '**Buyers.** When the payment is confirmed you receive your own private copy of the page in your workspace. The seller keeps their rights in the original. You get a non-exclusive, worldwide, perpetual licence to use and change your copy for your own projects, including commercial ones. You may not resell or list the copy again as it is, or hand it out as a template, unless the seller allows it in their description.' },
      { kind: 'p', text: '**Problems.** Because a copy is delivered digitally and at once, sales are final except where the law gives you a right to a refund, where the page was not delivered, or where it is clearly not what was described. Write to {email} with your order details; we may refund the buyer and take the amount back from the seller’s earnings.' },
    ],
  },
  {
    id: 'third-parties', title: 'Other companies’ services',
    blocks: [
      { kind: 'p', text: 'The Service uses services from other companies, such as sign-in providers (Google, GitHub), hosting and databases, picture storage, analytics and, where it is switched on, a payment service. Your use of their sign-in or payment pages is also under their terms. If one of them stops working, parts of the Service may stop working too, and we are not liable for that.' },
    ],
  },
]
