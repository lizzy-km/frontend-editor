import type { Group } from '../guideTypes'

export const HELP: Group = {
  id: 'help', title: 'Help and reference', icon: 'help',
  intro: 'When something doesn’t work, and handy lists.',
  topics: [
    {
      id: 'fix-problems', title: 'Fixing common problems', summary: 'Saving, menus, forms, data and sign-in.',
      brief: "Look up your problem: can’t save, empty menu, form doesn’t send, API test fails, setting not found.",
      blocks: [
        { kind: 'figure', src: '/guide/art-fix-problems.svg', alt: 'Look up the message you see, then follow the fix', caption: 'Look up the message you see, then follow the fix' },
        { kind: 'table', head: ['Problem', 'Try this'], rows: [
          ['“Couldn’t save — check your connection”', 'Check your internet. Your work stays in the editor; it saves again when the connection is back.'],
          ['“Too big to save to your account”', 'The message says what is big. For pictures pasted inside code press **Move pictures out of the code**. For data, remove rows you don’t need. You can still download the page.'],
          ['My menu is empty', 'Pages are left out of the menu until you switch them on: **Pages** → the page → **Show in the top bar / side menu**, then **Update the menu**.'],
          ['A form doesn’t send', 'Check the form has **Check the answers and send them** on, and an address in **Send to**. In Preview it only shows the thank-you text.'],
          ['A card doesn’t open its page', 'Select the list (not a card) → **Actions → Data → On click → Open page**, and check the data has an **id** field.'],
          ['Test connection fails', 'Read the message: key, address, or the service not allowing web pages (CORS). Try the address in your browser’s address bar first.'],
          ['The React project shows sample items', 'Set **VITE_USE_MOCK=false** in **.env** and restart **npm run dev**.'],
          ['I can’t find a setting', 'Design = looks, Actions = behavior, More = rare. Page-wide things (colors, layout) are under **Design** on the left rail.'],
          ['My page looks different in Preview', 'Preview runs the page’s own scripts and animations. The editor shows the finished look but keeps scripts off while you edit.'],
        ] },
      ],
    },
    {
      id: 'shortcuts', title: 'Keyboard shortcuts', summary: 'Faster editing.',
      brief: "Ctrl+Z undo · Ctrl+Y redo · Ctrl+D copy · Delete remove · Esc parent · Enter edit text · Ctrl+S save.",
      blocks: [
        { kind: 'figure', src: '/guide/art-shortcuts.svg', alt: 'Common keyboard shortcuts', caption: 'Common keyboard shortcuts' },
        { kind: 'table', head: ['Keys', 'What happens'], rows: [
          ['Ctrl + Z / Ctrl + Y', 'Undo / redo'],
          ['Ctrl + D', 'Make a copy of the selected thing'],
          ['Delete', 'Remove it'],
          ['Esc', 'Select the box around it (or close Preview)'],
          ['Enter', 'Edit the words'],
          ['Alt + ↑ / ↓', 'Move it up or down'],
          ['Ctrl + S', 'Save now'],
        ] },
        { kind: 'note', text: 'On a Mac use ⌘ instead of Ctrl.' },
      ],
    },
    {
      id: 'glossary', title: 'Words used in Tweak', summary: 'Plain meanings.',
      brief: "Item, field, detail page, role, flag, layout, API, key, JSON: what they mean here.",
      blocks: [
        { kind: 'figure', src: '/guide/art-glossary.svg', alt: 'An item is one thing in your data; fields are its details', caption: 'An item is one thing in your data; fields are its details' },
        { kind: 'table', head: ['Word', 'Meaning'], rows: [
          ['**Item / field**', 'A thing in your data (a product) and one of its details (price, picture).'],
          ['**Detail page**', 'One page that shows a different item for each link, like /product/3.'],
          ['**Address**', 'Where a page lives on your site, like /about. A part written :id changes.'],
          ['**Layout**', 'A ready-made top bar, side menu, or both.'],
          ['**Role**', 'What kind of signed-in person someone is (member, admin…).'],
          ['**Flag**', 'A feature switched on or off for the whole site.'],
          ['**API**', 'An address that answers with your data.'],
          ['**Key**', 'A secret-looking code an API wants, proving you may ask.'],
          ['**JSON**', 'A common text format for data, with { } and [ ].'],
          ['**Preview**', 'Your page working like the real site.'],
          ['**React project**', 'A set of files a developer can run and grow.'],
        ] },
      ],
    },
  ],
}
