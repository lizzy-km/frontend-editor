import type { Group } from '../guideTypes'

export const RECIPES: Group = {
  id: 'recipes', title: 'Recipes: build it step by step', icon: 'layers',
  intro: 'Start-to-finish walkthroughs for common jobs.',
  topics: [
    {
      id: 'recipe-landing', title: 'A landing page from AI', summary: 'From an AI answer to a shared link.',
      brief: "Paste the AI’s answer → fix words and colors → check Phone → Preview → Share or Download.",
      blocks: [
        { kind: 'figure', src: '/guide/art-recipe-landing.svg', alt: 'Landing page recipe', caption: 'Landing page recipe' },
        { kind: 'steps', items: [
          'Ask your AI for a page. The paste screen’s **No code yet?** helper writes a good request for you.',
          'Paste the answer and press **Open in editor**.',
          'Change words (double-click), pictures (**Choose picture**) and colors (**Design → Colors**).',
          'Switch to **Phone** and fix anything too big. Press **Preview** to check.',
          'Create an account, then **Share** for a link, or **Download**.',
        ] },
      ],
    },
    {
      id: 'recipe-shop', title: 'A shop with a page for each product', summary: 'List page + detail page + live data.',
      brief: "Data → Add data (Products) → Add → List from data → Add a page → Detail page → list On click → Open page.",
      blocks: [
        { kind: 'figure', src: '/guide/art-recipe-shop.svg', alt: 'Shop recipe', caption: 'Shop recipe' },
        { kind: 'steps', items: [
          'Make a **website** and open the **Data** tab. Add a data set (try **Store products**), or **Connect your API** with your own products.',
          'On your home page open **Add → List from data**: cards appear from your data.',
          'Open **Pages → Add a page → Detail page**, choose your data, and add it.',
          'Select the list, open **Actions → Data → On click → Open page**, and choose the detail page.',
          'Open **Preview** and click a card: its own product page opens.',
          'Add the pages you want in a menu under **Design → Layout** (and switch on **Show in the menu** for each).',
        ] },
      ],
    },
    {
      id: 'recipe-members', title: 'A members-only area', summary: 'Log in, a private page and an admin page.',
      brief: "Pages → Add sign-in pages → make a page Signed in → Design → Layout → test with Viewing as.",
      blocks: [
        { kind: 'figure', src: '/guide/art-recipe-members.svg', alt: 'Members area recipe', caption: 'Members area recipe' },
        { kind: 'steps', items: [
          'In a website, open **Pages → Add sign-in pages**.',
          'Add a page (for example **Account**) and set **Who can open this page** to **Signed in**. For an admin page also choose the **admin** role.',
          'Add a layout (**Design → Layout**), switch **Show in the menu** on for your pages: Log in, Sign up and Log out buttons appear by themselves.',
          'Open **Preview** and use **Viewing as** to try a visitor, a member and an admin.',
          'Download the **React project**: the demo accounts (**admin@example.com / admin123**) already work.',
        ] },
      ],
    },
    {
      id: 'recipe-contact', title: 'A contact form that checks itself', summary: 'Rules, a thank-you and somewhere to send answers.',
      brief: "Add → Contact form → Actions → Form: turn on checking, set Send to and a thank-you text.",
      blocks: [
        { kind: 'figure', src: '/guide/art-recipe-contact.svg', alt: 'Contact form recipe', caption: 'Contact form recipe' },
        { kind: 'steps', items: [
          'Open **Add → Contact form**.',
          'Select the form and turn on **Check the answers and send them**.',
          'Click each box to tweak its rules (**Must be filled in**, limits, your own error message).',
          'Paste the address that receives answers in **Send to**, and write the **Thank-you text**.',
          'Try it in **Preview**: leave a box empty and press Send.',
        ] },
      ],
    },
  ],
}
