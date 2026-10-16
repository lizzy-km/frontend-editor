# How Tweak works: the workflow in pictures

Eight diagrams, from what a person does to how the code is built and shipped. Each picture is drawn from a
Mermaid file in [`diagrams/`](diagrams) (`.mmd`, readable and editable as text) and saved as `.svg` and `.png`.

| # | Diagram | Question it answers |
| --- | --- | --- |
| 1 | [The journey](#1-the-journey) | What does a person do, from first visit to download? |
| 2 | [Inside the editor](#2-inside-the-editor) | How does a click become an edit on screen? |
| 3 | [The page model](#3-the-page-model) | What is a page made of, and how are features marked? |
| 4 | [From page to files](#4-from-page-to-files) | How does the page become HTML, a .zip or a React project? |
| 5 | [Accounts, saving and sharing](#5-accounts-saving-and-sharing) | Where does the work live? |
| 6 | [Data](#6-data) | How do lists, tables, filters and pop-ups get their items? |
| 7 | [Reusable components](#7-reusable-components) | How does one change reach every copy? |
| 8 | [Building and shipping](#8-building-and-shipping) | How do we check, build, and make it findable? |

## 1. The journey

![The journey](diagrams/01-journey.png)

Five stages: discover, start, build, check, keep and share. The two dotted arrows are the loops: keep editing after
a Preview, and reopening a React project that Tweak made.

## 2. Inside the editor

![Inside the editor](diagrams/02-editor.png)

Every edit goes through one path: an **action** makes a **commit**; the commit carries component changes to copies and
saves one undo step; the changed boxes are sent into the **sandboxed frame**, which patches only what changed. The frame
never touches the app (no `allow-same-origin`): it only answers questions (where is this box, what is its style).

## 3. The page model

![The page model](diagrams/03-model.png)

A page is a flat map of boxes plus the original CSS kept as text. Features are plain attributes on boxes
(`data-fe-*` for the editor, `data-ui-*` for ready-made parts that must survive into the React project).

## 4. From page to files

![From page to files](diagrams/04-outputs.png)

Two roads: the visitor road (`forVisitors`, used by Preview, shared pages and downloads) and the React road. The React
download also carries the hidden `.tweak/project.json`, which is how a project can be opened again.

## 5. Accounts, saving and sharing

![Accounts, saving and sharing](diagrams/05-accounts.png)

Without an account the work is a draft in the browser. With one, autosave writes a squeezed copy to Firestore (with a
plain message when it is too big), pictures go to R2 through a small Worker, and shared pages feed Explore.

## 6. Data

![Data](diagrams/06-data.png)

One data source can be shown as a list of cards, a table, one item, or the item of the card that was clicked. Search
and filters narrow lists and tables; a filter's choices can come from another source (for example categories).

## 7. Reusable components

![Reusable components](diagrams/07-components.png)

A copy is made of ordinary boxes, so it is edited in place. A change to the main component reaches a copy only where
that copy still has the old value.

## 8. Building and shipping

![Building and shipping](diagrams/08-build.png)

Every feature goes through the same checks before it is merged. The build also writes a static page for each public
screen, `robots.txt` and (when `VITE_SITE_URL` is set) `sitemap.xml`.

---

**Changing a diagram:** edit its `.mmd` file, then run `node scripts/diagrams/render.mjs` (needs Chrome and an internet
connection for the Mermaid script) and commit the `.svg` and `.png` files. GitHub also draws the `.mmd` text directly if
you paste it into a ```` ```mermaid ```` block.

See also: [ARCHITECTURE.md](ARCHITECTURE.md) (details and rules) and [HISTORY.md](HISTORY.md) (what each feature added).
