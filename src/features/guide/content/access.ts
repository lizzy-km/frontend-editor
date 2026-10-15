import type { Group } from '../guideTypes'

export const ACCESS: Group = {
  id: 'access', title: 'Who can see what', icon: 'lock',
  intro: 'Show parts of your site only to some visitors.',
  topics: [
    {
      id: 'who-can-see', title: 'Who can see this', summary: 'Show or hide any part for visitors, members or admins.',
      brief: "Actions → Who can see this: everyone, signed in, signed out, roles, flags.",
      blocks: [
        { kind: 'figure', src: '/guide/who-sees.svg', alt: 'Three levels: anyone, signed in, admin only', caption: 'Pages can be open to anyone, to signed-in people, or to one role.' },
        { kind: 'p', text: 'Select anything (a menu link, a section, a whole page) and open **Actions → Who can see this**. Choose:' },
        { kind: 'list', items: [
          '**Everyone** (the default).',
          '**Signed in** (optionally only some **roles**, like admin).',
          '**Signed out** (for example a Log in button that should disappear once someone has signed in).',
          '**Flags**: switch a feature on or off for the whole site, like a “beta” section.',
        ] },
        { kind: 'p', text: 'Pages have the same control in their settings (**Pages** tab). A page for signed-in people sends visitors to the Log in page, and brings them back afterwards.' },
      ],
    },
    {
      id: 'roles-flags', title: 'Roles and flags', summary: 'Names you can use to control access.',
      brief: "Add your own roles and flags under Who can see this.",
      blocks: [
        { kind: 'figure', src: '/guide/art-roles-flags.svg', alt: 'Roles say who a person is; flags switch features on or off', caption: 'Roles say who a person is; flags switch features on or off' },
        { kind: 'p', text: 'A **role** says what kind of person is signed in (member, admin, editor…). **member** and **admin** are there from the start. Type a new name in the “Add a role…” box under **Who can see this** to add your own.' },
        { kind: 'p', text: 'A **flag** is a feature that is on or off for the whole site. Add one in the same place, then turn it on while testing with **Viewing as**.' },
      ],
    },
    {
      id: 'viewing-as', title: 'Viewing as: test every kind of visitor', summary: 'See your page as a visitor, member or admin.',
      brief: "Toolbar or Preview → Viewing as: see the site as a visitor, member or admin.",
      blocks: [
        { kind: 'figure', src: '/guide/art-viewing-as.svg', alt: 'Viewing as: choose a visitor, member or admin to test your site', caption: 'Viewing as: choose a visitor, member or admin to test your site' },
        { kind: 'p', text: 'Once something on your page uses “Who can see this”, **Viewing as** appears in the toolbar. Choose **Visitor (signed out)**, **Signed in**, or **Signed in as** a role, and tick any flags. The editor hides what that person can’t see.' },
        { kind: 'p', text: 'The same control is in **Preview**, so you can switch roles while you click around your site. Pages that person can’t open send them to Log in, or show “No access”.' },
      ],
    },
    {
      id: 'real-signin', title: 'Real sign-in in the React project', summary: 'Demo accounts, and connecting your own service.',
      brief: "The React download has working sign-in with demo accounts. Connect your own in Data → Sign-in API.",
      blocks: [
        { kind: 'figure', src: '/guide/art-real-signin.svg', alt: 'The React project signs people in for real', caption: 'The React project signs people in for real' },
        { kind: 'p', text: 'The React download includes working sign-in. Until you connect your own service it uses **demo accounts**: **admin@example.com / admin123** and **member@example.com / member123**. New accounts and reset links are pretend; the “emails” are printed in the browser console.' },
        { kind: 'p', text: 'To use your own service, open **Data** and fill in **Sign-in API** (the addresses for sign in, create account, and so on), then set **VITE_USE_MOCK=false** in the project’s **.env** file. See **Code and download**.' },
        { kind: 'note', text: 'A downloaded .html site can’t keep anything secret: anyone can open its files. Real protection needs the React project and a service that checks sign-ins.' },
      ],
    },
  ],
}
