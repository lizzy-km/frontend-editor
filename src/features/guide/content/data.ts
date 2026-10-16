import type { Group } from '../guideTypes'

export const DATA: Group = {
  id: 'data', title: 'Data: lists, items and your API', icon: 'box',
  intro: 'Show products, posts or people on your pages, from samples or your own service.',
  topics: [
    {
      id: 'add-data', title: 'Add data', summary: 'Start with samples, edit fields and rows.',
      brief: "Data tab → pick a starting set (Products, Blog posts…) → Add data. Edit fields and rows any time.",
      blocks: [
        { kind: 'figure', src: '/guide/art-add-data.svg', alt: 'A data set is a table of items with fields', caption: 'A data set is a table of items with fields' },
        { kind: 'p', text: 'Data is a table of things you want to show: products, blog posts, team members, events. Each thing is an **item** (a row) with **fields** (columns) like title, price and picture.' },
        { kind: 'steps', items: [
          'Open **Data** on the left rail.',
          'Choose a starting set (**Products**, **Blog posts**, **Team members**, **Reviews**, **Events**, **Store products (Fake Store API)**) and press **Add data**.',
          'Press **Edit fields and rows** to add fields (each with a kind: text, number, picture link…), change items, add rows.',
        ] },
        { kind: 'tip', text: 'The samples are real-looking, so your page looks finished right away. Replace them with your own later.' },
      ],
    },
    {
      id: 'import-json', title: 'Import from JSON', summary: 'Paste or drop a file instead of typing rows.',
      brief: "Data → Edit fields and rows → Import from JSON. Paste or drop a .json file, check the preview, import.",
      blocks: [
        { kind: 'figure', src: '/guide/art-import-json.svg', alt: 'Paste or drop a JSON file to fill a data set', caption: 'Paste or drop a JSON file to fill a data set' },
        { kind: 'p', text: 'JSON is the common way programs share data. If your data comes from a service or an export, press **Import from JSON**, then paste it or choose/drop a **.json** file. Tweak finds the list of items (even inside an answer like { "data": { "items": [...] } }), guesses each field’s kind (number, picture, date…), and shows a preview.' },
        { kind: 'p', text: 'Then choose **Add to the rows I have** or **Replace everything**. Nested values such as rating → rate become fields like **ratingRate**.' },
      ],
    },
    {
      id: 'connect-api', title: 'Connect your own API', summary: 'Show live data from your service, with a key if needed.',
      brief: "Data → pick a set → Connect your API → paste the address → Test connection → Use these items.",
      blocks: [
        { kind: 'figure', src: '/guide/art-connect-api.svg', alt: 'Connect your own API and its items appear in your page', caption: 'Connect your own API and its items appear in your page' },
        { kind: 'p', text: 'An **API** is an address that answers with your data. If you have one, connect it so your finished site shows live data.' },
        { kind: 'steps', items: [
          'Select your data set in the **Data** tab and press **Connect your API**.',
          'Paste the **Address for the list**, like https://api.example.com/products.',
          'If it needs a key, switch on **This API needs a key**. Choose the header (usually Authorization), what comes before the key (usually “Bearer ”), and the name of the setting that will hold the key (like VITE_API_KEY). Type the key to test it: it is **not saved**.',
          'Press **Test connection**. You see how many items and which fields were found, or a plain explanation if something is wrong.',
          'Press **Use these items**. They become your sample data and the address is remembered.',
        ] },
        { kind: 'table', head: ['Message', 'What to do'], rows: [
          ['Not a web address', 'Start with https://'],
          ['Not allowed (401 / 403)', 'Check the key and where it goes'],
          ['Nothing there (404)', 'Check the address for typos'],
          ['Couldn’t reach it (CORS)', 'The service may not allow web pages from here. Your own website is usually allowed even when this test isn’t: ask whoever runs the service.'],
        ] },
        { kind: 'note', text: 'A key in a website can be seen by visitors. Only use keys meant for websites (read-only or public), never a private one. Your project reads the key from a **.env** file and never writes it into the code.' },
        { kind: 'p', text: 'Your downloaded React project shows these samples until you set **VITE_USE_MOCK=false** in its .env file. Then it loads live data and turns each answer into tidy items.' },
      ],
    },
    {
      id: 'item-address', title: 'An address for one item (:id)', summary: 'Let detail pages ask for just one item.',
      brief: "In Connect your API, fill Address for one item with :id, like https://api.example.com/products/:id.",
      blocks: [
        { kind: 'figure', src: '/guide/art-item-address.svg', alt: 'An address with :id gives one item', caption: 'An address with :id gives one item' },
        { kind: 'p', text: 'Loading the whole list just to show one product is wasteful. In **Connect your API**, fill in **Address for one item** and write **:id** where the item’s id goes: https://api.example.com/products/:id. Detail pages then ask for exactly that item.' },
        { kind: 'list', items: [
          'Press **Test connection**: Tweak tries the one-item address too (with the first item’s id, or one you type) and tells you if it works and which fields a detail page would lack.',
          'If you type :id into the list address by mistake, Tweak offers **Use it as the address for one item**.',
          'It works for ids that aren’t in the list too: opening /product/42 asks for item 42.',
        ] },
      ],
    },
    {
      id: 'show-data', title: 'Show data on your page', summary: 'Every item (a list) or one item.',
      brief: "Select a box → Actions → Data → pick the data → Every item or One item → Fill in the fields for me.",
      blocks: [
        { kind: 'figure', src: '/guide/art-show-data.svg', alt: 'Boxes show the fields of an item or every item of a list', caption: 'Boxes show the fields of an item or every item of a list' },
        { kind: 'steps', items: [
          'Select a box (a section, a card, a picture strip…).',
          'Open **Actions → Data** and choose the data under **Shows**.',
          'Choose **Every item** (the first thing inside is a card design that repeats for each item, with **Per page** and **On scroll / Show all**) or **One item** (the box shows a single item).',
          'Press **Fill in the fields for me**, or choose for each picture and piece of text which field it shows.',
        ] },
        { kind: 'p', text: 'For **One item**, **Which one** chooses: **The first one**, **One by number**, or **The one in the link**, where the link a visitor followed (/product/3 or ?id=3) decides.' },
        { kind: 'tip', text: 'The easiest start is **Add → List from data**: a ready-made grid of cards from your data.' },
      ],
    },
    {
      id: 'card-click', title: 'When a card is clicked', summary: 'Open a page or a pop-up for that item, or run your own code.',
      brief: "Select the list → Actions → Data → On click: Open a page (your detail page), Open a pop-up, or Run my code.",
      blocks: [
        { kind: 'figure', src: '/guide/art-card-click.svg', alt: 'Click a card to open that item’s page', caption: 'Click a card to open that item’s page' },
        { kind: 'p', text: 'Select a list (the box that repeats cards) and look at **On click**:' },
        { kind: 'list', items: [
          '**Nothing**: cards are just pictures and words.',
          '**Open a page**: each card opens a page for its own item. Choose your **detail page**; the address gets that card’s id.',
          '**Open a pop-up**: each card opens a pop-up that shows **its own** item (title, picture, price…). See “A card that opens a pop-up” below.',
          '**Run my code** (for developers): the React download calls a function you name, giving it the card’s data. Tweak writes it into src/data/handlers.ts for you to fill in. Preview doesn’t run it.',
        ] },
        { kind: 'figure', src: '/guide/art-card-popup.svg', alt: 'A card opens a pop-up that shows that card’s item, with a button to its own page', caption: 'A card opens a pop-up that shows that card’s item, with a button to its own page' },
        { kind: 'p', text: '**A card that opens a pop-up**, step by step:' },
        { kind: 'steps', items: [
          'Add a **List from data** and a **Pop-up** (**Add → Ready-made**).',
          'Select the list, open **Actions → Data → On click** and choose **Open a pop-up**. The pop-up is set up to show the card that opened it.',
          'Select the pop-up box, open **Actions → Data** and press **Fill in the fields for me**: its heading, text and picture now show the clicked card’s item. Pick a field for any part yourself, too.',
          'To go to the item’s own page from inside the pop-up, add a **Link** in it (**Add → Link**), select the pop-up, and under **Show these from…** set the link’s **Goes to** to your **Detail page**. The link then opens the page of the clicked item.',
        ] },
        { kind: 'tip', text: 'Opened any other way (a normal button), the pop-up shows the first item. Try it in **Preview**: click different cards.' },
      ],
    },
  ],
}
