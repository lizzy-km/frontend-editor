import type { Group } from '../guideTypes'

export const TOUR: Group = {
  id: 'tour', title: 'Find your way around', icon: 'desktop',
  intro: 'A tour of the editor screen.',
  topics: [
    {
      id: 'editor-screen', title: 'The editor screen', summary: 'Toolbar, left rail, page, settings.',
      brief: "Toolbar on top, rail on the left, your page in the middle, settings on the right.",
      blocks: [
        { kind: 'figure', src: '/guide/editor-map.svg', alt: 'The editor with five numbered areas', caption: '1 Toolbar · 2 Left rail · 3 Panel for the rail you chose · 4 Your page · 5 Settings of what you selected.' },
        { kind: 'p', text: 'The editor has four parts: the **toolbar** on top, a slim **rail** on the left, your **page** in the middle, and **settings** on the right for whatever you selected.' },
        { kind: 'table', head: ['Where', 'What it is'], rows: [
          ['Toolbar', 'Undo and redo, **Computer / Tablet / Phone**, zoom, save status, **Preview**, **Download**, **Share**.'],
          ['Left rail', '**Layers**, **Add**, **Pages** (websites), **Design**, **Data**, **Code**.'],
          ['Middle', 'Your page. Click anything on it.'],
          ['Right', 'Settings of the selected thing, in three tabs: **Design**, **Actions**, **More**.'],
        ] },
      ],
    },
    {
      id: 'selecting', title: 'Selecting, moving and deleting', summary: 'Click, drag, and the keys that help.',
      brief: "Click to select, double-click text to edit, drag to move, Delete removes, Ctrl+Z undoes.",
      blocks: [
        { kind: 'figure', src: '/guide/ui-layers.png', alt: 'The Layers panel next to the page', caption: 'Layers lists everything on the page, in order. Click a name to select it; the eye hides it.' },
        { kind: 'list', items: [
          '**Click** a thing to select it. Its settings open on the right and a small bar of quick actions appears above it.',
          '**Double-click text** (or press Enter) to change the words.',
          '**Drag** a thing to move it. Drop it on another box to put it inside, or between things to reorder.',
          '**Esc** selects the box around what you selected (its parent).',
          '**Delete** removes it. **Ctrl+D** makes a copy.',
          '**Alt + ↑ / ↓** moves it up or down among its neighbors.',
          '**Ctrl+Z** undoes, **Ctrl+Y** redoes. Almost everything can be undone, even big changes like adding a layout.',
        ] },
        { kind: 'tip', text: 'Lost? Open **Layers**. It lists everything on the page in order, with friendly names. Click a row to select it, and the eye hides or shows a layer.' },
      ],
    },
    {
      id: 'settings-tabs', title: 'The three settings tabs', summary: 'Design, Actions and More.',
      brief: "Design = how it looks. Actions = what it does. More = rarely needed.",
      blocks: [
        { kind: 'figure', src: '/guide/ui-settings.png', alt: 'The Design tab for a selected heading', caption: 'The Design tab for a selected heading. Actions and More are the other two tabs.' },
        { kind: 'table', head: ['Tab', 'Question it answers', 'Examples'], rows: [
          ['**Design**', 'How does it look?', 'Words, picture, text size and color, background, spacing, size, borders'],
          ['**Actions**', 'What does it do?', 'Link, what happens on click, data, who can see it, animation, form settings'],
          ['**More**', 'Anything rarely needed', 'Show or hide on screen sizes, attributes, your own CSS'],
        ] },
        { kind: 'p', text: 'A small dot on **Actions** means something is already set there. The page itself has no Actions tab.' },
      ],
    },
    {
      id: 'screen-sizes', title: 'Computer, tablet and phone', summary: 'Make it look right everywhere.',
      brief: "Switch Computer / Tablet / Phone. Changes on Computer apply everywhere unless you change them on a smaller size.",
      blocks: [
        { kind: 'figure', src: '/guide/art-screen-sizes.svg', alt: 'Computer, tablet and phone', caption: 'Computer, tablet and phone' },
        { kind: 'p', text: 'Switch **Computer / Tablet / Phone** in the toolbar to see your page at each size. What you change on **Computer** applies to every size, **unless** you change it again on Tablet or Phone. A notice in the settings tells you which size your changes affect.' },
        { kind: 'steps', items: [
          'Choose **Phone** in the toolbar.',
          'Select something that looks too big, and make it smaller. Only phones change.',
          'To hide something on phones only, open **More** and turn off **Show on phones**.',
        ] },
      ],
    },
    {
      id: 'preview', title: 'Preview', summary: 'Try your page like a visitor.',
      brief: "Preview works like the real site. Use Viewing as to test visitors and roles.",
      blocks: [
        { kind: 'figure', src: '/guide/art-preview.svg', alt: 'Preview shows your page like a visitor, with a Viewing as menu', caption: 'Preview shows your page like a visitor, with a Viewing as menu' },
        { kind: 'p', text: '**Preview** shows your page the way visitors will see it: buttons, menus, pop-ups, forms and animations all work. Use **Back to editing** (or Esc) to return.' },
        { kind: 'list', items: [
          'Switch the size with **Computer / Tablet / Phone**.',
          'In a website, click links and cards to move between pages.',
          'Use **Viewing as** to see the page as a visitor, a signed-in member or an admin. See **Who can see what**.',
        ] },
      ],
    },
  ],
}
