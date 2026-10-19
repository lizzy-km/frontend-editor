import type { Group } from '../guideTypes'

export const INTERACTIVE: Group = {
  id: 'interactive', title: 'Make it come alive', icon: 'sparkle',
  intro: 'Pop-ups, questions, motion and showing things only when needed.',
  topics: [
    {
      id: 'popups', title: 'Pop-ups', summary: 'A box that opens over the page.',
      brief: "Add → Pop-up gives a button and its box. Select any button → Actions → When clicked → Opens.",
      blocks: [
        { kind: 'figure', src: '/guide/art-popups.svg', alt: 'A button opens a pop-up box over the page', caption: 'A button opens a pop-up box over the page' },
        { kind: 'steps', items: [
          'Open **Add** and click **Pop-up**. You get a button and the pop-up box (a normal box while you edit).',
          'Change the words and design like anything else. The pop-up has a **Name** under **Actions → Pop-up**.',
          'To open it from another button: select that button, open **Actions → When clicked**, and choose the pop-up under **Opens**.',
          'To add a close button inside the pop-up: select it and turn on **Closes the pop-up**.',
        ] },
        { kind: 'p', text: 'Visitors can close a pop-up with its close button, the **Esc** key, or by clicking outside.' },
        { kind: 'tip', text: 'A pop-up can show a different item for each data card that opens it: see “When a card is clicked” (**Open a pop-up**).' },
      ],
    },
    {
      id: 'ask-first', title: 'Ask first (“Are you sure?”)', summary: 'Make a button or link confirm before it acts.',
      brief: "Select a button or link → Actions → When clicked → Ask first, and type your question.",
      blocks: [
        { kind: 'figure', src: '/guide/art-ask-first.svg', alt: 'Ask first: visitors must say Yes before the click goes through', caption: 'Ask first: visitors must say Yes before the click goes through' },
        { kind: 'p', text: 'Type a question in **Ask first** and visitors must say **Yes** before the click goes through: a link opens only after Yes, a form button sends only after Yes. **Add → Ask first** gives you a ready-made red Delete button to start from.' },
      ],
    },
    {
      id: 'update-data', title: 'Change data when clicked', summary: 'A button saves a change to one item in your API.',
      brief: "Select a button → Actions → When clicked → Update data, then choose the data, the item and what changes.",
      blocks: [
        { kind: 'figure', src: '/guide/art-update-data.svg', alt: 'A click sends a change to your API for one item, then the card shows the new value', caption: 'A click sends a change to your API for one item, then the card shows the new value' },
        { kind: 'p', text: 'Use this for “Add to favourites”, “Mark as done”, “Like” or “Sold out” buttons. You need data connected to a real API first (Data tab → **Connect your API**).' },
        { kind: 'steps', items: [
          'Select the button or link (inside a data card, or anywhere on the page) and open **Actions → When clicked**.',
          'Under **Update data** choose the data to change. Only data connected to an API is listed.',
          'Choose **Which item**: **The card this button is in** (for buttons inside a list from data), or **One item, by its id** and type the id.',
          'Choose what changes: **Set to** a value, **Switch yes / no** for a yes/no field, or **Add** a number (for example likes + 1). **Add another change** changes more fields at once.',
        ] },
        { kind: 'list', items: [
          'When a visitor clicks, the change is sent to that item’s address (a PATCH request), and the card shows the new words straight away. If your API says no, the visitor sees a short message and nothing changes.',
          'On a chosen item only **Set to** is possible, because the app does not read that item first.',
          'A key your API needs is used in the React download (set it in the .env file). A plain .html page can only change data that needs no key.',
          'In the React download the button calls a ready-made function and the lists refresh. Until you turn on the real API (VITE_USE_MOCK=false) it changes the sample data instead.',
        ] },
      ],
    },
    {
      id: 'animation', title: 'Animation', summary: 'Fade, slide, zoom when scrolled into view.',
      brief: "Select anything → Actions → Animation → choose an effect and when it plays. Press Play to see it.",
      blocks: [
        { kind: 'figure', src: '/guide/art-animation.svg', alt: 'An element fades up when it scrolls into view', caption: 'An element fades up when it scrolls into view' },
        { kind: 'list', items: [
          '**Effect**: fade, fade up/down, slide in, zoom in/out, flip, unblur.',
          '**Plays**: when it scrolls into view, when the page opens, when the mouse is over it, or over and over.',
          '**Duration**, **Delay** and **Feel** (smooth, bouncy, steady).',
          '**One by one**: the things inside a box appear one after another.',
          '**Add → Animation box** is a ready-made box that glides in.',
        ] },
        { kind: 'note', text: 'Nothing is hidden while you edit: press **Play** in the settings to see an animation. Visitors who prefer less motion see none.' },
      ],
    },
    {
      id: 'show-hide', title: 'Show or hide things', summary: 'Hide for a layer, a screen size or a kind of visitor.',
      brief: "Layers: click the eye. More → Show on phones/tablets/computers. Actions → Who can see this for people.",
      blocks: [
        { kind: 'figure', src: '/guide/art-show-hide.svg', alt: 'Hide a box for a layer, a screen size or a kind of visitor', caption: 'Hide a box for a layer, a screen size or a kind of visitor' },
        { kind: 'table', head: ['You want to…', 'Do this'], rows: [
          ['Hide something while you work', '**Layers** → click the eye next to it'],
          ['Hide it on some screens', '**More** → switch off **Show on phones** (or tablets, computers)'],
          ['Hide it from some visitors', '**Actions → Who can see this**'],
        ] },
      ],
    },
  ],
}
