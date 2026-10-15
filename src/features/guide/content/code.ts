import type { Group } from '../guideTypes'

export const CODE: Group = {
  id: 'code', title: 'Code and download', icon: 'code',
  intro: 'Take your site with you, or look under the hood.',
  topics: [
    {
      id: 'downloads', title: 'Download and share', summary: 'Web page, .zip, React project, picture.',
      brief: "Download → choose a web page, a website .zip, a React project, a picture, or copy the code.",
      blocks: [
        { kind: 'figure', src: '/guide/art-downloads.svg', alt: 'Download as a web page, a website, a React project or a picture', caption: 'Download as a web page, a website, a React project or a picture' },
        { kind: 'table', head: ['Choice', 'What you get', 'Good for'], rows: [
          ['**Web page (.html)**', 'One file that works anywhere', 'Simple pages, email attachments'],
          ['**Website (.zip)**', 'One .html file per page, with shared styles', 'Putting a site on ordinary hosting'],
          ['**React project (.zip)**', 'A TypeScript project: one component per part, routing, forms with checks, data hooks', 'Handing to a developer, growing into an app'],
          ['**Picture (.png)**', 'A picture of your page', 'Mock-ups and sharing'],
          ['**Copy the code**', 'The page’s code on your clipboard', 'Pasting elsewhere'],
        ] },
        { kind: 'note', text: 'In a downloaded .html site, pages for signed-in people send signed-out visitors to the login page, but anyone can open the files: it can’t keep secrets. Use the React project for real protection.' },
      ],
    },
    {
      id: 'react-project', title: 'Run your React project', summary: 'What to do after downloading the React project.',
      brief: "Unzip → npm install → npm run dev. Copy .env.example to .env to use live data and keys.",
      blocks: [
        { kind: 'figure', src: '/guide/art-react-project.svg', alt: 'Run your React project', caption: 'Run your React project' },
        { kind: 'steps', items: [
          'Unzip the download and open the folder in a terminal (you need Node.js installed).',
          'Run **npm install**, then **npm run dev**. Open the address it prints.',
          'Copy **.env.example** to **.env** to set options. The project’s **README** explains each file.',
        ] },
        { kind: 'table', head: ['Setting in .env', 'Meaning'], rows: [
          ['VITE_USE_MOCK', 'true (default): sample data and demo accounts. false: your real API and sign-in.'],
          ['VITE_API_URL', 'The start of your API’s addresses, when they begin with “/”.'],
          ['VITE_API_KEY (or the name you chose)', 'The key sent to your API. Visitors can see it, so use a website-safe key.'],
          ['VITE_FLAGS', 'Comma-separated feature flags to switch on, like beta,newCheckout.'],
        ] },
        { kind: 'p', text: 'Websites use **React Router** (you can choose **TanStack Router** when downloading). Data uses **React Query** and **axios**; forms use **React Hook Form** and **Zod**; animation uses **Motion**.' },
      ],
    },
    {
      id: 'code-tab', title: 'The Code tab', summary: 'Edit the page’s HTML, styles and scripts.',
      brief: "Left rail → Code: Page code (press Apply), Styles (CSS) and Scripts. Everything updates the page.",
      blocks: [
        { kind: 'figure', src: '/guide/ui-code.png', alt: 'The Code panel', caption: 'Page code, styles and scripts, with colors and line numbers.' },
        { kind: 'p', text: 'Open **Code** on the left rail. **Page code** is the whole page (HTML, CSS and JavaScript): change it and press **Apply** to update everything. **Styles (CSS)** and each **Script** update the page as you type. All of them have colors, line numbers, search (Ctrl+F) and their own undo.' },
        { kind: 'note', text: 'If you paste code that uses features Tweak doesn’t understand, nothing is lost: it is kept and exported as it was.' },
      ],
    },
    {
      id: 'react-view', title: 'See and edit the React code', summary: 'The component for whatever you selected.',
      brief: "Code → React (TSX): pick a part to see its React component. Edit plain markup and press Apply to page.",
      blocks: [
        { kind: 'figure', src: '/guide/art-react-view.svg', alt: 'Select a part of the page to see its React component', caption: 'Select a part of the page to see its React component' },
        { kind: 'p', text: 'In **Code**, switch to **React (TSX)**. It shows the real React component for whatever you selected (a section, a repeated card, a form…), with a picker for every other component and **Copy code**.' },
        { kind: 'list', items: [
          '**Plain markup** (a header, hero, footer, a section) can be edited: change words, tags or attributes, then press **Apply to page**. The page follows, and things you only changed in the settings (like colors) are kept.',
          'Components with **code in them** (lists, forms, menus, pop-ups, cards with data) are **read-only**, and the reason is shown.',
          'A mistake is shown with its line number and nothing is applied. **Undo my changes** resets the box.',
        ] },
      ],
    },
  ],
}
