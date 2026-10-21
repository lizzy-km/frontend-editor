import type { Group } from '../guideTypes'

export const START: Group = {
  id: 'start', title: 'Get started', icon: 'sparkle',
  intro: 'Everything you need for your first ten minutes.',
  topics: [
    {
      id: 'what-is-tweak', title: 'What Tweak does', summary: 'Build a website by clicking, with no code.',
      brief: "Paste AI code or start blank, change it by clicking, then share or download it.",
      blocks: [
        { kind: 'figure', src: '/guide/art-what-is-tweak.svg', alt: 'AI code becomes a page you change by clicking, then you share it', caption: 'AI code becomes a page you change by clicking, then you share it' },
        { kind: 'p', text: 'Tweak is a website builder for people who don’t code. You start from a page an AI wrote for you (ChatGPT, Claude, Gemini…) or from a blank page, and you change it by **clicking**: words, pictures, colors, sizes, menus, forms, pages and live data.' },
        { kind: 'p', text: 'When you are done you can **share a link**, or **download** your site as a web page, a .zip of pages, or a full React project that a developer can continue with.' },
        { kind: 'tip', text: 'You never have to read code. If you are curious, the code is always one tab away (**Code**).' },
      ],
    },
    {
      id: 'first-page', title: 'Make your first page', summary: 'Paste a page or start blank, in under a minute.',
      brief: "Try it → choose One page or A website → paste your AI’s answer → Open in editor.",
      blocks: [
        { kind: 'figure', src: '/guide/art-first-page.svg', alt: 'Four steps to your first page', caption: 'Four steps to your first page' },
        { kind: 'steps', items: [
          'Open **Try it** from the home page. You do not need an account.',
          'Choose **One page** (a landing page, an invitation, a menu…) or **A website with several pages**.',
          'Paste the whole answer your AI gave you into the big box. Tweak picks the code out of it. You can also drop an .html file on the box.',
          'Press **Open in editor**. Your page appears, ready to click.',
        ] },
        { kind: 'p', text: 'No code yet? Press **Start with a blank page**, **Try an example page**, or open **No code yet? Get a page from an AI in 3 steps**: pick an idea (a bakery, a wedding, a portfolio…), edit the description in your own words, copy the prompt into your AI, and paste the answer back. A developer? Switch the helper to **A React project (TypeScript)**: the AI then writes a complete multi-page React project (sign-in, sample data, responsive, tidy folders) as a list of files that you save and run on your computer. That kind does not open in Tweak.' },
        { kind: 'figure', src: '/guide/art-examples.svg', alt: 'Start from a finished example: a shop, a cafe, a studio or a members area', caption: 'Start from a finished example: a shop, a cafe, a studio or a members area' },
        { kind: 'p', text: 'Not sure where to begin? Open **No idea yet? Start from a finished example** under the paste box and press **Open this example**. You get a whole website that already works, and every part of it can be changed:' },
        { kind: 'list', items: [
          '**Online shop**: products loaded from a real shop API, search, category buttons, a quick-look pop-up, favourites, a page for each product, a contact form and a basket.',
          '**Cafe and restaurant**: a menu you can search and filter, a table booking form with a date picker, events with pop-ups, opening hours in tabs.',
          '**Studio portfolio**: a project list with filter buttons and a page for every project, a team made of reusable cards, services in tabs, an enquiry form.',
          '**Members and SaaS**: pricing with tabs, sign-in pages, a members-only dashboard, an admin page for one role, and a beta switch that shows or hides a feature.',
        ] },
        { kind: 'note', text: 'Coming back later? **Continue my last page** brings back the page you were on (kept in this browser).' },
      ],
    },
    {
      id: 'account-and-saving', title: 'Accounts, saving and sharing', summary: 'Where your work is kept and how to share it.',
      brief: "Try it saves in this browser. An account saves to the cloud and lets you Share a link.",
      blocks: [
        { kind: 'figure', src: '/guide/art-account-and-saving.svg', alt: 'Your work is kept in the browser until you save it to an account', caption: 'Your work is kept in the browser until you save it to an account' },
        { kind: 'table', head: ['', 'Try it (no account)', 'With an account'], rows: [
          ['Saved', 'In this browser only', 'To your account, automatically'],
          ['Find it again', '“Continue my last page”', 'Under **My pages**, from any device'],
          ['Share a link', 'No', 'Yes (**Share**)'],
          ['Download', 'Yes', 'Yes'],
        ] },
        { kind: 'p', text: 'Create a free account with **Sign in** → **Create account**. After that, open **Save to an account** in the editor to keep your page, and everything saves itself a moment after each change. The toolbar tells you: “All changes saved”.' },
        { kind: 'p', text: '**Share** makes a public link to your page. Turn it off again any time. Public pages can appear in **Explore**, where others can look at them.' },
      ],
    },
    {
      id: 'project-kinds', title: 'One page or a whole website?', summary: 'What changes when you choose a website.',
      brief: "A website has many pages, menus and sign-in. Turn a page into one with Make this a website.",
      blocks: [
        { kind: 'figure', src: '/guide/art-project-kinds.svg', alt: 'One page versus a website with several pages', caption: 'One page versus a website with several pages' },
        { kind: 'p', text: 'A **one page** project is a single scrolling page. A **website** has several pages (Home, About, Contact…) that share one header and footer, plus menus, links between pages, and optionally sign-in.' },
        { kind: 'list', items: [
          'You can turn a page into a website later: click the empty space of the page and press **Make this a website**.',
          'In a website the left side gets a **Pages** tab.',
          'The sign-in pages, menus and detail pages in this guide all need a website.',
        ] },
      ],
    },
  ],
}
