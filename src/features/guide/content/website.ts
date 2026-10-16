import type { Group } from '../guideTypes'

export const WEBSITE: Group = {
  id: 'website', title: 'Build a website', icon: 'layers',
  intro: 'Pages, links, menus and layouts.',
  topics: [
    {
      id: 'pages', title: 'Pages', summary: 'Add, open, reorder and delete pages.',
      brief: "Pages tab → Add a page. The header and footer are shared by every page.",
      blocks: [
        { kind: 'figure', src: '/guide/art-pages.svg', alt: 'The pages of a website, with one shared header and footer', caption: 'The pages of a website, with one shared header and footer' },
        { kind: 'p', text: 'Open **Pages** on the left rail (it appears once your project is a website). Click a page to work on it. The header and footer are shared: change them on any page and every page follows.' },
        { kind: 'steps', items: [
          'Press **Add a page**.',
          'Give it a **name** and an **address** (like /about).',
          'Choose how it starts: **Empty**, **Paste code**, a **Copy** of the current page, or a **Detail page** (see below).',
        ] },
        { kind: 'p', text: 'Use the arrows to reorder pages and the bin to delete one. The settings under the list change the page’s name and address, who can open it, and whether it is in the menu.' },
      ],
    },
    {
      id: 'links', title: 'Links between pages', summary: 'Link text, buttons and whole boxes to pages.',
      brief: "Actions → Link to link a page, or Click goes to for whole boxes.",
      blocks: [
        { kind: 'figure', src: '/guide/art-links.svg', alt: 'A button or link can open another page', caption: 'A button or link can open another page' },
        { kind: 'list', items: [
          'Select a link or button, open **Actions → Link**, and choose a page under **Link to a page**.',
          'For a whole box or card, open **Actions → Click goes to** and choose a page: visitors can click anywhere on it.',
          'In Preview and in your finished site, these links move between pages.',
        ] },
      ],
    },
    {
      id: 'layouts', title: 'Menus: top bar, side menu or both', summary: 'A ready-made menu that follows your pages.',
      brief: "Design → Layout, then switch on Show in the menu for each page you want listed.",
      blocks: [
        { kind: 'figure', src: '/guide/art-layouts.svg', alt: 'Layouts: top bar, side menu or both', caption: 'Layouts: top bar, side menu or both' },
        { kind: 'steps', items: [
          'Open **Design → Layout**.',
          'Choose **Top bar**, **Side menu** or **Both** (a top bar for Log in, a side menu for pages).',
          'Press **Add layout**. Tick **Replace my current header** if you want the old header gone.',
        ] },
        { kind: 'p', text: 'The menu lists only the pages you switched on. Open a page’s settings (**Pages** tab) and turn on **Show in the top bar / side menu**. It is **off by default**, so nothing appears until you choose. After changing which pages are in the menu, press **Update the menu** (or **Update layout and menu**).' },
        { kind: 'list', items: [
          'Items follow **who can see** each page, so members-only pages are hidden from visitors.',
          '**Log in**, **Sign up** and **Log out** buttons appear when your site has a Log in page.',
          'On phones the menu folds behind a **☰** button. The open page’s link is highlighted.',
          'Pages that change per item (like /product/:id) and the sign-in pages are never menu items.',
        ] },
        { kind: 'note', text: 'The layout is made of normal boxes. You can change its words and colors like anything else. **Remove** takes it away again.' },
      ],
    },
    {
      id: 'detail-pages', title: 'One page for every item (detail pages)', summary: 'Pages like /product/3 that show a different item each time.',
      brief: "Add a page → Detail page makes /product/:id: one page for every item.",
      blocks: [
        { kind: 'figure', src: '/guide/detail-flow.svg', alt: 'A card on the list page opens its own detail page', caption: 'Click a card on the list page and its own detail page opens.' },
        { kind: 'p', text: 'A shop needs a page for each product, but you don’t want to make a hundred pages. A **detail page** is one page whose address has a changing part, written **:id**, like **/product/:id**. Open /product/3 and it shows item 3, open /product/4 and it shows item 4.' },
        { kind: 'steps', items: [
          'Add your data first (see **Data**).',
          'Press **Add a page** and choose **Detail page**. Tweak writes the address and builds the page for you.',
          'On your list page, select the list and open **Actions → Data → On click → Open page**, then choose the detail page. Each card now opens its own item.',
        ] },
        { kind: 'tip', text: 'You can also type a changing address yourself, like /user/:id. Boxes set to **The one in the link** show the item whose id matches.' },
      ],
    },
    {
      id: 'components', title: 'Reusable components', summary: 'Change a part once and every copy follows.',
      brief: "Select a box → Actions → Component → Make a component. Add copies from Add → Your components.",
      blocks: [
        { kind: 'figure', src: '/guide/art-components.svg', alt: 'Change the main component once and every copy follows, except what a copy changed itself', caption: 'Change the main component once and every copy follows, except what a copy changed itself' },
        { kind: 'p', text: 'A **component** is a part you use again and again: a product card, a team member, a pricing box. Make it once, put copies anywhere, and a change to the **main component** reaches every copy.' },
        { kind: 'steps', items: [
          'Open the **Components** tab on the left. Start a new component (empty box, card, button, banner, person) or press **From my code…** to paste HTML, CSS and JavaScript. Or select a box you already have and use **Actions → Component → Make a component**.',
          'It becomes the **main component**: a dashed purple outline in the editor, and it is **left out of Preview and downloads**. Use it as the place where you design the part.',
          'Press **Add a copy** in the Components tab (or click the component in **Add → Your components**) to put a **copy** on the page. Copies are real parts: click their words, pictures and links and change them. The tab also shows where each component is used, and lets you rename, duplicate and delete it.',
          'Change the main component and every copy follows. A word, picture, link or look that a copy changed itself **stays**; the rest keeps following.',
        ] },
        { kind: 'list', items: [
          '**Different data for each copy**: select a copy, open **Actions → Data** and choose another item (or another data list). One card design can show product 3 here and product 7 there.',
          '**Undo my changes to this copy** puts a copy back exactly like the main component. **Make it a normal box** stops it following. **Stop being a component** (on the main one) turns every copy into a normal box.',
          'Boxes you add to the main component appear in every copy; boxes you remove disappear from them. Deleting the main component keeps the copies as normal boxes.',
        ] },
        { kind: 'note', text: 'You can copy a copy (Ctrl+D); it is a copy of the same component. A component can’t sit inside another component. In the React download copies are written out as plain parts.' },
      ],
    },
    {
      id: 'signin-pages', title: 'Sign-in pages', summary: 'Log in, create account, forgot password in one click.',
      brief: "Pages → Add sign-in pages gives you Log in, Create account and more.",
      blocks: [
        { kind: 'figure', src: '/guide/art-signin-pages.svg', alt: 'Log in, sign up and account pages are added for you', caption: 'Log in, sign up and account pages are added for you' },
        { kind: 'p', text: 'In **Pages**, press **Add sign-in pages**. You get five ordinary, editable pages: **Log in**, **Create account**, **Forgot password**, **Set a new password** and **Confirm email**. The first three are for signed-out visitors only (signed-in people are sent home).' },
        { kind: 'p', text: 'In your downloaded React project they really work. Until you connect your own service they use demo accounts and a pretend email. See **Who can see what**.' },
      ],
    },
  ],
}
