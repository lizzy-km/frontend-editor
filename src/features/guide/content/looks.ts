import type { Group } from '../guideTypes'

export const LOOKS: Group = {
  id: 'looks', title: 'Change how it looks', icon: 'pencil',
  intro: 'Words, pictures, colors, sizes and ready-made blocks.',
  topics: [
    {
      id: 'words', title: 'Words', summary: 'Change, format and style text.',
      brief: "Double-click to edit. Text size, color and more are in Design → Text.",
      blocks: [
        { kind: 'figure', src: '/guide/art-words.svg', alt: 'Double-click text and use the text settings', caption: 'Double-click text and use the text settings' },
        { kind: 'p', text: '**Double-click** text to change it. Select part of the words to make them bold, italic, or a link. Press Enter or click away to finish.' },
        { kind: 'p', text: 'Text made of many small parts (for example a heading with a colored word) can’t be edited in place. Select it and use the **Words** list in the **Design** tab instead: it shows each piece to edit.' },
        { kind: 'p', text: 'In **Design → Text** you can change: **Text size**, **Text color**, **Thickness**, **Alignment**, and under **More options**: line spacing, letter spacing, italics, capitals and underline.' },
      ],
    },
    {
      id: 'max-lines', title: 'Limit text to a few lines', summary: 'Cut long text with “…”.',
      brief: "Design → Text → Max lines cuts long text with “…”.",
      blocks: [
        { kind: 'figure', src: '/guide/art-max-lines.svg', alt: 'Max lines cuts long text with three dots', caption: 'Max lines cuts long text with three dots' },
        { kind: 'p', text: 'Select a piece of text, then **Design → Text → Max lines**. Choose **1 line** to **10 lines**: longer text is cut after that many lines and ends with “…”. Choose **No limit** to bring all the text back.' },
        { kind: 'tip', text: 'This is great for cards in a list: titles and descriptions of different lengths stay the same height.' },
      ],
    },
    {
      id: 'pictures', title: 'Pictures', summary: 'Choose, upload or link a picture.',
      brief: "Click a picture → Design → Choose picture. Add a description.",
      blocks: [
        { kind: 'figure', src: '/guide/art-pictures.svg', alt: 'Click a picture, then choose a new one', caption: 'Click a picture, then choose a new one' },
        { kind: 'steps', items: [
          'Click the picture.',
          'In **Design → Picture**, press **Choose picture** to pick a file, or paste a link to one.',
          'Fill in the **Description** so screen readers (and search engines) know what the picture shows.',
        ] },
        { kind: 'note', text: 'Pictures are uploaded when you are signed in. Without an account a picture under 400 KB is kept inside the page, and larger ones need a link. If a page gets too big to save, use **Move pictures out of the code**.' },
      ],
    },
    {
      id: 'background', title: 'Backgrounds', summary: 'Color, picture or gradient behind anything.',
      brief: "Design → Background: a color, a picture or a gradient.",
      blocks: [
        { kind: 'figure', src: '/guide/art-background.svg', alt: 'A background can be a color, a picture or a gradient', caption: 'A background can be a color, a picture or a gradient' },
        { kind: 'p', text: 'Select a box or a section, then open **Background** in the **Design** tab. It has a **Color** and two tabs: **Picture** (a background picture, how it fills and where it sits) and **Gradient** (ready-made blends you can adjust).' },
      ],
    },
    {
      id: 'size-space', title: 'Size, space and borders', summary: 'Spacing, size, rounded corners, shadow.',
      brief: "Design has Spacing, Size, Corners & border, Shadow and Arrange items.",
      blocks: [
        { kind: 'figure', src: '/guide/art-size-space.svg', alt: 'Space inside, space around and the border of a box', caption: 'Space inside, space around and the border of a box' },
        { kind: 'table', head: ['Section', 'What it does'], rows: [
          ['**Spacing**', '**Space inside** (padding) and **Space outside** (margin), all sides or each side.'],
          ['**Size**', 'Width and height.'],
          ['**Corners & border**', 'Rounded corners, border thickness and color.'],
          ['**Shadow & see-through**', 'A soft shadow, and how see-through the thing is.'],
          ['**Arrange items**', 'For a box with things inside: stacked or side by side, space between, how they line up.'],
        ] },
        { kind: 'tip', text: 'A small dot beside a setting means you changed it. The arrow ↺ next to it brings back the original.' },
      ],
    },
    {
      id: 'colors', title: 'Colors for the whole project', summary: 'Change a color everywhere at once.',
      brief: "Left rail → Design → Colors: change a color once and it changes everywhere.",
      blocks: [
        { kind: 'figure', src: '/guide/ui-colors.png', alt: 'The Design panel with the project colors', caption: 'Change a color once here and it changes everywhere it is used.' },
        { kind: 'p', text: 'Open **Design** on the left rail. **Colors** lists every color your project uses, the most used first, each with how many times it is used. Change one (click its swatch, or type a #hex) and it changes **everywhere**: text, backgrounds, borders and buttons, on every page and screen size, even while you drag the picker. One undo takes it back.' },
        { kind: 'p', text: 'If your page defines **theme colors** in its code (such as `--primary`), they are listed first. Changing one changes everything that uses it.' },
      ],
    },
    {
      id: 'add-blocks', title: 'Add things', summary: 'Ready-made blocks and where they go.',
      brief: "Left rail → Add: click a block to place it.",
      blocks: [
        { kind: 'figure', src: '/guide/ui-add.png', alt: 'The Add panel with ready-made blocks', caption: 'Click a block to place it on the page.' },
        { kind: 'p', text: 'Open **Add** on the left rail. Each category is a fold: click its name to open or close it. Click a block to put it on the page. If something is selected it goes next to it; if nothing is, it goes at the end of the page.' },
        { kind: 'list', items: [
          '**Basics**: Heading, Text, Button, Picture, Link, List, Box, Two columns, Divider line, Empty space.',
          '**Ready-made**: List from data, Animation box, Pop-up, Ask first, Contact form, Sign-up form.',
          '**Inputs**, **Tabs and menus**, **Tables, search and filters**: parts that already work (see “Inputs, tabs and tables”).',
          '**Paste more code** adds HTML, CSS and JavaScript from your AI: pick a tab for each, fill one or all, then press **Add this code**. A section’s own styles and scripts come along.',
        ] },
      ],
    },
  ],
}
