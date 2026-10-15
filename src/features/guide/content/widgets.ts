import type { Group } from '../guideTypes'

export const WIDGETS: Group = {
  id: 'widgets', title: 'Inputs, tabs and tables', icon: 'table',
  intro: 'Ready-made parts that already work: add one, change the words, done.',
  topics: [
    {
      id: 'widget-inputs', title: 'Inputs, switches and select lists', summary: 'Text boxes, password, number, switch, select with search.',
      brief: 'Add → Inputs. Type in the box, then use Actions to set its name and whether it must be filled in.',
      blocks: [
        { kind: 'figure', src: '/guide/art-widget-inputs.svg', alt: 'Inputs, switches and select lists you add with one click', caption: 'Inputs, switches and select lists you add with one click' },
        { kind: 'steps', items: [
          'Open **Add** and look under **Inputs**: text, email, password (with Show / Hide), number (with − and +), text area, switch, select and select with search.',
          'Click the words on the page to change the label. Click the box to set its **Name** and **Must be filled in** under **Actions**.',
          'For a select, type the **Choices**, one per line. Every choice shares the same look.',
        ] },
        { kind: 'tip', text: 'They are real form boxes: inside a **Contact form** they are checked and sent like any other.' },
      ],
    },
    {
      id: 'widget-tabs', title: 'Tabs and dropdown menus', summary: 'Show one panel at a time; a button that opens links.',
      brief: 'Add → Tabs. Select a tab to edit its panel. Actions → Tabs adds, removes and restyles.',
      blocks: [
        { kind: 'figure', src: '/guide/art-widget-tabs.svg', alt: 'Tabs show one panel at a time; a drop-down menu lists links', caption: 'Tabs show one panel at a time; a drop-down menu lists links' },
        { kind: 'steps', items: [
          'Add **Tabs** (underlined, round, in a grey bar, or down the side).',
          'Click a tab on the page to see its panel and edit it: you can put anything inside, even a form or a list.',
          'Under **Actions → Tabs** press **Add a tab** or **Remove last**, and pick a **Look**.',
        ] },
        { kind: 'note', text: 'A **Dropdown menu** opens a list of links. Visitors close it with Esc or a click outside.' },
      ],
    },
    {
      id: 'widget-dates', title: 'Calendar and date picker', summary: 'Pick a day by clicking or typing.',
      brief: 'Add → Calendar or Date picker. Actions sets the first day of the week, the format and the earliest and latest day.',
      blocks: [
        { kind: 'figure', src: '/guide/art-widget-dates.svg', alt: 'A calendar and a date picker', caption: 'A calendar and a date picker' },
        { kind: 'list', items: [
          '**Calendar**: a month people can click. Under **Actions** choose the first day of the week, an earliest and a latest day, and **Marked days** that get a small dot.',
          '**Date picker**: a box that opens a calendar. Choose how the date is written (2026-10-24, 24/10/2026…).',
          'Both open on today’s month for visitors. Dates are written like **2026-10-24** in the settings.',
        ] },
      ],
    },
    {
      id: 'widget-tables', title: 'Tables', summary: 'Rows and columns, sortable, or filled from data.',
      brief: 'Add → Table, or Table from data. Actions adds rows and columns, and switches sorting and looks.',
      blocks: [
        { kind: 'figure', src: '/guide/art-widget-tables.svg', alt: 'A table with sortable headings and status badges', caption: 'A table with sortable headings and status badges' },
        { kind: 'steps', items: [
          'Add a **Table** (plain, striped, or with status badges), or **Table from data** to show one row for every item of your data.',
          'Click any cell to type in it. Under **Actions → Table** add or remove rows and columns, and switch on **Click a heading to sort**.',
          'A table from data changes when your data changes: edit the items in the **Data** tab.',
        ] },
      ],
    },
    {
      id: 'widget-search', title: 'Search bar and filters', summary: 'Narrow a list or table as people type or choose.',
      brief: 'Add → Search bar or Filter. Actions → Works on picks the list or table; Filter by offers a field’s real values.',
      blocks: [
        { kind: 'figure', src: '/guide/art-widget-search.svg', alt: 'A search bar and filter buttons narrow a list as people type', caption: 'A search bar and filter buttons narrow a list as people type' },
        { kind: 'steps', items: [
          'Add a **List from data** or a **Table from data**, then add a **Search bar** and a **Filter** (buttons, a drop-down or tick boxes). They connect to the first list or table by themselves.',
          'To change it, select the search or filter and open **Actions → Works on**.',
          'For a filter, choose **Filter by** a data field: the buttons become that field’s real values (for example Clothing, Bags, Home).',
        ] },
        { kind: 'tip', text: 'Set the list to show **all** items so every one can be found.' },
      ],
    },
  ],
}
