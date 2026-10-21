# Features: what each one does, takes, gives back, needs, and where to debug

A reference for developers. Every feature uses the same seven lines:

- **What it does**: the idea in a sentence or two.
- **Where in the app**: the click path a person follows (or "no UI").
- **Accepts (input)**: what it is given: pasted text, attributes, settings, clicks, data shapes, limits.
- **Produces (output / redirect)**: what changes: the page model, files, network calls, saved documents, navigation, messages shown.
- **Needs**: settings, flags, sign-in, network, other features, libraries.
- **How it works**: the real functions and files, in call order.
- **Debug**: files, unit tests and e2e specs that cover it, what to inspect, and symptom -> likely cause.

For the big picture see [WORKFLOW.md](WORKFLOW.md) (diagrams) and [ARCHITECTURE.md](ARCHITECTURE.md) (rules and layers).
This file was written by reading the source; when a feature changes, change its section in the same branch.

## Quick debugging guide

- **Run the checks**: `npx tsc -b && npx eslint . && npx vitest run && npx vite build`. Browser checks: start `npx vite --port 5317`, then `node e2e/<spec>.mjs` or `npm run e2e` (they use the local Chrome). Rules tests: `npm run test:rules` (needs Java and the Firebase emulator).
- **An edit does nothing**: find the action in `editor/actions/`, check it ends in `updateNodes` or `updateDoc` (one `commit`), then look at the node in the doc store (`useDocStore.getState().doc`).
- **The page looks different in the editor, Preview and a download**: all three share `model/serialize/*`; Preview and downloads go through `forVisitors`, the React download through `export/react`. Compare the three outputs for the same page.
- **Something works while editing but not in Preview**: the editor frame runs `frame/runtime/*.js`; visitors get a player script from `model/serialize/*Player.ts`. They are separate code and must be kept in step.
- **Something works in Preview but not in the React project**: React drops `data-fe-*` attributes (`isEditorAttr`); look at how `jsxWriter`, `popups/jsxPopups.ts` and the template files write it.
- **Saving or sharing fails**: `workspace/api/*` and `firestore.rules`; a `permission-denied` usually means a rule check (counter, `isPublic` mirror, version).
- **Browser storage keys**: `tweak:flags` (flag clicks), `tweak:analytics` (stats consent), `tweak:signed-in` (signed-in hint).

## Import and editing core

Per-feature workflows for the "Import and editing core" group of Tweak (paste, page model, frame, canvas, panels, screen sizes, colors, layouts, animations, pictures).

Features in this group:
- Paste import and parsing
- AI prompt helper
- Page model, edits and undo
- Editor frame and bridge
- Canvas selection, drag, resize and drop rules
- Text editing (Quill) and quick actions
- Settings panel and style sections
- Layers panel and Add panel
- Code tab and Add code
- Screen sizes
- Colors and palette
- Layouts
- Animations
- Pictures and uploads

Paths are relative to `D:\Q_P\frontend-editor`. `editor/` below means `src/features/editor/`. E2e specs run with `npm run e2e` (needs `npx vite --port 5317`); `e2e/browser.mjs` is the shared helper (`openPage`, `editorFrame`, `openExample`).

### Paste import and parsing
- **What it does:** Turns whatever the person pastes (a whole AI chat answer, a fragment, or separate HTML/CSS/JS pieces) into one editable page, or starts from a blank page.
- **Where in the app:** Try it (`/try`) and the project editor's paste screen: the big "Your code" box, the "One page / A website with several pages" choice, the link "My code comes in separate parts (HTML, CSS, JavaScript)", the "Found: ..." line, buttons "Open in editor" and "Start with a blank page".
- **Accepts (input):** Free text with optional ```` ```html ```` fences and chat text around them; optional CSS and JS boxes; a dropped `.html` file (`CodeBox` with `acceptFiles`, `import/readCodeFile.ts`). Rejected when it has no tag (`looksLikeHtml`) or no element besides `<body>`.
- **Produces (output / redirect):** A `PageDoc` handed to `onOpen(doc)`, which calls `openDocument(doc)` and shows the editor. Try it also saves it with `saveLocalDraft` (localStorage `tweak:try-draft`). Plain-language messages: "This doesn't look like web page code..." or "We found the code but no visible content in it."; a note listing linked files that were not pasted (for example `/src/main.tsx`).
- **Needs:** Browser `DOMParser`. No flag, sign-in or network. A website choice uses `toSite` from `editor/model/pageOps.ts`.
- **How it works:**
  1. `PasteScreen` (`src/features/import/PasteScreen.tsx`) defers the text (`useDeferredValue`) and calls `analyzePaste` (`import/analyzePaste.ts`).
  2. `analyzePaste` checks `looksLikeHtml`, then `parsePastedCode` (`editor/model/parse/parseDocument.ts`), counts elements and builds the `found` list; `localFiles(doc)` gives `missing`.
  3. `parsePastedCode` -> `combinePastedCode` (`parse/cleanPaste.ts`): `stripCodeFences` on each box, wraps a fragment in a full document, appends the CSS/JS boxes as `<style>`/`<script>` before `</body>`.
  4. `parseHtmlDocument`: `DOMParser` repairs the HTML; `readHeadTags` (`parse/headTags.ts`), `extractPageExtras` (`parse/readHead.ts`: styles, links, scripts, title) and `elementToNodes` (`parse/domToNodes.ts`: flat node map, inline `style` becomes `styles.desktop`, `data-fe-hidden` becomes `hidden`).
  5. "Open in editor": `open()` calls `asKind(summary.doc, kind)` (`import/projectKind.ts`); a `site` runs `toSite` (header/footer stay shared, the rest becomes the "Home" page container).
  6. "Start with a blank page": `blankDoc(kind)` (`projectKind.ts`) parses a small starter page (a website also gets a header and footer).
  7. `PlaygroundPage` `onOpen` -> `saveLocalDraft` -> `openDocument` (`editor/actions/documentActions.ts`: clears selection, `useDocStore.load`).
- **Debug:** Files: `import/*`, `editor/model/parse/*`. Unit tests: `src/features/import/analyzePaste.test.ts`, `editor/model/model.test.ts` ("parsing pasted code"). E2e: `e2e/paste.mjs`, `e2e/project-kind.mjs`, `e2e/code-editors.mjs`, `e2e/local-files.mjs`, `e2e/real-page.mjs` (fixtures in `e2e/fixtures/`). Inspect: the doc in `useDocStore.getState().doc`; localStorage `tweak:try-draft`.
  - Page opens empty or without the AI's section -> text had no `<` tags, or code sits only in a skipped tag (`SKIPPED_TAGS` in `domToNodes.ts`: script, style, link, meta, base, title are not nodes).
  - "No visible content" -> only `<head>` content was pasted; `elements < 1` in `analyzePaste`.
  - Page looks blank but "Found" lists a file note -> the HTML links local files not pasted; `withoutLocalFiles` drops them in the frame and Preview.
  - Page-kind choice ignored -> `asKind` is applied only in `open()`; the blank path uses `blankDoc(kind)`.

### AI prompt helper
- **What it does:** Lets someone with no code pick a page idea, edit a short description, and copy a ready prompt to paste into ChatGPT, Claude or Gemini.
- **Third choice (React project):** a switch at the top of the helper (with its own 21 ideas that are whole apps: shops, booking, learning and community, dashboards, each with sign-in, protected pages and roles), "A web page" (opens in the editor) or "A React project (TypeScript)", builds a different prompt: a multi-page React + TypeScript project (feature folders, mock sign-in, typed mock data, responsive, clean code) that the AI writes as a file tree plus one block per file. It opens in the editor (see "Open a React project that Tweak did not make") when it follows the prompt's import rules. Rules: `reactRules*.ts`; checked against Tweak's own React download by `reactPrompt.test.ts`; e2e `e2e/prompts.mjs`.
- **Where in the app:** Paste screen, the folded section "No code yet? Get a page from an AI in 3 steps" (idea chips by group, "Your page (change anything)" box, "Rules for the AI", "Copy prompt", "Open ChatGPT / Claude / Gemini" links).
- **Accepts (input):** A preset id (chip), the edited brief text, and the paste screen's kind (`page` or `site`, passed as `kind` to `AiPromptHelper`).
- **Produces (output / redirect):** The prompt text on the clipboard (`navigator.clipboard.writeText`), toast "Prompt copied - paste it into your AI tool" or an error toast "Couldn't copy...". Analytics `prompt_copy` (`preset`, `edited`). Links open in a new tab. Nothing is saved or sent anywhere else.
- **Needs:** Clipboard permission. No flag, sign-in or network. `promptRules.ts` must stay in step with the parser and the frame.
- **How it works:**
  1. `AiPromptHelper` (`src/features/prompts/AiPromptHelper.tsx`) lists `PROMPT_GROUPS` (`promptGroups.ts`: everyday, brands, events, portfolio), each with its own intro and a blank brief first; presets live in `prompts/presets/*.ts`.
  2. Choosing a chip calls `briefFor(id, kind)` (`prompts.ts`); for a site it appends `PAGES_LINE`; switching kind adds or removes that line while keeping typed text.
  3. "Copy prompt" calls `buildPrompt(brief, presetId, kind)` = group intro + brief + `PROMPT_RULES` (`promptRules.ts`) and, for a site, `SITE_RULES` (`siteRules.ts`).
  4. The person pastes the AI's answer into the paste screen, which follows the Paste import workflow above.
- **Debug:** Files: `src/features/prompts/*`. Unit test: `src/features/prompts/prompts.test.ts` (four groups with unique ids, same brief headings, intro + brief + rules order, site rules only for a website, an answer written to the site rules opens as a site). E2e: `e2e/prompts.mjs`.
  - Copy fails -> clipboard blocked (needs a secure context); the error toast tells the person to copy by hand.
  - AI answers with several files or frameworks -> the rules in `promptRules.ts` were edited or removed from the textarea; the rules are shown in the "Rules for the AI" fold, not in the textarea.
  - Site answer opens as one page -> the AI did not use `data-fe-page` wrappers (see `siteRules.ts`); `toSite` only wraps when `listPages(doc)` is empty.
  - Editor learns a new breakpoint or pattern but AI output ignores it -> update `promptRules.ts` (rule 19 in `.claude/skills/editor-model/SKILL.md`).

### Page model, edits and undo
- **What it does:** Holds the page as a flat immutable map of nodes and applies every edit as one undoable step, with repeated edits of the same thing merged.
- **Where in the app:** Undo and Redo buttons in the top bar (`toolbar/HistoryButtons.tsx`, "Undo (Ctrl+Z)" / "Redo (Ctrl+Shift+Z)"), keyboard shortcuts, and every panel that edits the page.
- **Accepts (input):** Calls to `actions/*` with an id and a value (`setStyle`, `setStyles`, `setAttribute`, `setAttributes`, `toggleHidden`, `changeTag`, `deleteNode`, `duplicateNode`, `moveNodeTo`, `nudgeNode`, `insertHtml`, `setInnerHtml`, `setText`). Optional `coalesceKey`.
- **Produces (output / redirect):** A new `doc` in `useDocStore`, `version + 1` (autosave watches it), `past` (capped at `HISTORY_LIMIT` = 100 in `src/config/app.config.ts`) and cleared `future`. After delete the parent is selected; after duplicate the copy is selected. `track('undo' | 'redo')`.
- **Needs:** Nothing external. Rules: never mutate nodes, only `children` holds children, one edit = one `commit` (`.claude/skills/editor-model/SKILL.md`).
- **How it works:**
  1. UI -> `actions/styleActions.ts` `setStyle` (or another action).
  2. -> `actions/commit.ts` `updateNodes(change, coalesceKey)` or `updateDoc(change, coalesceKey)`; unchanged node maps are skipped.
  3. -> pure helpers in `editor/model/tree/treeOps.ts` (`patchNode`, `insertSubtree`, `removeNode`, `moveNode`, `replaceChildren`) and `queries.ts`.
  4. -> `store/doc.store.ts` `commit(next, coalesceKey)`: runs `propagate` (`model/reuse/propagate`) so changes to a main component reach its copies in the same step; merges into the previous undo step when the key equals `lastEdit.key` and under `COALESCE_MS` = 800 ms.
  5. `undo` / `redo` swap `doc` with `past` / `future` (`lastEdit` reset).
  6. Shortcuts: `shortcuts/useEditorShortcuts.ts` (Ctrl/Cmd+Z, Ctrl+Y or Ctrl+Shift+Z, Delete/Backspace, Ctrl+D, Esc selects parent, Alt+Up/Down, Enter edits text); ignored while typing in inputs, `.ql-editor`, an open `dialog`, or Preview.
  7. Selection and view live in `store/selection.store.ts` (`selectedId`, `hoveredId`, `editingTextId`) and `store/view.store.ts` (`breakpoint`, `zoom`, `sidePanel`, `inspectorTab`, `pageId`, `viewer`, `focusId`). `openDocument` resets selection and history.
  8. `actions/editStats.ts` `countEdit` uses the same 800 ms window for usage stats.
- **Debug:** Files: `editor/store/doc.store.ts`, `editor/actions/commit.ts`, `editor/model/tree/treeOps.ts`. Tests: `editor/model/model.test.ts` ("tree operations": move, refuse move into itself, remove subtree, clone with fresh ids); `reuse/reuse.test.ts` for `propagate`. There is no unit test of `doc.store` itself (not verified elsewhere). E2e: `e2e/canvas.mjs` ("undo restores order"), many other specs end with an undo check. Inspect: `useDocStore.getState()` in devtools (`past.length`, `version`, `lastEdit`).
  - Slider drag makes many undo steps -> the action did not pass a `coalesceKey`, or the keys differ between calls.
  - Ctrl+Z does nothing -> focus is in an input, CodeMirror (its own undo) or Quill; or a `dialog[open]` owns the keyboard.
  - A node change does not reach the canvas -> the node object was mutated (same identity); `diffNodes` compares by reference.
  - Redo lost -> any new `commit` clears `future`.

### Editor frame and bridge
- **What it does:** Shows the page live (its own CSS and scripts run) inside a locked iframe and lets the editor ask it questions and send it patches over postMessage.
- **Where in the app:** The middle canvas area; no separate UI.
- **Accepts (input):** The `PageDoc` (via `useDocStore`), view state (`pageId`, `viewer`, `focusId`) and messages from `askFrame` / `tellFrame` / `watchNode`.
- **Produces (output / redirect):** A rendered iframe titled "Your page" (`sandbox="allow-scripts"`, `pointer-events: none`), patches to its DOM and CSS, streamed `rects` of watched nodes, and replies to `hit`, `drop`, `position`, `computed`, `capture`.
- **Needs:** Nothing external. Never add `allow-same-origin` (editor, Preview or public view). `loadCapture` may send only the app's bundled html-to-image.
- **How it works:**
  1. `EditorFrame.tsx` builds the source once per `sourceKey(doc)` (links, scripts, html attrs, head tags, root id) with `buildEditorSource` (`frame/editorSource.ts`): page + `data-fe-id` on elements + model JSON in `<script id="fe-model">` + `RUNTIME_SCRIPTS` (`frame/runtime/index.ts`: core, render, measure, drop, capture, lists, animate, ready) before the page's body scripts.
  2. A layout effect creates the bridge (`frame/bridge.ts` `createBridge`) and stores it with `useFrameStore.setBridge` (`frame/frame.store.ts`).
  3. On every doc change `pushChanges` sends `sync` (`diffNodes`: changed nodes + removed ids), `css` (`edits`, `page`) and `data`; view changes send `css { view }` from `viewCss`.
  4. Messages are `{ fe: 1, type, payload, rid? }`; those sent before the frame's `ready` wait in a queue; replies are matched by `rid`; both sides check `event.source`.
  5. In the frame `runtime/core.js` dispatches to `window.__fe.handlers[type]`; `render.js` (`sync`, `css`), `measure.js` (`watch`, `hit`, `computed`, `scroll`, `mark`, `attr`, `unattr`), `drop.js` (`drop`, `position`), `capture.js` (`loadCapture`, `capture`), `lists.js` (`data`), `animate.js` (`play`).
  6. UI code calls `askFrame<T>(type, payload)` (null when no bridge or on error), `tellFrame(type, payload)`, `watchNode(id)` (ref-counted watch list).
  7. A new DOM question needs a new runtime handler, never direct DOM access.
- **Debug:** Files: `editor/frame/*`. Unit tests: `editor/frame/editorFrame.test.ts` (renders with scripts, ids and SVG; hidden parts marked; patches keep identity; move/tag/removal; CSS updates; unpasted files left out; model JSON cannot close its script), `editor/frame/viewCss.test.ts`. E2e: `e2e/fidelity.mjs`, `e2e/real-page.mjs`, `e2e/local-files.mjs`. Inspect: devtools frame picker -> the "Your page" frame, `window.__fe` (`nodes`, `dom`, `handlers`); look for messages with `fe: 1` in the parent's `message` events.
  - Canvas outlines stuck or missing -> no `ready` yet (queued messages), or the node is not watched (`rects` only for `watchNode` ids).
  - A page script change needs a reload of the frame -> expected: scripts are in `sourceKey`, so the frame is rebuilt; other edits are patched.
  - `askFrame` returns null -> bridge disposed (frame rebuilt) or the handler threw (the reply has `ok: false`).
  - Page click handlers never fire while editing -> expected (`pointer-events: none`); the Konva overlay takes the pointer.

### Canvas selection, drag, resize and drop rules
- **What it does:** Lets the person click an element to select it, drag it to a new place, resize it with handles, and shows a blue line where it will land.
- **Where in the app:** The page area: hover dashed outline, selected solid outline with name tag and resize handles, wheel to scroll, Ctrl/Cmd+wheel to zoom, zoom control in the top bar.
- **Accepts (input):** Mouse input on the Konva overlay (`canvas/Overlay.tsx`); double-click (`event.evt.detail >= 2`) on a text element opens the text editor.
- **Produces (output / redirect):** Selection changes in `selection.store`; moves via `moveNodeTo`; for `position: absolute|fixed` elements `left`/`top` styles; resizes as `width` (+ `max-width: none`) and/or `height` styles at the current screen size.
- **Needs:** The frame bridge (feature above); `canvas/geometry.ts` `FramePlacement` for all coordinate conversions.
- **How it works:**
  1. `Canvas.tsx` measures the area, computes `scale` and `FramePlacement { left, top, scale }`, renders `EditorFrame` and `Overlay`.
  2. `useStagePointer.ts`: mouse move -> `nodeIdAt` (`geometry.ts`) -> `askFrame('hit')` -> `selection.hover`; click -> `select` (or `editText` on a double-click of a text-editable element). Only the newest hover answer is kept; clicks are always answered.
  3. `useTrackedBox(id, placement)` shows boxes from the frame's streamed `rects`; `DraggableBox` is positioned imperatively (never by props).
  4. Drag start: `useBoxDrag.start` asks `position`; absolute/fixed elements move freely (`moveFreely` -> `setStyles` left/top), others are reordered.
  5. During drag `findDropTarget` (`canvas/dropTarget.ts`) asks `drop`; `frame/runtime/drop.js` decides: over a sibling reorder, over a container nest, over a leaf (`LEAF_TAGS`) go before/after it; the blue `indicator` rect is drawn.
  6. Drop: `moveNodeTo(id, parentId, index)` (`actions/nodeActions.ts`), then `select(id)`.
  7. Resize: `SelectionBox.tsx` Konva `Transformer` -> `handleTransform` -> `canvas/resize.ts` `resizeFromHandle` -> `setStyles`.
- **Debug:** Files: `editor/canvas/*`, `editor/frame/runtime/drop.js`, `runtime/measure.js`. Unit tests: none for canvas (verified only in the browser, per skill rule 12). E2e: `e2e/canvas.mjs` (select, drag reorders cards, undo, resize widens button, phone view), `e2e/sidebar.mjs`. Inspect: `useFrameStore.getState().rects`, `useSelectionStore.getState()`.
  - Selection box offset from the element -> coordinates mixed by hand instead of `geometry.ts`, or a canvas wrapper uses `overflow: hidden` (must be `clip`, rule 15).
  - Drag does nothing for a positioned element -> it is `position: absolute/fixed`, so it gets `left`/`top`, no drop line.
  - Double-click opens nothing -> the element fails `isTextEditable` (use the "Words" list instead).
  - Blue line in the wrong place -> change `drop.js` only and re-check in the browser.

### Text editing (Quill) and quick actions
- **What it does:** Edit words directly on the page with a small rich-text editor, and act on the selected element with a floating button bar.
- **Where in the app:** Double-click text, press Enter on selected text, or the "Edit text" quick action. The quick bar (`role="toolbar"`, "Quick actions") floats above the selection: Edit text, Change picture, Move up, Move down, Select the box around it, Duplicate, Edit code, Delete.
- **Accepts (input):** Text-editable elements only (`isTextEditable` in `editor/model/tree/textRules.ts`: inline text plus bare formatting, plain links, class-only spans; no SVG text, pictures or icon fonts). Toolbar: bold, italic, underline, color, link, clean.
- **Produces (output / redirect):** `setInnerHtml(id, html)` on finish (one undo step) only when the output differs from Quill's own first output. Enter finishes in single-line tags (headings, links, buttons, `li`...); Shift+Enter makes a new line; Esc cancels. Other elements fall back to the "Words" list in the settings panel.
- **Needs:** `quill` (lazy chunk), `ClassSpan` blot registered in `text/quillSetup.ts`.
- **How it works:**
  1. `selection.editText(id)` -> `text/TextEditorLayer.tsx` lazy-loads `QuillEditor` over the tracked box.
  2. `QuillEditor.tsx` asks the frame for `computed` styles and `matchTextStyle` (`text/matchStyle.ts`) makes the box look like the element.
  3. Content goes in with `childrenToHtml(...)` then `quill.clipboard.dangerouslyPasteHTML`; the frame hides the original with the `mark` `data-fe-editing`.
  4. On finish or outside click: `quillToInlineHtml(quill.getSemanticHTML())` (`text/quillHtml.ts`, paragraphs become `<br>`).
  5. `actions/contentActions.ts` `setInnerHtml` -> `htmlToChildNodes` -> `replaceChildren` -> `updateNodes`.
  6. `quick/QuickActions.tsx` `useActions` picks buttons by kind (picture, text, box); "Edit code" opens `quick/EditCodeDialog.tsx` (see Code tab feature); "Change picture" opens `ChangePictureDialog` (see Pictures feature).
- **Debug:** Files: `editor/text/*`, `editor/quick/*`, `editor/model/tree/textRules.ts`. Unit test: `editor/text/quillHtml.test.ts`. E2e: `e2e/text.mjs`, `e2e/real-page.mjs`. Inspect: `selection.editingTextId`; frame attribute `data-fe-editing` while editing.
  - Colored words lose their class -> `classSpan` not registered (`setupQuill`).
  - Text unchanged after editing -> output equals Quill's first output, so save is skipped on purpose.
  - Double-click does not open the editor -> `survivesQuill` is false for something inside (extra attributes, own styles); extend it only after a round-trip test.
  - Typing letters triggers shortcuts -> `isTyping` check in `useEditorShortcuts.ts` should skip `.ql-editor`.

### Settings panel and style sections
- **What it does:** Right-hand panel with everyday controls (text size, color, spacing, size, corners, arrange, shadow, background) for the selected element at the current screen size.
- **Where in the app:** Right panel, tabs "Design", "Actions", "More" (`inspector/InspectorTabs.tsx`). Design holds the sections "Text", "Picture", "Arrange items", "Background", "Spacing", "Size", "Corners & border", "Shadow & see-through" (only those that apply to the element); "Picture file", "Words", and "Page" appear for pictures, non-Quill text and the page itself.
- **Accepts (input):** Control changes: color, slider, select, segmented, size, text, sides (`FieldControl` in `inspector/fieldTypes.ts`). Reset button per field ("Back to original").
- **Produces (output / redirect):** `setStyle` / `setStyles` on `node.styles[breakpoint]` (empty value removes the override). Changed fields show a dot ("Changed"). Never writes to `doc.css`.
- **Needs:** Frame `computed` answers; companion styles keep a setting visible.
- **How it works:**
  1. `Inspector.tsx` builds a `SectionContext` and calls `useComputedStyle(selectedId)` (`inspector/useComputedStyle.ts`): `askFrame('computed')` one animation frame after each `version` or breakpoint change.
  2. `StyleSections.tsx` filters `STYLE_SECTIONS` (`inspector/fields/index.ts`, built from `fields/textAndBox.ts` and `fields/layoutAndEffects.ts`) by each section's `when(context)`; `BACKGROUND_AFTER = 'arrange'` places `BackgroundSection` after "Arrange items".
  3. `FieldRow.tsx`: value = `overrides[prop]`, else `field.read(computed)`, else `computed[prop]`.
  4. A change calls `companionStyles(prop, value, computed)` and `releasedStyles(...)` (`inspector/companionStyles.ts`); if extras exist -> `setStyles`, else `setStyle` (`actions/styleActions.ts`). Examples: `border-color` adds `border-style: solid`; `-webkit-line-clamp` adds display/overflow helpers; `width` sets `max-width: none`.
  5. `BackgroundSection` reads `background-image` through `parseBackground` (`inspector/background/backgroundLayers.ts`) into `{ gradient, picture, custom }` and writes the whole value in one `setStyle` with `backgroundCss` (gradient on top). Unreadable backgrounds show "This background is more detailed than these controls can show...".
  6. Text inputs use `useDraft` (save on Enter or blur).
- **Debug:** Files: `editor/inspector/*`. Unit tests: `inspector/companionStyles.test.ts`, `inspector/background/background.test.ts`, `inspector/controls/cssValues.test.ts`. E2e: `e2e/inspector.mjs`, `e2e/background.mjs`, `e2e/line-clamp.mjs`. Inspect: `useDocStore.getState().doc.nodes[id].styles`; the `computed` reply in the bridge.
  - Control shows a misleading number (for example `auto`) -> add a `read` to that `StyleField`.
  - A change has no visible effect -> a companion is missing; add it to `COMPANIONS`.
  - Edit does not beat the original CSS -> check the doubled `[data-fe-id]` selector in `editorOverrideCss` and that pasted CSS is inside `@layer page` (`wrapUserCss`).
  - Panel values stale -> `useComputedStyle` waits one frame; check `version` changes and breakpoint.

### Layers panel and Add panel
- **What it does:** Layers shows everything on the page as a tree to select or hide; Add inserts ready blocks (text, picture, forms, widgets, your components) into the page.
- **Where in the app:** Left rail tabs "Layers" and "Add" (`sidebar/Sidebar.tsx`). Add has collapsible folds: "Basics" (open by default), "Your components", "Ready-made", the widget groups (from `WIDGET_GROUPS`), and "Paste more code".
- **Accepts (input):** Clicks on rows (select, expand, eye to hide) and on block buttons.
- **Produces (output / redirect):** Layers: `select(id)`, `toggleHidden(id)` (marks the node `hidden`, shown faded on the canvas). Add: `insertHtml(html)` inserts and selects the new element; `track('add_block', ...)`. Fold open/closed state is kept in `sidebar/addFolds.store.ts` while the editor is open.
- **Needs:** For sites, Layers shows the shared layout plus the current page only. Some blocks need other features (data sources, widgets, forms).
- **How it works:**
  1. `LayersPanel.tsx` maps top-level element children of the root (sites: layout + `resolvePage`) to `LayerRow` (`sidebar/LayerRow.tsx`); expanded ids are in `sidebar/layers.store.ts`; selecting reveals ancestors with `getAncestorIds`.
  2. `AddPanel.tsx` renders `Fold` (`sidebar/Fold.tsx`) sections; basic blocks come from `sidebar/blocks.ts` (`BLOCKS`).
  3. A click calls `insertHtml` (`actions/contentActions.ts`): `resolveInsertTarget` picks the target: inside a focused component, else the end of the current page when nothing is selected, else inside a selected container, else right after a leaf (`LEAF_TAGS`).
  4. `htmlToChildNodes` -> `insertSubtree` per top node -> `updateNodes` (one undo step) -> select the first new element.
  5. `ReadyBlocks.tsx` blocks (List from data, Animation box, Pop-up, Ask first, Contact form, Sign-up form) and `WidgetBlocks.tsx` (`insertWidget` in `actions/widgetActions.ts`) use the same insert path with their own HTML.
- **Debug:** Files: `editor/sidebar/*`, `editor/actions/contentActions.ts`. Unit tests: `editor/model/widgets/widgets.test.ts` (widget blocks); no unit test of `resolveInsertTarget` found. E2e: `e2e/sidebar.mjs`, `e2e/add-folds.mjs`, `e2e/widgets.mjs`.
  - New block lands in the wrong place -> `resolveInsertTarget` rules above (leaf selected means after it; nothing selected means end of page).
  - Folds reset -> `addFolds.store` only lives while the editor is open.
  - A page is missing from Layers -> sites show only the current page (`view.store.pageId`).
  - Block count in a fold header wrong -> `count` prop passed to `Fold`.

### Code tab and Add code
- **What it does:** Lets the person edit the real HTML, CSS and JavaScript (whole page or one part), or paste more code into the page.
- **Where in the app:** Left rail "Code" tab: "Page code (HTML + CSS + JS)" with "Apply changes" / "Discard", "Styles (CSS)", one box per inline "Script N"; a "Page code / React (TSX)" switch. Quick actions "Edit code" dialog for one part. Add tab: "Paste more code" with "Add this code".
- **Accepts (input):** Code text, optionally inside code fences (stripped again). Add code takes three optional boxes (HTML, CSS, JS), any one is enough.
- **Produces (output / redirect):** Page code: `applyHtml` replaces the whole page (HTML, CSS, JS, title, head tags) or one part, as one undo step, toast "Code applied - Ctrl+Z to undo", selection reset. Styles and Script boxes update live, debounced 400 ms (`APPLY_DELAY_MS`), one undo step per burst. Add code: toast "Added to your page: ..." or a plain error ("Paste some HTML, CSS or JavaScript first.", "The HTML box doesn't look like web page code..."). A warning "Tablet and phone-only changes inside this part will be removed when you apply." shows when relevant.
- **Needs:** CodeMirror (lazy `codemirror` chunk, `shared/code/CodeEditor`).
- **How it works:**
  1. `sidebar/CodePanel.tsx` shows `HtmlCodeBox` (`sidebar/code/HtmlCodeBox.tsx`) and `CodeArea` boxes; text for the HTML box comes from `editableHtml(id)` (`actions/codeActions.ts`): whole source via `docToEditableSource`, a part via `nodeToHtml(..., { forEditing: true })`.
  2. Apply: `stripCodeFences`, `looksLikeHtml` check, then `applyHtml(id, code)`.
  3. `applyHtml`: root -> `parsePastedCode({ html: code })` replaces the doc; part -> `applyToPart`: `splitSnippetAssets` (`parse/snippetAssets.ts`) splits HTML, `<style>`, `<script>`; `replaceElement` swaps nodes; styles and scripts join the page.
  4. `hasScreenSizeEdits(id)` drives the warning (tablet/mobile styles cannot be written as HTML).
  5. CSS and script boxes: `applyTo` -> `updateDoc` with keys `code:css` / `code:script:<n>`.
  6. Add code: `sidebar/AddCodeBox.tsx` -> `actions/addCodeActions.ts` `addCodeToPage` -> `model/addCode.ts` `addCodeToDoc(doc, parts, resolveInsertTarget())`: parses, inserts nodes, appends new CSS under `/* Added code */`, merges links and scripts without duplicates -> `updateDoc`, select first new element.
- **Debug:** Files: `editor/sidebar/code/*`, `editor/actions/codeActions.ts`, `editor/actions/addCodeActions.ts`, `editor/model/addCode.ts`. Unit tests: `editor/actions/codeActions.test.ts` (inline-style display, round trip, part replace as one undo step, whole page, CSS/JS changes, part's own style/script join the page, screen-size warning), `editor/model/addCode.test.ts`. E2e: `e2e/edit-code.mjs`, `e2e/add-code.mjs`, `e2e/code-editors.mjs`. Inspect: `docToEditableSource(doc)` output; `doc.css`, `doc.scripts`.
  - Applying unchanged code changes the page -> source is not idempotent (rule 17: no whitespace between body content, scripts and `</body>`).
  - Phone tweaks vanish after Apply -> expected; they only exist as `styles.tablet|mobile`.
  - Pasted script runs twice -> `same()` in `addCode.ts` compares `src` or trimmed code; differing text counts as a new script.
  - Typing in a code box triggers page shortcuts -> `.cm-content` is contenteditable and is ignored by `isTyping`.

### Screen sizes
- **What it does:** Lets the person see and fix the tablet and phone look; edits made on a smaller size apply to that size and smaller.
- **Where in the app:** Top bar radio group "Screen size": Computer, Tablet, Phone (`toolbar/DeviceSwitch.tsx`); in the settings panel a notice "Tablet view. Changes apply to tablets and phones only." / "Phone view. Changes apply to phones only."; "Show or hide" switch labelled "Show on the page", "Show on tablets & phones", "Show on phones".
- **Accepts (input):** The chosen `Breakpoint` (`desktop | tablet | mobile`) in `view.store`.
- **Produces (output / redirect):** Edits go into `node.styles.tablet` / `styles.mobile`; the frame width changes (1280, 768, 390 px); export CSS gets `@media (max-width: 1024px)` and `@media (max-width: 640px)` blocks. Analytics `switch_screen`.
- **Needs:** Nothing external. Breakpoints are desktop-first: phone overrides tablet overrides computer.
- **How it works:**
  1. `DeviceSwitch` -> `useViewStore.setBreakpoint`.
  2. `BREAKPOINTS` / `BREAKPOINT_ORDER` in `editor/model/breakpoints.ts` give `frameWidth`, `media`, label, icon.
  3. `Canvas.tsx` `useLayout` uses `frameWidth` for the iframe width; because the frame is really that wide, the page's own media queries react.
  4. `actions/styleActions.ts` `setStyle` defaults the `breakpoint` argument to `useViewStore.getState().breakpoint`.
  5. `buildOverrideCss` (`model/serialize/styleSheets.ts`) emits one block per breakpoint, wrapped in the media query for tablet and mobile; `editorOverrideCss` (`frame/editorSource.ts`) uses doubled `[data-fe-id]` selectors in the frame.
  6. `inspector/sections/VisibilitySection.tsx` sets `display: none` for this size, or `revert` to override a hide from a larger size (`hiddenByBiggerSize`).
  7. `useComputedStyle` re-asks after a breakpoint change.
- **Debug:** Files: `editor/model/breakpoints.ts`, `editor/model/serialize/styleSheets.ts`, `editor/toolbar/DeviceSwitch.tsx`. Unit test: `editor/model/model.test.ts` (export adds classes for edits; media wrapping is exercised through it); no dedicated breakpoint test found. E2e: `e2e/canvas.mjs` (phone view), `e2e/inspector.mjs` ("Show on phones" switch, picture hidden on phone). Inspect: `node.styles` keys; the `fe-edits-css` style element inside the frame.
  - Phone edit shows on the computer view -> it was made while Computer was selected.
  - A phone-only hide also hides on a smaller screen but not on tablet -> expected: the phone block is `max-width: 640px` only.
  - "Show" switch does not bring the element back -> hidden by the page's own CSS or a larger size; the section sets `revert`.
  - Code Apply loses phone changes -> see the Code tab feature.

### Colors and palette
- **What it does:** Lists every color the project uses and changes one color everywhere it appears in one step.
- **Where in the app:** Left rail "Design" tab, section "Colors": "Theme colors" and "Colors on your page" (each row says "used N times", "Show all N colors").
- **Accepts (input):** A color picked in a row (`ColorRow`), source key (a normalized color) and a target hex.
- **Produces (output / redirect):** A new doc where the color is replaced in the page CSS (declaration blocks only), every node's style values at every screen size and SVG/paint attributes (`fill`, `stroke`, `stop-color`, `flood-color`, `lighting-color`, `color`, `bgcolor`). One undo step per picker drag (shared coalesce key). Theme colors (`--var: #color`) change only through the theme row. Analytics `palette_change`.
- **Needs:** Nothing external.
- **How it works:**
  1. `sidebar/design/DesignPanel.tsx` renders `sidebar/colors/ColorsPanel.tsx`.
  2. `paletteOf(doc)` (`model/palette.ts`) scans CSS (`scanCss` in `model/paletteCss.ts`), node styles and color attributes (`scanColors` in `src/lib/colorTokens.ts`) and counts uses; comments and selectors are ignored.
  3. A row change calls `changeColor(fromKey, hex, "color:<from>")` or `changeThemeColor(name, fromKey, hex, "theme:<name>:<from>")` (`actions/paletteActions.ts`).
  4. These call `updateDoc` with `replaceColor` / `setThemeColor` (`model/palette.ts`; `replaceCssColor`, `setCssVarColor`, `replaceColors`).
  5. Untouched nodes keep their identity (so `diffNodes` sends only changed nodes); `commit` coalesces the drag.
- **Debug:** Files: `editor/model/palette.ts`, `editor/model/paletteCss.ts`, `src/lib/colorTokens.ts`, `editor/sidebar/colors/*`. Unit test: `editor/model/palette.test.ts` (lists theme and literal colors, changes everywhere except theme variables, keeps untouched nodes the same objects, changes a theme color on its own). E2e: `e2e/colors.mjs`.
  - A color is not listed -> written as a name the scanner does not read, or only inside a comment.
  - Changing a color leaves `var(--primary)` users unchanged -> by design; use the "Theme colors" row.
  - Many undo steps while dragging -> the `from` key in the coalesce key changes; check `ColorRow`'s `onChange(hex, from)`.
  - A color is split across spellings (`#fff`, `white`) -> keys are normalized by `parseColor` in `src/lib/colorTokens.ts`; check there if two spellings are listed separately.

### Layouts
- **What it does:** Adds a ready-made top bar, side menu, or both, with a menu built from the site's pages, as normal editable boxes.
- **Where in the app:** Left rail "Design" tab, section "Layout": choices "Top bar", "Side menu", "Both", switch "Replace my current header" (only when the page has its own header), buttons "Add layout" / "Update layout and menu", "Remove", "Show all pages in the menu".
- **Accepts (input):** A `LayoutKind` (`top | side | both`), the replace choice, and each page's "Show in the top bar / side menu" switch (`PageInfo.inMenu`).
- **Produces (output / redirect):** Generated boxes marked `data-fe-layout` placed before the pages (a one-page document first becomes a site), one CSS block between `/* tweak-layout */` and `/* /tweak-layout */`, menu links with `data-fe-nav` plus each page's visibility attributes, Log in / Sign up / Log out when a `/login` page exists, a burger button on phones. One undo step. Analytics `layout_apply`.
- **Needs:** A site (pages); `toSite` is applied automatically. Sign-in pages (`model/authPages.ts`) only for the account links.
- **How it works:**
  1. `sidebar/design/LayoutPanel.tsx` -> `actions/pageActions.ts` `createLayout(kind, replaceHeader)` / `dropLayout` / `showAllInMenu`.
  2. `createLayout` -> `updateDoc((doc) => applyLayout(doc, kind, replaceHeader))`.
  3. `applyLayout` (`model/layouts.ts`): `removeLayout(toSite(start))` removes old `data-fe-layout` boxes and strips the CSS block (`stripLayoutCss` in `model/layoutCss.ts`); with `replaceHeader` it removes `ownHeader(doc)`.
  4. `layoutHtml(kind, doc)` builds the HTML from `listPages(doc)` filtered by `inMenu` and `canBeInMenu` (not sign-in pages, not dynamic paths); `htmlToChildNodes` + `insertSubtree` at index 0 of the body.
  5. The CSS block `layoutCss(kind)` is appended to `doc.css`; classes are `lay-*`, using `body:has(.lay-side)`.
  6. `layoutOf(doc)` tells which kind is present (the panel shows "Update layout and menu" when one exists).
  7. Visitors: `serialize/layoutPlayer.ts`; React: see the React export docs (outside this group).
- **Debug:** Files: `editor/model/layouts.ts`, `editor/model/layoutCss.ts`, `editor/sidebar/design/LayoutPanel.tsx`. Unit tests: `editor/model/layouts.test.ts` (menu from pages without sign-in pages, only switched-on pages, no account links without a login page, apply/replace/report kind, no piling up and clean removal, one page becomes a site), `editor/model/serialize/layoutPlayer.test.ts`. E2e: `e2e/layouts.mjs`.
  - Menu is empty -> no page has "Show in the top bar / side menu" on; press "Show all pages in the menu".
  - Two bars after applying -> the old boxes lack `data-fe-layout`; only generated ones are removed (use "Replace my current header").
  - A page's link is missing -> it is a sign-in page or has a changing address (`:id`), by design.
  - Layout broken in the React project -> boxes sit inside `#root`, so CSS must not assume direct body children.

### Animations
- **What it does:** Makes any element glide, fade, zoom or flip in (on scroll, page open, hover, or looping), with the same look in the editor, Preview, downloads and the React export.
- **Where in the app:** Right panel, "Actions" tab, section "Animation" (Effect, Plays, Duration, Delay, Feel, One by one, "Play every time it scrolls into view", "Play" button); Add tab, fold "Ready-made", block "Animation box".
- **Accepts (input):** Attributes `data-fe-animate` (effect), `data-fe-trigger` (`scroll | load | hover | loop`), `data-fe-duration` (max 10 s), `data-fe-delay` (max 10 s), `data-fe-ease` (`smooth | spring | linear`), `data-fe-stagger` (max 2 s), `data-fe-repeat`. Choosing "None" clears all seven.
- **Produces (output / redirect):** The attributes on the node (`setAttributes`, one undo step per change). "Play" runs one preview inside the frame (animations do not run while editing). Preview/downloads include a small player script; the React export uses Motion.
- **Needs:** Web Animations API in the browser; the player skips when `prefers-reduced-motion: reduce`. React output adds Motion.
- **How it works:**
  1. `inspector/sections/AnimationSection.tsx` reads `animationOf(node)` (`model/animations.ts`, validates and defaults values) and writes with `setAttributes(node.id, ...)` (`actions/nodeActions.ts`); `track('animation_set')`.
  2. `EFFECTS` in `model/animations.ts` is the one table of effects (`from` and `hover` poses); `poseCss`, `easingCss`, `REST` convert poses to keyframes.
  3. "Play": `play(id, animation)` -> `tellFrame('play', { id, frames, duration, delay, easing, stagger })` -> `frame/runtime/animate.js` `fe.handlers.play` runs `element.animate` (children in turn when staggering).
  4. Visitors: `ANIMATION_SCRIPT` in `model/serialize/forVisitors.ts` uses IntersectionObserver for scroll, plus load, hover and loop.
  5. React: `export/react/animationTemplates.ts`, with the JSX writer making `motion.*` elements (`jsxExtras.motionFor`).
  6. The "Animation box" block is `ANIMATION_BOX_HTML` inserted by `ReadyBlocks` through `insertHtml`.
- **Debug:** Files: `editor/model/animations.ts`, `editor/inspector/sections/AnimationSection.tsx`, `editor/frame/runtime/animate.js`, `editor/model/serialize/forVisitors.ts`. Unit tests: `src/features/export/react/motionExport.test.ts` (React output); no unit test of `animations.ts` itself found. E2e: `e2e/animation.mjs` (block, settings, Play in the editor, player in Preview). Inspect: the element's `data-fe-*` attrs in Layers/Code; Preview page for the player.
  - Nothing moves while editing -> by design; press "Play".
  - Does not play in Preview -> reduced-motion setting is on, or the effect name is not in `EFFECTS` (`animationOf` returns null).
  - Children do not appear one by one -> "One by one" shows only with more than one element child and a scroll/load trigger.
  - Hover/loop looks different from scroll -> hover and loop use the `hover` pose, not `from`.

### Pictures and uploads
- **What it does:** Lets the person swap a picture from their computer or by link; it is uploaded to the account's storage when possible, otherwise small pictures are embedded in the page.
- **Where in the app:** Quick action "Change picture", or settings panel "Picture file" > "Change picture" (dialog "Change picture": "Use a picture from my computer", link field, "Short description"); also used for background pictures (`PicturePickerDialog`). Toolbar save area: "Move pictures out of the code" when a save fails because the page is too big. Project cards get a thumbnail.
- **Accepts (input):** PNG, JPG, WebP, GIF or AVIF only (SVG refused). Upload limit 5 MB; embed limit 400 KB (`MAX_EMBED_BYTES`).
- **Produces (output / redirect):** `src` (and `alt`, with `srcset` cleared) via `setAttributes` in one undo step. Network: `POST <VITE_ASSETS_URL>/upload?kind=image` (Bearer Firebase ID token, raw body) answered with `{ url }`; reading: `GET /a/<key>`. Plain-language errors, for example "That picture is too big to add here. Make it smaller (under 400 KB) or paste a picture link instead.", "Pictures can be up to 5 MB.", "Please choose a PNG, JPG, WebP, GIF or AVIF picture." Analytics `picture_add` (`upload` or `embed`).
- **Needs:** Flag `features.enable_uploads` (`src/config/features.config.ts`: true when `VITE_ASSETS_URL` is set and is not an `r2.dev` bucket address); signed-in user (`canUpload`); the deployed Worker in `workers/assets` (`wrangler.toml` vars `FIREBASE_PROJECT_ID`, `ALLOWED_ORIGINS`, R2 binding `ASSETS`). Without these, small pictures are embedded.
- **How it works:**
  1. `quick/ChangePictureDialog.tsx` -> `quick/PicturePickerDialog.tsx` -> `assets/PictureFileButton.tsx`.
  2. `pictureFromFile(file)` (`assets/uploadImage.ts`): checks type; if `canUpload()` and size allows, `uploadImage(file, { kind: 'image' })` with the token from `authService().getIdToken()`; on a network `TypeError` falls back to embedding when under 400 KB.
  3. Otherwise `readAsDataUrl` embeds the picture as a `data:` address.
  4. The dialog's "Use this picture" -> `setAttributes(id, { src, alt, srcset: '' })`.
  5. Worker `workers/assets/src/index.ts` routes `POST /upload` to `handleUpload` (`upload.ts`): `verifyFirebaseUser` (`auth.ts`), type and 5 MB checks, key `u/<uid>/<random>.<ext>` (thumbnails `thumbs/<uid>/<project>.<ext>`), `ASSETS.put`, returns `{ url }`; `serveAsset` sends `nosniff` and a locked CSP.
  6. Thumbnails: `workspace/useThumbnail.ts` -> `capturePng(null, { pixelRatio: 0.35, topOnly: true })` -> `uploadImage(..., { kind: 'thumbnail', projectId })` -> `setProjectThumbnail`.
  7. Too-big saves: `assets/movePictures.ts` `movePicturesOut` uploads every `embeddedPictures(doc)` entry and swaps them with `replaceEmbedded` (`editor/model/embedded.ts`) in one undo step.
- **Debug:** Files: `src/features/assets/*`, `workers/assets/src/*`, `src/features/editor/model/embedded.ts`, `src/features/editor/quick/PicturePickerDialog.tsx`. Unit tests: `src/features/assets/uploadImage.test.ts` (embed small, refuse SVG, explain too big), `editor/model/embedded.test.ts`. E2e: `e2e/assets.mjs` (embedded without the worker, svg refused kindly), `e2e/too-big.mjs`. Inspect: Network tab for `/upload`; the dev console warning `[uploads] VITE_ASSETS_URL is an r2.dev bucket address...`; `.env.example` for `VITE_ASSETS_URL`.
  - Pictures are embedded even when signed in -> `enable_uploads` false (`VITE_ASSETS_URL` empty or an `r2.dev` address, which only reads); set it to the Worker URL.
  - Upload 401 "Please sign in again." -> expired token, or `FIREBASE_PROJECT_ID` in `wrangler.toml` does not match.
  - Browser CORS error -> the app origin is not in `ALLOWED_ORIGINS` (`workers/assets/src/http.ts`).
  - Page too big to save -> pasted `data:` pictures; use "Move pictures out of the code" (needs sign-in and the Worker).

## Sites and data

Group "Sites and data": how a pasted page becomes a website with several pages, and how pages and boxes show data. All paths are under `src/features/` unless they start with `e2e/`. Model code lives in `editor/model`, actions in `editor/actions`, panels in `editor/sidebar` and `editor/inspector`. There are no entries for these features in `src/config/features.config.ts` (only `enable_oauth`, `enable_gallery`, `enable_uploads`, `enable_billing`, `enable_marketplace` exist), so none of them can be switched off by a flag.

Features:
- Multi-page sites
- Routes with changing parts
- Data sources
- Import JSON into data
- Connect your API
- List from data
- Table from data
- One item / records on boxes
- Data wiring to boxes
- Cards that go to a page or open a pop-up with the clicked item
- Search bar and filters wired to lists and tables

How to run the checks named below: unit tests with `npx vitest run <file>`; browser checks with the `e2e/*.mjs` specs (they use `check` and `openExample` from `e2e/browser.mjs`). The full gate from `CLAUDE.md` is `npx tsc -b && npx eslint . && npx vitest run && npx vite build`.

### Multi-page sites
- **What it does:** Turns a one-page document into a website. Each page is a box inside the one document, with a name and an address. The header and footer are shared by every page.
- **Where in the app:** Left rail, "Pages" tab (`PagesPanel`): page list with move up / move down / delete buttons, "Add a page" (dialog "Add a page" with "Page name", "Address", and "Start with": Empty / Paste code / Detail page / Copy of ...), and the current page's settings (`PageSettings`: "Page name", "Page address", "Show in the top bar / side menu"). A box can also get "Click goes to" in the Actions tab (`GoToPageSection`).
- **Accepts (input):** A page name and an address (`/about`); for "Paste code" a pasted HTML string; for "Copy" an existing page id. Addresses are made unique by `uniquePath`. A site keeps at least one page (`deletePage` does nothing on the last one).
- **Produces (output / redirect):** In the model, a page is a body child with `data-fe-page`, `data-fe-path`, `data-fe-title` (and `data-fe-private`, `data-fe-menu`); other body children are the shared layout. Adding a page opens it (`openPage`). Preview and downloads use `pageDoc`; the .zip uses `allPagesForFiles` plus one file per page (`pageFileName`: `/` becomes `index.html`). The React download builds Layout + pages + router.
- **Needs:** No sign-in or network. "Private" pages depend on the page access settings (`conditionOf` in `model/conditions.ts`, not covered here). Sign-in pages entry points (`createAuthPages`, "Add sign-in pages") belong to another group.
- **How it works:**
  1. `PagesPanel` / `AddPageDialog` calls `actions/pageActions.ts` `createPage(page)` (or `makeSite`, `changePage`, `removePage`, `reorderPage`).
  2. These call `updateDoc(...)` (`actions/commit.ts`) with a pure op from `model/pageOps.ts`: `toSite`, `addPage`, `updatePage`, `deletePage`, `movePage`. One call is one undo step; typing in the name box is coalesced by key `page:<id>:<fields>`.
  3. `toSite` uses `splitLayout` (`model/pages.ts`) to keep header/footer outside and wrap the rest in a "Home" page at `/`. `addPage` builds the new page from a blank section, `parsePastedCode` (code) or `cloneSubtree` (copy).
  4. `openPage(id)` clears the selection and calls `useViewStore.getState().setPageId(id)` (`store/view.store.ts`, `pageId`; `resolvePage` falls back to the first page).
  5. The editor frame shows only that page: `viewCss` in `frame/editorSource.ts` writes `[data-fe-page]:not([...]) { display: none !important; }`.
  6. Preview: `export/SafePageFrame.tsx` runs `guardPage`, then `forVisitors(pageDoc(doc, pageId))`; a click on a link posts `tweakOpenPath` to the parent, which `matchPage` resolves to a page (`onOpenPage`).
  7. Download: `export/siteFiles.ts` uses `pageDoc(..., { fileLinks: true })` / `allPagesForFiles`; `linkToFiles` rewrites links and `data-fe-go` to page files, `withGoScript` adds a small click script.
- **Debug:** Files: `model/pages.ts`, `model/pageOps.ts`, `model/serialize/sitePages.ts`, `actions/pageActions.ts`, `sidebar/pages/*`, `frame/editorSource.ts` (`viewCss`), `export/SafePageFrame.tsx`, `export/siteFiles.ts`. Tests: `model/pages.test.ts`, `export/siteFiles.test.ts`, `export/react/siteProject.test.ts`; e2e `e2e/pages.mjs`. Inspect: `useViewStore.getState().pageId`; in devtools the page boxes carry `data-fe-page`.
  - Page edits look "lost" -> the other page is hidden by `viewCss`; check `pageId` in `view.store.ts` and that `openPage` ran.
  - Address changed to something else on save -> `uniquePath` made it unique among `listPages` paths.
  - Last page cannot be deleted -> by design in `deletePage` (the delete button is also disabled when `count <= 1`).
  - Downloaded link goes nowhere -> `linkToFiles` only rewrites addresses that `matchPage` finds; check the page paths in `listPages`.

### Routes with changing parts
- **What it does:** Lets a page address contain parts that change, like `/user/:id`, so one page can show a different item depending on the link.
- **Where in the app:** Pages tab -> "Add a page" -> "Start with: Detail page" (shown only when there is data) creates `/<item>/:id`. You can also type a `:name` part in "Page address" in the page settings.
- **Accepts (input):** A page path with segments `:name` (`^:[A-Za-z_]\w*$`). Real addresses like `/products/3` or `...?id=3`.
- **Produces (output / redirect):** Preview and the public view open the matching page with the values (`params`). In downloads a link to `/products/3` becomes `products-_id.html?id=3`. In the React download the path becomes `$id` for TanStack (`tanstackPath`) or `:id`, and links carry `data-fe-params` (`PARAMS_ATTR`).
- **Needs:** Nothing beyond Multi-page sites. A detail page also needs a data source.
- **How it works:**
  1. `AddPageDialog` (`sidebar/pages/AddPageDialog.tsx`), for "Detail page", takes `detailPath`, `detailTitle`, `detailPageHtml` from `model/detailPage.ts` and calls `createPage({ from: 'code', ... })`.
  2. `detailPageHtml` makes a record box (`data-fe-record`, `data-fe-row="?id"`) with a picture, title, number, long text and a "Back" link bound to fields.
  3. `matchPage(pages, path)` (`model/routes.ts`): the exact address first, then `matchPath` on dynamic patterns; returns `{ page, params }`.
  4. Preview: `SafePageFrame` `onMessage` -> `matchPage` -> `onOpenPage(id, params)`; `PreviewOverlay` stores `params` and passes them to `forVisitors(doc, viewer, params)` -> `expandRecords(doc, params)`.
  5. Download: `linkToFiles` (`sitePages.ts`) calls `fileFor`, which leaves templates alone (`isDynamicPath`) and writes `fileSafePath(...)?id=3` for real values; `recordPlayer.ts` reads `?id` in the browser.
  6. `fillPath(pattern, row)` is used by `resolveBinding` to turn a bound `/product/:id` into `/product/3` on each card.
- **Debug:** Files: `model/routes.ts`, `model/detailPage.ts`, `model/serialize/sitePages.ts`, `export/SafePageFrame.tsx`, `export/react/jsxExtras.ts`, `export/react/routerTemplates.ts`. Tests: `model/routes.test.ts`, `export/react/dynamicRoutes.test.ts`, `export/react/cardClick.test.ts`; e2e `e2e/dynamic-routes.mjs`. Inspect: the iframe `srcdoc` of the Preview, and `location.search` in a downloaded page.
  - Detail page always shows the first item -> the row has no `id` field, or `?id` is missing; `pickRow` and `recordPlayer` fall back to the first row.
  - Card link not rewritten -> the address still contains `:`; templates are only filled after data is expanded.
  - Page not found for `/products/3` -> pattern segment count differs (`matchPath` needs equal lengths).
  - ":" in a downloaded file name -> use `fileSafePath` (it writes `_id`).

### Data sources
- **What it does:** Keeps named sets of typed rows (products, posts, people) in the document, with sample rows, so boxes can show them.
- **Where in the app:** Left rail, "Data" tab (`DataPanel`): list of sources, "Start from" drop-down with "Add data", then the source settings (`DataSourceSettings`: "Name (used in code)", "Edit fields and rows"). The dialog "Data: <name>" (`DataTableDialog`) edits fields and rows.
- **Accepts (input):** A preset label from `DATA_PRESETS` (Products, "Store products (Fake Store API)", "Categories (for filters)", Blog posts, Team members, Reviews, Events, Empty), field names, field kinds (`FieldType`: `text`, `longText`, `number`, `boolean`, `image`, `date`, `url`) and cell values.
- **Produces (output / redirect):** `PageDoc.data: DataSource[]` (`{ id, name, fields, rows, api? }`). Names are made code-safe (`codeName`) and unique. The frame gets a `data` message; the React download gets types, mock data and per-source hooks (`export/react/dataTemplates.ts`).
- **Needs:** Nothing (no network). Real API is the Connect your API feature.
- **How it works:**
  1. `DataPanel` `add` calls `actions/dataActions.ts` `createSource(start, preset)`.
  2. `createSource` runs `updateDoc` with `addSource` (`model/data.ts`), then `track('data_add')`.
  3. Edits go through `renameSource`, `newField`, `editField`, `deleteField`, `newRow`, `deleteRow`, `editCell`, each an `updateDoc` of a pure op in `model/data.ts` (`updateSource`, `addField`, `changeField`, `removeField`, `addRow`, `removeRow`, `setCell`).
  4. `changeField` and `setCell` keep rows in step with renames and type changes (`toFieldValue`, `emptyValue`).
  5. `frame/EditorFrame.tsx` sees `doc.data !== prev.data` and sends `bridge.send('data', { sources: dataForFrame(doc) })`; `frame/runtime/lists.js` `fe.handlers.data` stores them and calls `fe.renderLists`.
  6. Preview and downloads use `doc.data` directly in `expandDataLists` / `expandRecords`.
- **Debug:** Files: `model/data.ts`, `model/dataPresets.ts`, `actions/dataActions.ts`, `sidebar/data/DataPanel.tsx`, `sidebar/data/DataTableDialog.tsx`, `frame/editorSource.ts` (`dataForFrame`), `export/react/dataTemplates.ts`. Tests: `model/data.test.ts`, `export/react/dataFiles.test.ts`; e2e `e2e/data.mjs`. Inspect: `useDocStore.getState().doc.data`; the `fe-model` JSON script inside the editor frame (it includes `data`).
  - Name changed after typing -> `addSource`/`updateSource` run `codeName` and `unique`.
  - Boxes empty after delete -> expected; the delete confirm says so.
  - Typed "12" shows 0 -> the field kind is not `number`, or `toFieldValue` got a non-number string.
  - Frame shows old rows -> the `data` message is only sent when `doc.data` reference changes; check `EditorFrame.tsx`.

### Import JSON into data
- **What it does:** Fills a data source from pasted JSON (an API answer or an export): every item becomes a row and every key a field with a guessed kind.
- **Where in the app:** Data tab -> "Edit fields and rows" -> "Import from JSON" (`JsonImport`): "Choose a .json file" or paste in "JSON to import"; buttons "Import", or "Add to the rows I have" / "Replace everything" when rows exist, and "Cancel".
- **Accepts (input):** JSON text or a `.json` file (drop or choose). An array of objects, or an object holding one (found up to depth 3, the biggest list wins), or a single object. At most 500 rows (`MAX_ROWS`).
- **Produces (output / redirect):** Replaces or extends the source's `fields` and `rows`. The panel shows "Found N items with M fields" and notes; errors appear as alerts: "This is not valid JSON...", "No list of items found...", "Choose a .json file.". Nested objects become `parentChild` fields; lists of words become "a, b"; lists of objects are left out (note shown).
- **Needs:** An existing data source. No network.
- **How it works:**
  1. `JsonImport` calls `parseJsonData(text)` (`model/dataImport.ts`) in a `useMemo`.
  2. `parseJsonData` does `JSON.parse`, then `parseJsonValue(json)`.
  3. `parseJsonValue` uses `findListAt` for the list, `flatten` for nesting, `kindOf` to guess `FieldType` (image keys and URLs, dates, long text) and `coerce` for values; it records `from` (place in the answer) and `listPath`.
  4. Buttons call `actions/dataActions.ts` `importJson(id, result, mode)`.
  5. `importJson` runs `updateDoc` with `importData(doc, id, parsed, mode)` ('replace' swaps, 'add' merges and fills gaps with `emptyValue`), then `track('data_import')`.
  6. The same `parseJsonValue` is used by Connect your API, so both give the same fields.
- **Debug:** Files: `model/dataImport.ts`, `sidebar/data/JsonImport.tsx`, `actions/dataActions.ts`. Tests: `model/dataImport.test.ts`; e2e `e2e/data-import.mjs`. Inspect: the "Found ..." status text in the dialog.
  - "No list of items found" -> the top level is not an array of objects (or too deep, `depth > 3`).
  - A field has the wrong kind -> `kindOf` guessed from the values; change the kind in the Fields rows.
  - Only 500 rows kept -> `MAX_ROWS`, a note says so.
  - Field names differ from the JSON keys -> `codeName` rewrites keys (for example `"first name"` to `firstName`); `from` keeps the original place.

### Connect your API
- **What it does:** Points a data source at a real web address that returns JSON, tests it from the editor, and remembers the settings so the React download can load live data.
- **Where in the app:** Data tab -> select a source -> "Connect your API" (or "Change or test the connection") opens "Connect “<name>” to your API" (`ApiConnectDialog`). The "More options" fold in the source settings has "API address", "List is at", "Page parameter", "Page size parameter".
- **Accepts (input):** "Address for the list" (http/https GET), optional "Address for one item (optional)" with `:id`, "Try the one-item address with id", a switch "This API needs a key" with "Header the key goes in", "Written before the key", "Name of the setting that holds your key" (default `VITE_API_KEY`) and "Your key (only for this test)". Type `DataApi` in `model/types.ts`: `url`, `itemUrl`, `itemPath`, `listPath`, `pageParam`, `pageSizeParam`, `auth { header, prefix, envVar }`.
- **Produces (output / redirect):** A GET request from the editor (12 second timeout). On success the dialog lists fields found; "Use these N items" stores `source.api` and replaces fields and rows with the test result. Errors are plain sentences (`explainStatus`, `checkAddress`, "Couldn't reach it from here ... (CORS)"). The key is never stored. The React download writes `src/api/*` hooks, `.env.example` and reads the key from `import.meta.env.<envVar>`.
- **Needs:** Network and an API that allows browser requests (CORS) for the test. In the download: set `VITE_USE_MOCK=false` in `.env` (and `VITE_API_URL` for addresses starting with "/"). Keys sent to the browser are visible to visitors (the dialog says so).
- **How it works:**
  1. `ApiConnectDialog.test()` calls `testApi(url, auth, key)` (`model/apiTest.ts`): `checkAddress`, `fetch` with `Accept: application/json` and `authHeaders`, abort after `TIMEOUT_MS`.
  2. The answer goes through `parseJsonValue` (same path as pasted JSON).
  3. If an item address is set, `testItem` checks `hasToken`, builds the address with `fillAddress`, tests it and finds the wrapper with `itemPathOf`; `missingIn` lists fields absent from the item answer.
  4. If the list address itself contains `:id`, the dialog offers "Use it as the address for one item".
  5. "Use these" calls `connectApi(id, api, parsed)` (`actions/dataActions.ts`): `updateDoc(importData(updateSource(doc, id, { api }), id, parsed, 'replace'))`.
  6. Export: `export/react/dataTemplates.ts` `sourceFile` writes `ADDRESS`, `LIST_PATH`, `HEADERS`, `fetch<Name>` (paging via `pageParam` / `pageSizeParam`, else it fetches all and slices), `fetch<Name>Item`, and the hooks; `export/react/itemAddress.ts` `itemParts` splits the item address around `:id`.
- **Debug:** Files: `model/apiTest.ts`, `sidebar/data/ApiConnectDialog.tsx`, `sidebar/data/DataSourceSettings.tsx`, `actions/dataActions.ts`, `export/react/dataTemplates.ts`, `export/react/itemAddress.ts`. Tests: `model/apiTest.test.ts`, `model/itemAddress.test.ts`, `export/react/connectApiExport.test.ts`; e2e `e2e/connect-api.mjs`, `e2e/api-item-address.mjs`. Inspect: the Network tab (request headers, CORS errors); in a download `.env`.
  - "Couldn't reach it from here" -> CORS or wrong address in the editor test; the exported site may still work on an allowed origin.
  - 401/403 text -> key, header name or prefix is wrong (`authHeaders`); the prefix needs its trailing space.
  - Live data not shown in the download -> `VITE_USE_MOCK` is not `false`, or the env var name differs from `auth.envVar`.
  - Detail page loads everything -> no `itemUrl` set; with it, `use<Name>Record` calls `fetch<Name>Item`.
  - Fields empty on detail page -> one-item answer has a different shape (`itemPath`); the dialog lists `missing`.

### List from data
- **What it does:** Repeats one card design for every row of a data source, with bound words and pictures. Visitors can get the rows a page at a time or all at once.
- **Where in the app:** Left rail "Add" tab -> "Ready-made" fold -> "List from data". Then select the box and open the inspector's "Actions" tab -> "Data" section: "Shows", "Show: Every item", "Per page", "More cards: On scroll / Show all".
- **Accepts (input):** A box with `data-fe-list="<source>"`, `data-fe-page-size` (1-100 by `listInfo`, default 6; the slider goes 1-48) and `data-fe-load` (`scroll` or `all`). Its first element child is the card design. Bound parts use `data-fe-bind` (text) and `data-fe-bind-<attr>`.
- **Produces (output / redirect):** In the editor, live copies of the card design (`data-fe-clone`) for the first page of rows (or all rows when "Show all"). In Preview and downloads, `expandDataLists` writes one real card per row (all rows, not paged). In the React download, a list component using `use<Name>Infinite` and `InfiniteScroll` (scroll), or `use<Name>` (all).
- **Needs:** A data source; the block adds the Products preset when there is none. Live paging in a download needs the API paging settings from Connect your API.
- **How it works:**
  1. `sidebar/ReadyBlocks.tsx` `addDataList` calls `createSource` if needed, then `insertHtml(listBoxHtml(source))` (`model/dataLists.ts`, uses `cardHtml`).
  2. The DataSection controls call `wireData` (`actions/dataWiring.ts`) with `wiringAttrs`, and `setAttribute(PAGE_SIZE_ATTR / LOAD_ATTR)`.
  3. `connectFields` -> `autoWire` (`model/dataRecords.ts`) binds pictures and text by field kind ("Fill in the fields for me").
  4. Editor frame: `frame/runtime/lists.js` `fe.renderLists` clones the design, `fill`s attributes, honoring page size and `all`; data comes from the `data` message.
  5. Preview/download: `forVisitors` -> `expandDataLists` (`model/serialize/expandLists.ts`) -> `listInfo`, `rowsFor`, `cloneSubtree`, `fillCard`.
  6. React: `export/react/listTemplates.ts` builds the list and card components.
- **Debug:** Files: `model/dataLists.ts`, `model/serialize/expandLists.ts`, `frame/runtime/lists.js`, `inspector/sections/DataSection.tsx`, `sidebar/ReadyBlocks.tsx`, `export/react/listTemplates.ts`. Tests: `model/dataLists.test.ts`, `export/react/listExport.test.ts`; e2e `e2e/data-list.mjs`. Inspect: elements with `data-fe-clone` in the editor frame; the `fe-model` JSON.
  - Only the design card shows -> the list has no rows, or the source name in `data-fe-list` does not match a source (`expandDataLists` keeps the design).
  - Only some cards in the editor -> page size; set "More cards" to "Show all". The editor does not load more on scroll.
  - Preview shows every row although "Per page" is 6 -> static output is not paged (`rowsFor` returns all rows).
  - Clicking a clone selects the design -> by design: copies carry the design's `data-fe-id`.

### Table from data
- **What it does:** A table with one row for every item of a data source, with sortable headings.
- **Where in the app:** "Add" tab -> "Tables, search and filters" group -> "Table from data". Selecting it shows the table settings (`inspector/widgets/TablePanel.tsx`).
- **Accepts (input):** The first data source (up to 5 columns, long-text fields left out). Rows box is a `tbody` with `data-fe-list`, `data-fe-page-size="50"`, `data-fe-load="all"`.
- **Produces (output / redirect):** A `<table data-ui="table">` with header cells and a `tbody` that is a data list. Images become small pictures. Page CSS for the table is added once (`addWidgetCss`). The block is one undo step.
- **Needs:** A data source (Products preset added when none). Table behavior (sorting) comes from `model/widgets/runtime/table.js`.
- **How it works:**
  1. `WidgetBlocks.tsx` calls `actions/widgetActions.ts` `insertWidget(block)` for block `table-data` (`needsData: true`, in `model/widgets/registry.ts`).
  2. `insertWidget` creates a source if missing, then `block.html({ source })` which is `dataTableHtml(source)` (`model/widgets/blocksTable.ts`).
  3. `htmlToChildNodes` turns the HTML into nodes; `insertSubtree` and `addWidgetCss` are applied in one `updateDoc`.
  4. Rows are rendered like a list: editor `lists.js`, static `expandDataLists`, React `listTemplates.ts`.
  5. Sorting runs from `widgetPlayer.ts` / `runtime/table.js` for visitors.
- **Debug:** Files: `model/widgets/blocksTable.ts`, `model/widgets/registry.ts`, `actions/widgetActions.ts`, `model/widgets/runtime/table.js`. Tests: `model/widgets/widgets.test.ts`, `model/dataLists.test.ts`; e2e `e2e/widgets-data.mjs`. Inspect: the `tbody` attributes `data-fe-list`, `data-fe-load`.
  - Only one sample row -> source has no rows, or the `tbody` list name does not match.
  - A column is missing -> only the first 5 non-long-text fields are used.
  - Search finds only some rows -> table `tbody` is `all` by default; if changed to scroll, unseen rows are not searchable.
  - Styles missing -> `addWidgetCss` marks CSS per kind; check the `/* tweak-ui ... */` blocks in the page CSS.

### One item / records on boxes
- **What it does:** Makes any box show one row of a data source (the first, the Nth, or the one named in the page link, `?id=3`).
- **Where in the app:** Select a box -> inspector "Actions" tab -> "Data" section: "Shows", "Show: One item", and "Which one" ("The first one", "One by number", "The one in the link"; pop-ups also get "The card that opened it"), "Item number", "Link uses".
- **Accepts (input):** `data-fe-record="<source>"` with `data-fe-row` = `first`, a number, `?<name>` or `clicked` (`RowChoice` in `model/dataRecords.ts`).
- **Produces (output / redirect):** The box's bound text, pictures and addresses are filled with that row's values in Preview and downloads. For `?id` boxes a small script (`recordPlayer.ts`) picks the row from the address. The React download writes a record component and a `use<Name>Record` hook.
- **Needs:** A data source whose rows have an `id` field for `?id` boxes (matching is `String(row.id)`).
- **How it works:**
  1. `DataSection` -> `wireData(id, 'record', source, row)` -> `wiringAttrs` -> `setAttributes`.
  2. `recordInfo` reads the box; `rowChoiceOf` / `rowChoiceAttr` convert the attribute.
  3. Static fill: `forVisitors` -> `expandRecords(doc, params)` -> `pickRow` -> `fillCard(nodes, box.id, row, keepTemplates)`.
  4. `resolveBinding(spec, row)` returns the value, or `fillPath` when the binding starts with "/".
  5. `withRecords` (`model/serialize/recordPlayer.ts`) embeds rows and, in the browser, uses `URLSearchParams(location.search).get(name)` and `FILL_JS` (`fillRow.ts`) to fill the box.
  6. React: `export/react/records/recordTemplates.ts` and `dataTemplates.ts` (`use<Name>Record`).
- **Debug:** Files: `model/dataRecords.ts`, `model/serialize/expandLists.ts`, `model/serialize/recordPlayer.ts`, `model/serialize/fillRow.ts`, `inspector/sections/DataSection.tsx`, `export/react/records/recordTemplates.ts`. Tests: `model/dataRecords.test.ts`, `export/react/records/recordExport.test.ts`; e2e `e2e/data-wire.mjs`, `e2e/components-data.mjs`. Inspect: `data-fe-record` / `data-fe-row` attributes in Layers or the Code tab.
  - Always the first item -> no matching `id`, or no `?id` in the link (`pickRow` falls back to rows[0]).
  - Editor canvas shows placeholders, not values -> the editor frame only repeats lists; records show real values in Preview and downloads (the panel says so).
  - Values wrong after changing a field name -> rebind the part in "Show these from ...".
  - Keep `resolveBinding`, `lists.js` and `fillRow.ts` in step (note in `fillRow.ts`).

### Data wiring to boxes
- **What it does:** Connects the words and pictures inside a data box (list card or record) to fields of the source.
- **Where in the app:** Select a box -> "Actions" tab -> "Data" section lists "Show these from “<source>”" with a drop-down per part; "Fill in the fields for me" button. Select a part inside the box -> "Show data" section (`ShowDataSection`): "Text", "Picture", "Description", "Goes to".
- **Accepts (input):** Field choices; attributes `data-fe-bind` (text) and `data-fe-bind-<attr>` (for example `-src`, `-alt`, `-href`). A value starting with "/" is an address template like `/product/:id`. Field kinds offered per part come from `fieldTypesFor`.
- **Produces (output / redirect):** Attribute changes on parts (one undo step per change; "Fill in the fields for me" is one step for all). Real values appear in the editor's lists, Preview and downloads.
- **Needs:** The part must be inside a data box (`dataAround`); `bindableParts` only offers pictures and short text.
- **How it works:**
  1. `Inspector.tsx` shows `DataSection` always (Actions tab) and `ShowDataSection` when `dataAround(...)` finds a box.
  2. `FieldMap.tsx` `partRows` creates the selects; links also offer dynamic pages (`isDynamicPath`) as "Page “<title>” (/path/:id)".
  3. A choice calls `setAttribute(part.id, attr, field)` (`actions/nodeActions.ts`).
  4. "Fill in the fields for me" calls `connectFields(boxId, sourceName)` (`actions/dataWiring.ts`) -> `updateNodes(autoWire(...))`.
  5. `bindingsOf(node)` reads bindings for lists (`lists.js`), static fill (`fillCard`), and React export.
- **Debug:** Files: `inspector/sections/DataSection.tsx`, `inspector/sections/ShowDataSection.tsx`, `inspector/sections/FieldMap.tsx`, `actions/dataWiring.ts`, `model/dataRecords.ts` (`bindableParts`, `autoWire`, `fieldTypesFor`), `model/dataLists.ts` (`bindingsOf`). Tests: `model/dataRecords.test.ts`, `model/dataLists.test.ts`; e2e `e2e/data-wire.mjs`, `e2e/data-list.mjs`.
  - A part is not offered -> it has non-inline children or no text (`bindableParts`).
  - A picture field is not offered for `src` -> only `image` and `url` kinds fit (`fieldTypesFor`).
  - Binding does nothing -> the field name no longer exists after a rename in the Data panel.
  - "Fill in the fields for me" button missing -> no bindable parts in the box.

### Cards that go to a page or open a pop-up with the clicked item
- **What it does:** Clicking a card in a list can open a page (a detail page opens the card's own item), open a pop-up showing the card's item, or call your code (React download).
- **Where in the app:** Select the list box -> "Actions" tab -> "Data" section -> "On click" (`CardClick`): Nothing / Open a page / Open a pop-up / Run my code, with "Page", "Pop-up" or "Code name". The pop-up box itself has "Which one: The card that opened it".
- **Accepts (input):** On the card design: `data-fe-go` (a page path, may contain `:id`), `data-fe-open` (pop-up name) or `data-fe-call` (function name). The pop-up is a record box `data-fe-row="clicked"` with `data-fe-modal`. Pop-ups must already exist (the option says "add one first").
- **Produces (output / redirect):** Page: each card's `data-fe-go` is filled from its row (`/store-product/3`), the click navigates. Pop-up: the clicked card's item fills the pop-up before it opens. Code: the React download calls `<name>(item)` (written in `src/data/handlers.ts`); Preview does not run it.
- **Needs:** A list; Pages (for page) or a pop-up (see popups, another group). A detail page needs data with the fields named in the path (the panel warns when missing).
- **How it works:**
  1. `CardClick.choose` sets `GO_ATTR`, `OPEN_ATTR` or `CALL_ATTR` with `setAttributes`; pop-up goes via `cardOpensPopup` (`actions/popupActions.ts`), which also sets `data-fe-record` and `data-fe-row="clicked"` on the pop-up.
  2. `expandDataLists` marks each card `data-fe-item` (index) and `data-fe-from` (source) when a card opens a pop-up; `fillCard` resolves `data-fe-go` templates with `resolveBinding`.
  3. `expandRecords` fills "clicked" pop-ups with the first row and `keepTemplates` (the address templates are kept in `data-fe-bind-data-fe-go`).
  4. `withClickedRows` (`model/serialize/clickedPlayer.ts`) embeds the rows and adds a capture-phase click listener that finds the card (`data-fe-item`), picks the row and runs `fill` from `fillRow.ts` on the pop-up.
  5. The ordinary pop-up player (`withPopups`) then opens it.
  6. React: `openModal(name, row)` and `useModalRow()` (`export/react/popups/uiTemplates.ts`); `recordTemplates.ts` reads `useModalRow()` for `clicked`; `listTemplates.ts` passes `cardRow`.
- **Debug:** Files: `inspector/sections/CardClick.tsx`, `actions/popupActions.ts`, `model/serialize/clickedPlayer.ts`, `model/serialize/fillRow.ts`, `model/serialize/expandLists.ts`, `model/dataLists.ts` (`ITEM_ATTR`, `FROM_ATTR`). Tests: `model/serialize/clickedPlayer.test.ts`, `export/react/cardClick.test.ts`, `export/react/popups/popupExport.test.ts`; e2e `e2e/card-popup.mjs`, `e2e/dynamic-routes.mjs`. Inspect: `data-fe-item` / `data-fe-from` on cards in the Preview iframe.
  - Pop-up shows first item -> card was not marked (`data-fe-item` missing) or the pop-up's `data-fe-record` differs from the list's source.
  - Card opens the wrong page -> the path has `:id` but rows lack `id`, or a wrong page is chosen in "Page".
  - Pop-up link keeps `:id` -> binding of the link is a template; filled by `fill` when the card opens it.
  - "Run my code" does nothing in Preview -> by design (React download only).

### Search bar and filters wired to lists and tables
- **What it does:** A search bar and filters (buttons, drop-down, tick boxes) hide the cards or rows that do not match. Filter choices can be the field's real values or come from another data source (such as categories).
- **Where in the app:** "Add" tab -> "Tables, search and filters": "Search bar", "Filter buttons", "Filter drop-down", "Filter tick boxes". Select one -> widget settings (`ConnectPanel`): "Works on", and for filters "Filter by", "Choices from", "Show".
- **Accepts (input):** Targets: a table (`data-ui="table"`) or a data list outside a filter. They carry `data-ui-filterable="<name>"`; widgets carry `data-ui-for="<name>"`, optional `data-ui-by="<field>"` and `data-ui-choices="<source>.<field>"`. Fields offered exclude pictures and long text (`filterFields`).
- **Produces (output / redirect):** Items get `hidden` when they do not match (text match, or attribute match when `data-ui-by` is set, then each item design gets `data-fe-bind-data-<field>`). Empty note and counter use `data-ui-empty-for`, `data-ui-count-for`. Choices from another source become a live `data-fe-list` inside the filter. A toast "Add a list or a table first, then connect this in its settings." appears when none exists.
- **Needs:** A list or table on the page; for field matching and choices, data sources. Lists should be "Show all" so every item can be found.
- **How it works:**
  1. `insertWidget` (`actions/widgetActions.ts`) finds the first target with `filterTargets(nodes)` and names it with `nameTarget`; the block HTML takes the name (`searchHtml`, `filterChipsHtml`, ...).
  2. `ConnectPanel.connect` -> `pointAt(nodes, widgetId, name)` (`model/widgets/connect.ts`) sets `data-ui-for` (and the "clear" buttons).
  3. "Filter by" / "Choices from" call `filterByField(doc, widgetId, field, choices)` (`model/widgets/filterData.ts`): `targetBox`, sets `data-ui-by` / `data-ui-choices`, adds the design's `data-fe-bind-data-<field>`, and rebuilds the choices with `INNER` (`fieldValues`) or `LIVE` (`chipsLiveInner`, `checksLiveInner`).
  4. In the browser (editor and downloads) `model/widgets/runtime/filter.js` `applyFilters(name)` reads the search text and active filters and sets `item.hidden`.
  5. React: `export/react/widgetFiles.ts` ships the same runtime as `src/widgets.ts`; live choice lists are filled by the list code.
- **Debug:** Files: `model/widgets/connect.ts`, `model/widgets/filterData.ts`, `model/widgets/blocksTable.ts`, `model/widgets/runtime/filter.js`, `inspector/widgets/ConnectPanel.tsx`, `actions/widgetActions.ts`. Tests: `model/widgets/widgets.test.ts`, `model/widgets/widgetEdit.test.ts`; e2e `e2e/widgets-data.mjs`, `e2e/widgets-choices.mjs`. Inspect: `data-ui-filterable` on the target and `data-ui-for` / `data-ui-by` / `data-ui-choices` on the widget.
  - Nothing is filtered -> names differ (`data-ui-for` vs `data-ui-filterable`) or "Works on" is "Not connected".
  - Some items never match -> the list shows one page only (editor) or not "Show all".
  - Filter by a field does nothing -> the item design lacks `data-fe-bind-data-<field>`; run "Filter by" again.
  - Choices stale in a drop-down -> a drop-down copies values when chosen (the panel help says so); buttons and tick boxes stay live.
  - A list inside a filter is not offered as a target -> `isTarget` ignores lists inside `data-ui="filter"`.

## Interaction and access

Features in this group:

- Pop-ups
- Ask first
- When clicked -> Flag
- When clicked -> Update data
- Click goes to a page
- Forms
- Sign-in pages
- Who can see this / Viewing as
- Page guard and private pages
- Sign-in in the React download
- Ready-made widgets

Shared background. All of these are plain attributes on the page model's elements (`data-fe-*` for editor behaviour, `data-ui-*` for widgets). Nothing here is behind a flag in `src/config/features.config.ts` (the flags there are `enable_oauth`, `enable_gallery`, `enable_uploads`, `enable_billing`, `enable_marketplace`, none of which these features use). Visitors (Preview, public view, `.html` downloads) get behaviour from player scripts that `serialize/forVisitors.ts` `forVisitors()` appends to `doc.scripts` (`withPopups`, `withForms`, `withFlagClicks`, `withUpdateClicks`, `withWidgets`). The React download gets the same behaviour as real code from `src/features/export/react/`. The inspector shows most click settings on the **Actions** tab of the settings panel (`inspector/Inspector.tsx`, `tab === 'actions'`). Every setter is one undo step.

### Pop-ups
- **What it does:** Turns a box into a pop-up that sits over the page. Buttons and links open it by name, and visitors close it with a close button, the Esc key, or a click outside.
- **Where in the app:** Left panel **Add** tab -> **Ready-made** fold -> **Pop-up** (adds a button and a pop-up box). Select the pop-up box -> settings **Actions** tab -> **Pop-up** section (field **Name**). Select a button -> **Actions** -> **When clicked** -> **Opens** (the "Opens pop-up" control). Inside a pop-up, **When clicked** also shows a **Closes the pop-up** switch.
- **Accepts (input):** Attributes `data-fe-modal="name"` on the box, `data-fe-open="name"` on an opener, `data-fe-close` on a closer (`MODAL_ATTR`, `OPEN_ATTR`, `CLOSE_ATTR` in `model/popups.ts`). Names are made code-safe and unique by `uniquePopupName`. A data card can also open a pop-up with its own row (`cardOpensPopup` in `actions/popupActions.ts`).
- **Produces (output / redirect):** Editor: the pop-up stays a normal visible box while editing. Visitors: it is hidden at load, then shown fixed and centred (`role="dialog"`, `aria-modal`), with focus moved in and back out. React download: `<Modal name="...">` plus `src/components/ui/popup.ts` (`openModal`, `closeModal`, `useOpenModal`, `useModalRow`) and `src/components/ui/Modal.tsx`. No network calls, no toasts. Analytics event `popup_set` with `kind: 'open'`.
- **Needs:** Nothing: no sign-in, no network, no setting. React output needs only React (Modal uses `createPortal`).
- **How it works:**
  1. `sidebar/ReadyBlocks.tsx` "Pop-up" calls `insertHtml(popupBlockHtml(uniquePopupName(...)))` from `model/popups.ts`.
  2. In the inspector, `ClickSection` calls `setOpens` / `setCloses`, and `PopupSection` calls `renamePopup` (all in `actions/popupActions.ts`, which go through `setAttribute(s)` / `updateNodes` and commit to `doc.store`). `renamePopup` also rewrites every opener in the same step.
  3. Preview and downloads: `forVisitors` -> `withPopups` (`serialize/popupPlayer.ts`) adds `POPUP_SCRIPT` when `popupUse(nodes).modal` is true.
  4. `POPUP_SCRIPT` hides every `[data-fe-modal]`, and one delegated click handler calls its `open(name)` / `close()`; Esc and a click on the backdrop also close.
  5. React: `jsxPopups.ts` `modalNode` turns the box into `Modal`; `clickAttrs` writes `onClick={() => openModal("name")}` and records `openModal` in `ctx.show.ui`; `uiImports` writes the import; `uiTemplates.ts` `popupFiles(nodes)` adds the ui files when `popupUse` says so.
- **Debug:**
  - Files: `model/popups.ts`, `actions/popupActions.ts`, `inspector/sections/ClickSection.tsx`, `serialize/popupPlayer.ts`, `export/react/popups/jsxPopups.ts`, `export/react/popups/uiTemplates.ts`.
  - Tests: `serialize/popupPlayer.test.ts` (hide, open, three ways to close), `export/react/popups/popupExport.test.ts`, `export/react/popups/layoutExport.test.ts`, `serialize/clickedPlayer.test.ts` (cards that open pop-ups). E2E: `e2e/popups.mjs`, `e2e/card-popup.mjs`.
  - Inspect: in the frame, `document.querySelectorAll('[data-fe-modal]')`; in a downloaded `.html`, look for the `POPUP_SCRIPT` block at the end of `<body>`.
  - Symptom -> cause: button does nothing in Preview -> `data-fe-open` name differs from `data-fe-modal` (a rename outside `renamePopup`), so `open()` finds no element. Pop-up visible in Preview at load -> player not added because `popupUse` found no opener/pop-up attribute, or the script was removed. "Opens pop-up" control missing -> `popupsOf(nodes)` is empty, so no box has `data-fe-modal`. React build fails on an unused import -> the helper was not recorded in `ctx.show.ui` (the `POPUP_HELPERS` filter in `uiImports` exists because strict TypeScript flags unused imports).

### Ask first
- **What it does:** Makes a button or link ask "Are you sure?" and only carry on when the visitor says Yes.
- **Where in the app:** **Add** tab -> **Ready-made** -> **Ask first** (a red Delete button). Or select any button/link -> **Actions** tab -> **When clicked** -> **Ask first** (text box, label "Ask first question"; empty means no question).
- **Accepts (input):** `data-fe-ask="Your question"` (`ASK_ATTR`) on any clickable element. Any text.
- **Produces (output / redirect):** A small dialog with Cancel and Yes. On Yes the original click goes through (link, form submit, pop-up open, flag, update). On Cancel, Esc or a click outside, nothing happens. React: `src/components/ui/confirm.tsx` exports `askFirst` and `ConfirmHost` (mounted once in `main.tsx`). Analytics `popup_set` with `kind: 'ask'`.
- **Needs:** No sign-in, network or setting. In React, `mainTemplate` mounts the host when `confirm: popupUse(doc.nodes).ask`.
- **How it works:**
  1. `ReadyBlocks.tsx` inserts `askButtonHtml`; or `ClickSection` calls `setAsk(id, message)` in `actions/popupActions.ts`.
  2. `forVisitors` -> `withPopups` adds `POPUP_SCRIPT` when `popupUse(nodes).ask` is true (the same script as Pop-ups).
  3. A capture-phase click listener finds `closest('[data-fe-ask]')`, calls `event.preventDefault()` and `stopImmediatePropagation()`, and shows the question with `ask(message)`.
  4. On Yes it sets `asking.__ok = true`, re-clicks the element, then clears the flag so the second click passes the listener.
  5. React: `jsxPopups.ts` `clickAttrs` writes `onClick={(event) => { event.preventDefault(); ... void askFirst("...").then((yes) => { if (yes) { ... } }) }}`.
  6. What runs after Yes is the element's other steps, or `nativeStep`: `window.location.assign(href)`, the router navigate, or `element.form?.requestSubmit()`. With nothing to run it writes a `/* do it here */` comment.
- **Debug:**
  - Files: `model/popups.ts`, `serialize/popupPlayer.ts`, `export/react/popups/jsxPopups.ts` (`clickAttrs`, `nativeStep`), `export/react/popups/uiTemplates.ts` (`CONFIRM`).
  - Tests: `serialize/popupPlayer.test.ts` ("asks before the click goes through"), `export/react/popups/popupExport.test.ts` ("asks first, then does the click"). E2E: `e2e/popups.mjs` (saves the question on the button).
  - Symptom -> cause: question never appears in Preview -> player missing (no element has a non-empty `data-fe-ask`; an empty string removes it). Click goes through without asking in React -> `ctx.show` was absent for that file, so `clickAttrs` skipped `ask`. After Yes nothing happens in React -> the element had no link, submit or other step, so only the `/* do it here */` placeholder was written. Dialog appears twice -> another script re-clicks the element without going through the `__ok` guard.

### When clicked -> Flag
- **What it does:** Lets a click turn a named feature switch ("flag") on, off or over for that visitor. Boxes set to "Only when these flags are on" then appear or disappear straight away.
- **Where in the app:** Select a button or link -> **Actions** tab -> **When clicked** -> **Flag** (control "Flag to change") and **Then** (Turn it on / Turn it off / Switch it). Flags are first added under **Who can see this** (field "New flag").
- **Accepts (input):** `data-fe-flag="name"` and `data-fe-flag-mode="on|off|toggle"` (`FLAG_ATTR`, `FLAG_MODE_ATTR`, `FLAG_MODES` in `model/flagClicks.ts`). A missing or unknown mode reads as `toggle`. Flag names come from `accessOf(doc).flags` (`doc.access.flags`).
- **Produces (output / redirect):** The flag state changes and flag-dependent boxes show or hide. The choice is remembered in `localStorage` under the key `tweak:flags`. No redirect, no toast. React: `src/config/flags.ts` with `isOn`, `setFlag`, `useFlags`. Analytics `popup_set` with `kind: 'flag'`.
- **Needs:** The page must have at least one box with `data-fe-flags` for any visible effect. React: `.env` `VITE_FLAGS=beta,newCheckout` turns flags on for a build. The React store exists only when `needsAuth(doc)` is true, and a flag click makes that true (`needsAuth` checks `FLAG_ATTR`).
- **How it works:**
  1. `ClickSection` -> `setFlagClick(id, flag, mode)` in `actions/flagActions.ts` -> `setAttributes`.
  2. `forVisitors` -> inner `forViewer` keeps flag-dependent boxes when `usesFlagClicks(doc.nodes)` is true, treating every flag as on for the filter (`allFlags`).
  3. `withFlagClicks(doc, viewer)` (`serialize/flagPlayer.ts`) adds `flagScript(viewer.flags)`.
  4. The script reads `localStorage['tweak:flags']` (first visit: the viewer's own flags are on). A click on `[data-fe-flag]` updates the map, saves it, and `show()` toggles `style.display` of every `[data-fe-flags]` box.
  5. React: `jsxPopups.ts` `clickAttrs` writes `setFlag("beta", "toggle")` using `flagClickOf`. `<Show when={{ flags: [...] }}>` (`providerTemplates.ts` `SHOW`) calls `useFlags()` and `isOn(...)`. The route guards also use `isOn`.
  6. `auth/authFiles.ts` `flagsOf(doc)` lists every flag used, so `flags.ts` has an entry (default `false`) for each.
- **Debug:**
  - Files: `model/flagClicks.ts`, `actions/flagActions.ts`, `serialize/flagPlayer.ts`, `serialize/forVisitors.ts` (`forViewer`), `export/react/auth/providerTemplates.ts` (`flagsSource`, `SHOW`).
  - Tests: `serialize/flagPlayer.test.ts` (3 cases: kept boxes, click switches and remembers, starts on), `export/react/auth/authFiles.test.ts` (`config/flags.ts` has `"beta": false`), `export/react/popups/popupExport.test.ts` ("a click calls setFlag ... Show re-draws"). E2E: `e2e/click-flags.mjs`.
  - Inspect: `localStorage.getItem('tweak:flags')` in the frame or the app; in React DevTools check `flags.ts` state.
  - Symptom -> cause: box stays hidden after clicking in Preview -> the box has no `data-fe-flags` matching the clicked name, or an old `tweak:flags` value overrides the start state (clear the key). Box is missing from the `.html` entirely -> the page has no flag click, so `forViewer` removed it for a visitor without the flag. Flag works in Preview but not in React -> `flags.ts` is only written when `needsAuth` is true; check the name matches exactly. Flag resets on reload -> storage blocked; the code catches that and keeps the value only until the page closes.

### When clicked -> Update data
- **What it does:** Lets a click change one item in a connected real API, for example "liked = yes" or "stock minus 1", and show the new value on the card.
- **Where in the app:** Select a button -> **Actions** tab -> **When clicked** -> **Update data** (control "Data to update"), then **Which item** and the list of changes (`inspector/sections/UpdateDataControl.tsx`, `UpdateChanges.tsx`). Needs an API connected in the left **Data** tab (Connect API).
- **Accepts (input):** `data-fe-update` holding JSON `{ source, item: "clicked" | { id }, changes: [{ field, op: "set"|"toggle"|"add", value }] }` (`UPDATE_ATTR`, `UpdateClick` in `model/updateClicks.ts`). `updateClickOf` drops broken JSON and bad ops. Only sources with `api.url` can be chosen (`updatableSources`). On a chosen item (not "clicked") only `set` works.
- **Produces (output / redirect):** A `PATCH` to the item's address (`itemAddress`: `api.itemUrl`, else `<url>/:id`), with a JSON body where each value sits at the field's `from` path. Success updates the card text (the row is changed in memory and `fill(card, row)` runs). Failure shows the toast-like note "Your change could not be saved. Please try again." and leaves the card unchanged. React: `update<Source>Item(id, changes)` in the source's `src/api/<source>.ts`, then `queryClient.invalidateQueries`.
- **Needs:** A connected API data source, network, and CORS for `PATCH`. A key the API needs works only in the React download (the plain `.html` cannot hold it). In React, `VITE_USE_MOCK` not `"false"` patches the sample rows instead; `VITE_API_URL` sets the base URL.
- **How it works:**
  1. `UpdateDataControl` -> `setUpdateClick(id, click)` (`actions/updateActions.ts`) -> `setAttribute(id, UPDATE_ATTR, updateAttrValue(click))`.
  2. Preview/download: `forVisitors` -> `expandDataLists` marks cards with `data-fe-item` / `data-fe-from` so the click knows its row; `withUpdateClicks` (`serialize/updatePlayer.ts`) embeds each used source's address, field types and rows.
  3. The player's click handler parses the attribute, finds the card and row (or uses `item.id`), computes values like `changedValue`, builds the body, and calls `fetch(PATCH)`; `aria-busy` is set meanwhile.
  4. React: `jsxPopups.ts` `updateStep` writes `void updateProductsItem(row.id, { liked: !row.liked })` (toggle uses `!row.field`, add uses `Number(row.field) + n`) and records `update:<source>` so `uiImports` imports it.
  5. `export/react/dataUpdate.ts` `updateSource` writes the function (`coerce`, `toBody`, `api.patch` or mock edit) and `QUERY_CLIENT` provides the cache.
  6. Keep three places in step when the request shape changes: `updatePlayer`, `dataUpdate.updateSource`, `UpdateChanges` (from ARCHITECTURE).
- **Debug:**
  - Files: `model/updateClicks.ts`, `serialize/updatePlayer.ts`, `export/react/dataUpdate.ts`, `export/react/popups/jsxPopups.ts` (`updateStep`), `export/react/itemAddress.ts`.
  - Tests: `model/updateClicks.test.ts`, `serialize/updatePlayer.test.ts` (5 cases incl. refused request), `export/react/updateExport.test.ts`. E2E: `e2e/click-update-data.mjs` (stubs `https://api.example.test/**` and records PATCH calls).
  - Inspect: devtools Network tab for the `PATCH` URL and body; the button's `data-fe-update` value.
  - Symptom -> cause: click does nothing -> JSON failed `updateClickOf`, or the source name has no `itemAddress` (url contains `?` and no `itemUrl`), so the player has no data for it. "Could not be saved" note -> the API refused or CORS blocked the preflight. Change goes to the wrong item -> button is not inside a card whose `data-fe-from` equals the source. Nothing generated in React for a button outside a card with "clicked" -> `updateStep` returns `null` when `ctx.cardRow` is missing.

### Click goes to a page
- **What it does:** In a multi-page site, makes a whole box (a card, banner, picture) open another page when clicked, and turns normal links to pages into router links in React.
- **Where in the app:** Select a box (not a link) -> **Actions** tab -> **Click goes to** section (control "Click goes to page", options "Nothing (stays here)" plus each page). Only shown when the site has pages. For a link (`<a>`), the **Link** section has **Go to a page**. Data cards use **CardClick** (`inspector/sections/CardClick.tsx`).
- **Accepts (input):** `data-fe-go="/about"` (`GO_ATTR` in `model/pages.ts`) on any element; an address with a changing part like `/user/:id` is filled from the card's row. Links use plain `href="/about"`.
- **Produces (output / redirect):** Editor Preview: the frame asks its parent to show that page (`postMessage({ tweakOpenPath })`, `SafePageFrame` `onOpenPage`). `.html` site download: `data-fe-go` becomes a file name such as `about.html` and a small script sets `location.href`. React: `onClick={() => navigate("/about")}` (React Router) or `void navigate({ to: "/about" })` (TanStack), with `useNavigate` imported; clickable boxes also get `role="link"`, `tabIndex` and an Enter-key handler (`KEYS`).
- **Needs:** A site (`isMultiPage`: at least one `data-fe-page`). In React, a router choice (React Router or TanStack Router, `export/react/routerTemplates.ts`).
- **How it works:**
  1. `GoToPageSection` -> `setAttribute(node.id, GO_ATTR, path)`.
  2. `expandLists.ts` resolves `/user/:id` against the row for data cards.
  3. Preview: `SafePageFrame.tsx` injects `NAVIGATE` into the page; a click on `a[href^="/"]` or `[data-fe-go]` (not on an inner link/button/input) calls `e.preventDefault()` and posts the path to the parent, which finds the page and calls `onOpenPage`.
  4. Download: `serialize/sitePages.ts` `linkToFiles` swaps in file names (`fileFor`), and `withGoScript` adds `GO_SCRIPT` plus `cursor: pointer`.
  5. React: `jsxWriter.ts` `goTarget` builds the target; `jsxPopups.ts` `clickAttrs` writes `onClick` using `ctx.links.go`; `jsxExtras.ts` `asRouterLink` turns `<a href="/about">` into `<Link to="/about">`; `routerLinks.ts` `linkImport` and `navigateHook` write the import and the `const navigate = useNavigate()` line.
- **Debug:**
  - Files: `model/pages.ts`, `inspector/sections/GoToPageSection.tsx`, `export/SafePageFrame.tsx`, `serialize/sitePages.ts`, `export/react/routerLinks.ts`, `export/react/routerTemplates.ts`, `export/react/jsxWriter.ts`.
  - Tests: `export/react/siteProject.test.ts` ("turns links to pages into router links", "makes click goes to boxes navigate"), `export/react/cardClick.test.ts`, `serialize/clickedPlayer.test.ts`. E2E: `e2e/pages.mjs` (nav link and "Click goes to" box open their page in Preview).
  - Symptom -> cause: section missing -> the site has no pages (`pages.length === 0` returns null) or the element is an `<a>`. Clicking does nothing in Preview -> the path matches no page (`matchPage` fails). TypeScript error in TanStack output -> a dynamic target must be cast `as never` (`dynamicTarget`, `typed` flag). Click on an inner button also navigates -> the handlers skip `a, button, input, select, textarea, label`, so the inner element must be one of those.

### Forms
- **What it does:** Checks a form's answers in the visitor's browser (required, length, number range, format, "same as", own messages), then sends them as JSON to an address or just says thank you.
- **Where in the app:** **Add** tab -> **Ready-made** -> **Contact form** or **Sign-up form**. Select a form -> **Actions** tab -> **Form** section (switch "Check the answers and send them", **It will**, **Send to**, **Thank-you text**). Select an input -> **Input box** section (Hint text, Kind of answer, Field name, Must be filled in, Fewest/Most letters, Smallest/Largest, Must be the same as, Error message).
- **Accepts (input):** Plain HTML `<form>` with named inputs and the browser's rules (`required`, `minlength`, `maxlength`, `min`, `max`, `pattern`). Editor extras: `data-fe-match`, `data-fe-message` on fields; `data-fe-submit`, `data-fe-success` and `action` on the form (`model/forms.ts`). `fieldsOf(nodes, formId)` reads the fields; `formSettings(form)` reads the form (`action` counts only if it starts with `http(s)` or `/`).
- **Produces (output / redirect):** Preview/downloads: a failed check stops the send and shows the browser's messages; success on `send` with an address POSTs JSON and replaces the form with the thank-you text, or shows "Couldn't send. Please try again." and re-enables the button. React: one component per form (for example `GetInTouchForm`) using React Hook Form + Zod, with `src/components/form/` helpers and a POST through `api.post(ADDRESS, values)` (only when an address is set; otherwise a `console.info('Form answers', values)` placeholder). No redirect for `send`.
- **Needs:** Nothing for checking. Sending needs network and an address that accepts JSON `POST` (CORS). React adds dependencies `react-hook-form`, `@hookform/resolvers`, `zod` (`FORM_DEPS` in `forms/formKit.ts`) and `axios` when a form sends somewhere.
- **How it works:**
  1. Add block: `formBlocks.ts` `CONTACT_FORM_HTML` / `SIGN_UP_FORM_HTML` via `insertHtml`. `FormSection` `turn()` sets `data-fe-submit="send"`; `FormFieldSection` edits field attributes with `setAttribute(s)`.
  2. `forVisitors` -> `withForms` (`serialize/formPlayer.ts`) adds `FORM_SCRIPT` only when a `form` has `data-fe-submit`.
  3. The script listens on each `form[data-fe-submit]`: `checkMatches` sets custom validity for `data-fe-match`, `invalid` applies `data-fe-message`, `submit` calls `reportValidity()`, then `fetch(address, { method: 'POST', ... })` or `note(form, thanks)`.
  4. React: `forms/formTemplates.ts` `isCheckedForm` / `formComponents` find set-up forms with fields; `formFile` writes the component with `useForm({ resolver: zodResolver(schema) })`.
  5. `forms/zodSchema.ts` `schemaSource` turns each `FormField` into a Zod rule with plain-language messages; `forms/formJsx.ts` `formAttrs` adds `noValidate onSubmit={handleSubmit(onSubmit)}` and `register("name")`, and `withFormExtras` adds `<FieldError>`.
  6. `formProject(nodes)` adds the kit files and dependencies. `findRepeats` skips forms so they are never grouped as repeated items.
- **Debug:**
  - Files: `model/forms.ts`, `inspector/sections/FormSection.tsx`, `FormFieldSection.tsx`, `serialize/formPlayer.ts`, `export/react/forms/*`.
  - Tests: `model/forms.test.ts`, `serialize/formPlayer.test.ts` (stops a send, thanks, "same as", POSTs JSON), `export/react/forms/formExport.test.ts`. E2E: `e2e/forms.mjs`.
  - Inspect: the form's `data-fe-submit`; Network tab for the POST; in React the generated `<Name>Schema` constant.
  - Symptom -> cause: nothing is checked in Preview -> the switch is off, so no `data-fe-submit` and no player. Form sends but is plain JSX in React -> `isCheckedForm` is false (no fields or switch off). Radio group counted as several answers -> radios must share one `name` (grouped by name in `fieldsOf`). Unnamed field gets a code name -> `fieldName` falls back to `codeName(fieldLabel(...))`; set "Field name" to control it. "Couldn't send" -> the address is not reachable or refuses CORS.

### Sign-in pages
- **What it does:** Adds ready-made Log in, Create account, Forgot password, Set a new password and Confirm email pages, built from ordinary forms you can restyle and reword.
- **Where in the app:** Left panel **Pages** tab -> button **Add sign-in pages** (`sidebar/pages/PagesPanel.tsx`; it disappears once all five exist). The pages' forms then show under **Actions** -> **Form** -> **It will** (Log people in, Create an account, Email a reset link, Set a new password, Confirm email / resend link).
- **Accepts (input):** The `data-fe-submit` kind on a `<form>`: `send`, `sign-in`, `register`, `forgot`, `reset`, `confirm` (`SubmitKind`, `SUBMIT_KINDS` in `model/forms.ts`). Fields are read by name: `email`, `password`, `name`. Addresses: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/confirm-email` (`AUTH_PAGES` in `model/authPages.ts`).
- **Produces (output / redirect):** Five pages appended to the site (existing addresses are skipped); the first three get "Signed out" access so signed-in people are sent away from them. The editor opens `/login` afterwards. Preview and `.html` downloads show only the thank-you text for non-`send` kinds. React: each form calls `useAuth()` (`forms/authForm.ts`), and after sign-in or register-without-confirmation navigates to `sessionStorage['auth:redirect']` or `/`. Analytics `auth_pages_add`.
- **Needs:** A site (**Make this a website** first). Real sign-in only in the React download (see "Sign-in in the React download"). `needsAuth` becomes true when any form has a non-`send` kind.
- **How it works:**
  1. `PagesPanel` button -> `createAuthPages()` (`actions/pageActions.ts`) -> `updateDoc((doc) => addAuthPages(doc))`.
  2. `addAuthPages` loops `AUTH_PAGES`, skips paths already in `listPages`, and calls `addPage(..., { from: 'code', code: page.html })`.
  3. Page HTML is made by `form(kind, success, inner)` with helpers from `model/formBlocks.ts` (`field`, `BOX`, `INPUT`, `BUTTON`) and `data-fe-match` for repeat-password.
  4. Signed-out-only pages get `conditionAttrs({ audience: 'signed-out', ... })` merged into the page node's attrs.
  5. React: `forms/formTemplates.ts` `formFile` calls `authForm(submit, router.lib)` when `isAuthKind(submit)` and a router exists; the generated `onSubmit` calls `signIn`, `register`, `forgotPassword`, `resetPassword` or `confirmEmail`/`resendConfirmation` from `useAuth()` (names per `AuthState` in `providerTemplates.ts`).
  6. `missingAuthPages(doc)` decides when the button shows.
- **Debug:**
  - Files: `model/authPages.ts`, `model/formBlocks.ts`, `actions/pageActions.ts` (`createAuthPages`), `export/react/forms/authForm.ts`.
  - Tests: `model/authPages.test.ts`, `export/react/forms/authPagesExport.test.ts`. E2E: `e2e/auth-pages.mjs` (adds the five pages, undo, Preview redirect). Note `e2e/auth.mjs` tests the editor app's own `/login`, not these pages.
  - Symptom -> cause: button missing -> all five paths exist already (`missingAuthPages` is empty). Your own `/login` is kept -> `addAuthPages` matches by path and skips it (and `authFiles` then skips the fallback `LoginPage`). Form in React is plain -> kind is `send`, or the project is one page with no router (auth forms need `router`). Log in page in Preview only says "Signed in..." -> expected; Preview does not sign anyone in.

### Who can see this / conditions / Viewing as
- **What it does:** Lets you show an element or page only to signed-in or signed-out visitors, to certain roles, or when certain flags are on, and lets you preview the page as each kind of visitor.
- **Where in the app:** Select anything -> **Actions** tab -> **Who can see this** (segmented: Everyone / Signed in / Signed out; role tick boxes; flag tick boxes; "Add a role..." and "Add a flag..." boxes). Pages: **Pages** tab -> page settings -> **Who can open this page**. Top bar: **Viewing as: ...** menu (**ViewerMenu**; appears only once something has a condition).
- **Accepts (input):** Attributes `data-fe-show="signed-in|signed-out"`, `data-fe-roles="admin,member"`, `data-fe-flags="beta"` (`model/conditions.ts`). Old `data-fe-private` reads as signed in. Site roles and flags live in `doc.access` (default roles `member`, `admin` via `DEFAULT_ROLES`). A `Viewer` is `{ signedIn, roles, flags }`.
- **Produces (output / redirect):** Editor frame: hidden elements get `display: none !important` (CSS from `viewCss`, never saved into the page). Preview, public view and downloads: hidden elements are removed from the document (`forViewer`); downloads assume a signed-out visitor (`VISITOR`). React: conditional elements are wrapped in `<Show when={{ signedIn: true, roles: [...], flags: [...] }}>`. No toast. The viewer choice is session state only (`view.store.viewer`), not saved with the page.
- **Needs:** Nothing in the editor. React output needs the auth files (`needsAuth(doc)`; see below). Static downloads cannot keep anything secret.
- **How it works:**
  1. `WhoControl` calls `setCondition` and `addAccessName` (`actions/accessActions.ts`), which write `conditionAttrs(condition)` (empty values remove attributes) or update `doc.access`.
  2. `conditionOf(node)` parses the attributes into `{ audience, roles, flags }`; roles imply signed in.
  3. `visibleTo(condition, viewer)` decides. `hiddenFor(nodes, viewer)` lists every element the viewer cannot see.
  4. `ViewerMenu` -> `useViewStore.setViewer`. `EditorFrame.tsx` calls `viewCss(doc, pageId, viewer, focusId)` to hide elements in the frame (pages themselves are not hidden by this).
  5. `PreviewOverlay.tsx` passes `viewer` to `SafePageFrame` -> `forVisitors(doc, viewer)` -> `forViewer` removes hidden nodes (`removeNode`).
  6. React: `jsxWriter.ts` calls `jsxExtras.showWhen(node)` and wraps the element in `Show`.
- **Debug:**
  - Files: `model/conditions.ts`, `inspector/sections/WhoControl.tsx`, `WhoSection.tsx`, `toolbar/ViewerMenu.tsx`, `store/view.store.ts`, `frame/editorSource.ts` (`viewCss`), `serialize/forVisitors.ts`, `export/react/jsxExtras.ts`.
  - Tests: `model/conditions.test.ts` (reads, decides, writes, lists hidden), `export/react/auth/authFiles.test.ts` (wraps in `<Show>`). E2E: `e2e/conditions.mjs`.
  - Inspect: element attributes in the frame; `useViewStore.getState().viewer` (Zustand store in `view.store.ts`).
  - Symptom -> cause: "Viewing as" button missing -> no element has a condition and the viewer is still `VISITOR`. Element disappears in the editor and you cannot select it -> the viewer cannot see it; switch **Viewing as**. Flag-gated box missing in a download -> expected for a signed-out visitor with no flag, unless a flag click exists (then `forViewer` keeps it for the flag player). Role ticked but audience shows signed in -> by design, `conditionOf` treats any role as signed in.

### Page guard and private pages
- **What it does:** Decides what a visitor gets when they open a page they may not see: sent to the Log in page, shown "No access", or sent home if the page is for signed-out people only.
- **Where in the app:** **Pages** tab -> page settings -> **Who can open this page**. Seen by testing: top bar **Preview** with **Viewing as**.
- **Accepts (input):** A page's `access` condition (same `data-fe-show/roles/flags` attributes on the page container, read by `listPages`), a `Viewer`, and the site's `/login` page if any.
- **Produces (output / redirect):** Preview and public view: the Log in page, or a plain notice page ("Please log in" or "No access", `noticeHtml`). Static site download: a `<script>` in `<head>` that hides the page and `location.replace`s to the other page's file. React: `RequireAuth` (React Router) redirects with `<Navigate to="/login">` and remembers the wanted path in `sessionStorage['auth:redirect']`; TanStack uses `requireAccess` in `beforeLoad` with `redirect({ to: '/login' })` or `/no-access`.
- **Needs:** For real protection: the React download plus your API (static files cannot keep secrets). `/login` page added via **Add sign-in pages**, otherwise the notice appears.
- **How it works:**
  1. `SafePageFrame.tsx` (when `site`) calls `guardPage(doc, pageId, viewer)` from `model/pageGuard.ts`.
  2. `guardPage`: if `visibleTo(page.access, viewer)` it returns the page; signed-out-only page -> first visible page; signed-out viewer on a signed-in page -> the `/login` page or notice `'login'`; otherwise notice `'no-access'`.
  3. A notice renders `noticeHtml(notice)`; otherwise `pageDoc(doc, guard.pageId)` goes through `forVisitors`.
  4. `export/siteFiles.ts` `withGuard(doc, pageId, html)` repeats it for each downloaded file using `guardPage(doc, pageId, VISITOR)`.
  5. React: `buildSiteProject.ts` builds `access` per page and calls `routeGuard(router, access, element)` from `auth/guardTemplates.ts`; `authFiles` adds `src/auth/RequireAuth.tsx` and `src/pages/NoAccessPage.tsx`.
  6. Rule: change `guardPage` and the guard templates together (ARCHITECTURE: "Change both when the React guard rules change").
- **Debug:**
  - Files: `model/pageGuard.ts`, `export/SafePageFrame.tsx`, `export/siteFiles.ts`, `export/react/auth/guardTemplates.ts`, `export/react/buildSiteProject.ts`.
  - Tests: `model/pageGuard.test.ts` (login redirect, notice without login page, allowed vs no access, signed-in away from login), `export/react/siteProject.test.ts` ("guards signed-in only pages and adds a login page"). E2E: `e2e/auth-pages.mjs` (Preview sends a signed-out visitor to Log in and back). I did not find a unit test for `siteFiles.withGuard`.
  - Inspect: `sessionStorage.getItem('auth:redirect')` in a React build; the exported `src/router.tsx` for the guard wrapper.
  - Symptom -> cause: "Please log in" notice -> no page at `/login` visible to the viewer. Redirect loop in TanStack -> a `<Navigate>` used inside a route component (the docs say use `beforeLoad` + `redirect`). Login does not return to the wanted page in React Router -> the login page must not navigate itself; the signed-out guard does the redirect. Page still readable in the downloaded files -> the static guard only redirects; the HTML is public.

### Sign-in in the React download
- **What it does:** Writes a working sign-in system into the exported React project: session, API calls, a pretend (mock) server, provider, route guards and a fallback login page.
- **Where in the app:** No direct button. It is added automatically when the page has a condition, a flag click, or a form whose kind is not `send`. API paths are editable in the left **Data** tab -> **Sign-in API (optional)** (`sidebar/data/AuthApiSettings.tsx`). Export through the normal React download.
- **Accepts (input):** `doc.authApi` (per-call path overrides, set by `setAuthEndpoint` in `actions/accessActions.ts`); `endpointsOf(doc)` fills the defaults from `AUTH_ENDPOINTS`: `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/confirm-email`, `/auth/resend-confirmation`, `/auth/me`, `/auth/refresh`, `/auth/logout`. Env vars in the exported project: `VITE_API_URL`, `VITE_USE_MOCK`, `VITE_FLAGS`.
- **Produces (output / redirect):** Files: `src/auth/types.ts`, `session.ts`, `authApi.ts`, `authMock.ts`, `AuthProvider.tsx`, `useAuth.ts`, `Show.tsx`, `signOut.ts`, `src/config/flags.ts`, the API client, and with a router `src/auth/RequireAuth.tsx`, `src/pages/NoAccessPage.tsx` and (unless the site has `/login`) `src/pages/LoginPage.tsx`. Dependency `axios`. Runtime: session in `localStorage['auth:session']`; mock users in `localStorage['auth:mock-users']`; after sign-in, navigation to `auth:redirect` or `/`; sign-out reloads the page.
- **Needs:** `VITE_USE_MOCK` not `"false"` uses the mock (demo accounts `admin@example.com` / `admin123` and `member@example.com` / `member123`; confirmation and reset links are printed to the browser console). Set `VITE_USE_MOCK=false` and `VITE_API_URL` to use your API, which must return `{ user, accessToken, refreshToken? }`.
- **How it works:**
  1. `buildReactProject.ts` / `buildSiteProject.ts` call `authFiles(doc, router?)` (`export/react/auth/authFiles.ts`), which returns `{}` unless `needsAuth(doc)`.
  2. `apiTemplates.ts` `authApiSource(endpointsOf(doc))` writes `authApi`: each call is `USE_MOCK ? mock.x(...) : post(ENDPOINTS.x, ...)`.
  3. `SESSION` keeps the session in `localStorage`, adds a request interceptor for the bearer token and a response interceptor: a 401 tries `sessionEvents.refresh()` once, then `onExpired`.
  4. `MOCK` (`mockTemplate.ts`) implements `signIn`, `register`, `confirmEmail`, `resendConfirmation`, `forgotPassword`, `resetPassword`, `me`, `refresh` against local storage.
  5. `AUTH_PROVIDER` provides `signIn`, `register`, `signOut`, `hasRole` etc. through `useAuth()`; on load with a real API it calls `me()` to refresh the user and roles.
  6. Elements are wrapped in `Show`; pages in `RequireAuth` / `requireAccess` (`routeGuard`); `mainTemplate.ts` wraps the app in `<AuthProvider>`.
- **Debug:**
  - Files: `export/react/auth/authFiles.ts`, `apiTemplates.ts`, `mockTemplate.ts`, `providerTemplates.ts`, `guardTemplates.ts`, `loginTemplate.ts`, `model/authApi.ts`, `actions/accessActions.ts`.
  - Tests: `model/authApi.test.ts` (default paths until changed), `export/react/auth/authFiles.test.ts` (only added when needed; provider/session/endpoints/mock/flags; `<Show>`; own `/login` kept), `export/react/siteProject.test.ts`, `export/react/forms/authPagesExport.test.ts`. No e2e spec covers the exported project's sign-in (`e2e/auth.mjs` is the editor's own account login).
  - Inspect: in the exported app, `localStorage` keys `auth:session`, `auth:mock-users`, `tweak:flags`; the console for `[mock]` lines; Network for `/auth/*` calls once `VITE_USE_MOCK=false`.
  - Symptom -> cause: no auth files at all -> `needsAuth` is false (nothing has a condition, flag click or sign-in form). Real API never called -> `VITE_USE_MOCK` is still not `"false"`. Wrong URLs -> edit paths under **Data** -> **Sign-in API** (relative to `VITE_API_URL`). Signed in with a stale role -> roles come from `me()`; with the mock, the stored user is used. "Please confirm your email first" in mock -> a newly registered mock user has `emailConfirmed: false`; use the link printed in the console.

### Ready-made widgets
- **What it does:** Adds finished interface parts (inputs, switches, selects, date pickers, calendars, tabs, menus, tables, search and filters) as plain HTML that already works in Preview, downloads and React.
- **Where in the app:** Left panel **Add** tab, three folds after Ready-made: **Inputs**, **Tabs and menus**, **Tables, search and filters** (`sidebar/WidgetBlocks.tsx`). Select a widget -> **Actions** tab -> a settings section named after it (Tabs, Select list, Date picker, Calendar, Table, Search bar, Filter, Input, Switch; `inspector/widgets/WidgetSection.tsx`).
- **Accepts (input):** A click on an Add block (`WIDGET_GROUPS` in `model/widgets/registry.ts`). Panels accept tab names, select options one per line, row/column counts, a connect target and (for filters) a data field or `source.field` for the choices (`data-ui-choices`). Searches and filters point at a list or table named by `data-ui-filterable`.
- **Produces (output / redirect):** In ONE undo step (`insertWidget` in `actions/widgetActions.ts`): the boxes, a marked CSS block in the page CSS (`/* tweak-ui <group> */ ... /* /tweak-ui */`, plus a shared `base`), and for "Table from data" sample data if none exists. The new box is selected. Searches/filters are connected to the first list or table, or a toast says "Add a list or a table first, then connect this in its settings." React: `src/widgets.ts` (plain JavaScript, `// @ts-nocheck`) imported in `src/main.tsx`; `data-ui-*` attributes are kept in the JSX.
- **Needs:** No sign-in, network or env var. "Table from data" and data-backed filters need a data source (a sample is created). Search/filter need a list or table on the page.
- **How it works:**
  1. `WidgetBlocks` -> `insertWidget(block)`: resolves target (`filterTargets`), builds HTML with `block.html({ target, source })`, parses with `htmlToChildNodes`, inserts with `insertSubtree`, names the target with `nameTarget`, and sets `css: addWidgetCss(doc.css, block.kind)` in one `updateDoc`.
  2. The initial state is complete in the markup (first tab panel open, others `hidden`; the calendar has 42 day buttons), so the editor shows it without script.
  3. Preview/downloads: `forVisitors` -> `withWidgets` (`widgets/widgetPlayer.ts`) appends `WIDGET_SCRIPT` when `widgetKindsIn(nodes)` is not empty.
  4. `widgetScript.ts` concatenates `runtime/core.js`, `popups.js`, `tabs.js`, `select.js`, `date.js`, `fields.js`, `table.js`, `filter.js`, then `startAll(document)` and a `MutationObserver` that starts widgets added later.
  5. React: `export/react/widgetFiles.ts` `widgetFiles(nodes)` writes `src/widgets.ts`; `mainTemplate.ts` adds `import './widgets'` when `widgets: usesWidgets(...)`.
  6. In the editor, `canvas/useRevealWidgets.ts` (called in `Canvas.tsx`) uses `revealChanges` to send frame `attr`/`unattr` messages so selecting a tab panel or a select/date box shows it (editor-only; saved state is unchanged).
  7. Keep three places in step: the HTML builder (`blocks*.ts`), the runtime JS, and the inspector panel / `model/widgets/edit.ts`.

  Widget kinds and hooks (`WidgetKind` in `model/widgets/attrs.ts`; the top box has `data-ui="<kind>"`):

  | Kind (`data-ui`) | Add blocks | Hooks (`data-ui-*`) | Runtime file |
  |---|---|---|---|
  | `field` | Text, Email, Password, Number input, Text area | `wrap`, `reveal` (show/hide password), `step` (`-1` / `1`), `clear`, `count` | `fields.js` |
  | `switch` | Switch, Setting with switch | none (a native `role="switch"` checkbox) | none |
  | `select` | Select, Select with search | `trigger`, `popup`, `option`, `value`, `input` (hidden field for forms), `search`, `empty` | `select.js`, `popups.js` |
  | `datepicker` | Date picker | `trigger`, `popup`, `input`, `cal`, `day`, `prev`, `next`, `title`, `today`, `weekday`, `week`, `format`, `month` | `date.js`, `popups.js` |
  | `calendar` | Calendar | same calendar hooks as the date picker | `date.js` |
  | `tabs` | Tabs, Pill, Boxed, Side tabs | `tab="key"`, `panel="key"` (arrow keys, Home, End) | `tabs.js` |
  | `menu` | Dropdown menu | `trigger` on a `<summary>` (native `<details>`) | `popups.js` |
  | `table` | Table, Striped, With status, From data | `sort` on `<th>` | `table.js` |
  | `search` | Search bar | `for="name"`, `clear` | `filter.js` |
  | `filter` | Filter buttons, drop-down, tick boxes | `for="name"`, `kind="chips|select|checks"`, `filter="value"`, `by="field"`, `reset="name"`, `choices="source.field"` | `filter.js` |

  A list or table to be searched carries `data-ui-filterable="name"`; counters/empty notes use `data-ui-count-for` and `data-ui-empty-for` (read in `runtime/filter.js`).
- **Debug:**
  - Files: `model/widgets/registry.ts`, `blocksBasic.ts`, `blocksSelect.ts`, `blocksTable.ts`, `css.ts`, `cssBase.ts`, `cssForms.ts`, `connect.ts`, `filterData.ts`, `edit.ts`, `widgetScript.ts`, `widgetPlayer.ts`, `runtime/*.js`, `actions/widgetActions.ts`, `inspector/widgets/*`, `canvas/useRevealWidgets.ts`, `export/react/widgetFiles.ts`.
  - Tests: `model/widgets/widgets.test.ts` (blocks parse, tabs state, 42 day buttons, CSS added once, connect, script only when used, React file, reveal), `model/widgets/widgetEdit.test.ts` (tabs, options, rows, filter fields and choices). E2E: `e2e/widgets.mjs`, `e2e/widgets-data.mjs`, `e2e/widgets-choices.mjs`.
  - Inspect: in the frame/Preview, `$('[data-ui]')` and the `hidden` / `aria-selected` / `aria-pressed` attributes that the runtime flips; a downloaded `.html` has the script near the end of `<body>`; React `src/widgets.ts`.
  - Symptom -> cause: widget looks unstyled -> its `/* tweak-ui ... */` CSS block was deleted from the page CSS (`addWidgetCss` re-adds it only on a new insert). Works in the editor but not in a download -> no `data-ui` on the top box, so `widgetKindsIn` is empty and no script is added. Search does nothing -> its `data-ui-for` does not match a `data-ui-filterable` name (`pointAt` in `connect.ts`). A second tab bar inside a panel misbehaves -> hooks are scoped by `own(root, selector, kind)`, so nested widgets need their own `data-ui` root. In React a widget added later (a different page) does not respond -> check `import './widgets'` in `src/main.tsx`; the `MutationObserver` handles late parts.

## Components and outputs

Per-feature workflows for reusable components and for everything that turns the page model into something visitors, files or React projects can use. Paths are relative to `D:\Q_P\frontend-editor`.

Features in this group:

- Reusable components
- Looks (variants) and options (parts)
- Edit a component on its own
- Account component library
- Preview and public view
- Download .html / .zip / .png
- React project download
- Reopen a React project
- SEO (the app's own, and the page's kept head tags)
- Static output rules shared by all outputs

Shared facts: `data-fe-*` attribute names live in `src/features/editor/model/reuse/attrs.ts` (`COMPONENT_ATTR`, `INSTANCE_ATTR`, `OF_ATTR`, `VARIANT_ATTR`, `KEY_ATTR`, `PART_ATTR`, `LIBRARY_ATTR`). Feature flags in `src/config/features.config.ts` are only `enable_oauth`, `enable_gallery`, `enable_uploads`, `enable_billing`, `enable_marketplace`. None of them gates anything in this group.

### Reusable components
- **What it does:** Turns a box into a "main component" that is only for editing. Copies of it ("instances") are real boxes on the page that follow the main component, except for what a copy changed itself.
- **Where in the app:** Left sidebar, Components tab (New component, Your components rows: Edit, Add a copy, Show it, Duplicate, Delete). Add tab, "Your components" fold (`sidebar/ReuseBlocks.tsx`). Select a box, Settings panel, Actions tab, "Component" section (`inspector/sections/ReuseSection.tsx`, which shows `ReuseMain` or `ReuseCopy` for components and copies).
- **Accepts (input):** A selected box and a name (cut to 40 characters, made unique: "Card", "Card 2"). Or a start from `COMPONENT_STARTS` (Empty box, Card, Button, Banner, Person). Or pasted HTML, CSS and JavaScript ("From my code..."). A box cannot be made a component if it is the page, `<body>`, already in a component, or holds one (`canMakeComponent`). Components never nest.
- **Produces (output / redirect):** Page model only: `data-fe-component="Name"` on the main box; copies get `data-fe-instance="<main id>"` on the top box and `data-fe-of="<main box id>"` on every box. Toasts: "Put copies on the page itself, not inside a component." (copy inside a component), "Component made. It sits at the end of your page and is only for editing." (from code), the code's problem text as an error toast. No network. Every output drops main components (see "Static output rules").
- **Needs:** No sign-in, no flag, no network. Uses the doc store commit (`doc.store.ts`) and `htmlToChildNodes` / `addCodeToDoc` for the "from code" path.
- **How it works:**
  1. UI button -> `actions/reuseActions.ts` `makeMain` / `createComponent` / `createComponentFromCode` / `addInstance`.
  2. These call `updateNodes` (`actions/commit.ts`) with a pure function from `model/reuse/make.ts` (`makeComponent`, `instantiate`, `copyBranch`, `detachInstance`, `resetInstance`, `releaseComponent`, `renameComponent`).
  3. `updateNodes` -> `useDocStore.commit` (`store/doc.store.ts`), which first runs `propagate(doc.nodes, changed.nodes)` from `model/reuse/propagate.ts`, so the main change and the copy updates are ONE undo step.
  4. `propagate` detaches copies whose main is gone, then for each changed main walks `syncNode` per copy.
  5. `patchProps` is the three-way merge (`merged`): an attribute, a style per breakpoint, `hidden`, or `tag` of a copy is replaced only when it still equals the main component's OLD value. `OWN` attributes (`id`, the component bookkeeping) are never merged.
  6. `rebuildChildren` handles structure: boxes added, removed or moved follow the main component; a copy's own text survives where text positions line up.
  7. Attribute helpers: `model/reuse/attrs.ts` (`componentAround`, `mainOf`, `instancesOf`, `uniqueComponentName`); panel list from `componentList` in `model/reuse/library.ts`.
- **Debug:**
  - Files: `model/reuse/{attrs,make,propagate,library,omit}.ts`, `actions/reuseActions.ts`, `sidebar/components/ComponentsPanel.tsx`, `NewComponent.tsx`, `inspector/sections/Reuse*.tsx`.
  - Unit tests: `model/reuse/reuse.test.ts` (merge, undo step, data choice), `reuseOutputs.test.ts` (reset, detach, release), `library.test.ts`. E2E: `e2e/components.mjs`, `e2e/components-panel.mjs`, `e2e/components-data.mjs` (run with `npm run e2e`, needs `npx vite --port 5317`).
  - Inspect: select a box and look at its attributes in the Code tab; compare `data-fe-of` ids. Undo once and check main and copies move together.
  - A copy stops following one property -> the copy's value differs from the main's old value (it was changed on the copy). Use "Undo my changes to this copy" (`resetOverrides`).
  - All copies turned into normal boxes -> the main component was deleted or released; `propagate` calls `detachInstance`.
  - "Make a component" does not appear -> `canMakeComponent` is false (already inside or holding a component, or it is the page/body).
  - A new edit path shows main components in Preview or downloads -> it skipped `stripComponents` / `forVisitors` (editor-model rule 30).

### Looks (variants) and options (parts)
- **What it does:** One component can have several named designs ("looks", like Figma variants), and a copy can switch look and keep its own changes. Named "options" (parts) of a component can be shown or hidden per copy.
- **Where in the app:** Components tab, on each component row: the "Looks" chips, "+ Add a look", the rename box, "Remove this look" (`sidebar/components/LooksBar.tsx`). On a copy: Settings, Actions, "Component (copy)": "Look" select and "Show ..." switches. On a box inside a main component: "Part of ..." section with an "Option" name field (`inspector/sections/ReuseMain.tsx`, `ReuseCopy.tsx`).
- **Accepts (input):** A look name (30 characters, unique inside the component; blank becomes "New look"), an option name (empty removes the option), a chosen look id, a show/hide switch.
- **Produces (output / redirect):** Model only. Each look is its own main component with the same `data-fe-component` name and its own `data-fe-variant` (first one becomes "Default"); boxes share `data-fe-key` across looks (set by `ensureKeys`). An option is `data-fe-part="Name"`; a hidden option sets the copy box's `hidden` flag. Copies on the page only show the chosen look. All bookkeeping attributes are removed in outputs. Analytics events `add_block` with `component-look` and `component-switch-look`.
- **Needs:** Reusable components only. No sign-in or network.
- **How it works:**
  1. `LooksBar` / `ReuseCopy` -> `actions/lookActions.ts` (`addLookTo`, `renameLookOf`, `removeLook`, `switchLook`, `nameOption`, `showOption`).
  2. Each calls `updateNodes` with a function from `model/reuse/looks.ts`: `addLook` (clones the main with `cloneSubtree`, keys via `ensureKeys`), `renameLook`, `deleteLook`, `setPartName`, `setPartShown`, `swapLook`.
  3. `swapLook(nodes, copyId, targetMainId)` records what each copy box changed versus its old main box, by key (`changesOf`: attributes, styles per size, hidden, words).
  4. It then builds a fresh copy of the target look with `instantiate(nodes, targetMainId, copyId)` (same top id) and re-applies those changes box by box (`applyChanges`), then swaps it in with `insertSubtree` / `removeNode`.
  5. `deleteLook` first moves every copy of that look to the first other look with `swapLook`, then removes it (the only look cannot be removed).
  6. `partsOf` lists the options; `partShown` reads the copy box's `hidden`. `commit` runs `propagate`, which keeps a copy's `hidden` change (it differs from the main's old value).
- **Debug:**
  - Files: `model/reuse/looks.ts`, `actions/lookActions.ts`, `sidebar/components/LooksBar.tsx`, `ReuseBlocks.tsx` (Add tab adds only the first look of a component).
  - Unit tests: `model/reuse/looks.test.ts`. E2E: `e2e/component-looks.mjs`.
  - Switching a look loses a change -> that box has no `data-fe-key` (the look was made before keys existed) or text count differs between looks (`changesOf` only keeps words when counts match).
  - No "Look" select on a copy -> the component has only one look (`looks.length > 1` is required).
  - No switch for an option -> the box has no `data-fe-part`; name it on the main component.
  - Look names renamed unexpectedly -> `uniqueLookName` adds " 2", " 3" for duplicates.

### Edit a component on its own
- **What it does:** Hides everything on the canvas except one main component so it can be edited without the rest of the page in the way. A strip at the top says what is being edited and has a "Done" button.
- **Where in the app:** Components tab -> "Edit" on a row. Settings, Actions, "Component (main)" -> "Edit on its own", or "Edit the main component" on a copy. The strip is `toolbar/FocusBar.tsx` ("Editing the component ... on its own ... Done").
- **Accepts (input):** The id of a main component (`editComponent(mainId)`). Done/leaving: `leaveComponent`.
- **Produces (output / redirect):** No model change. `focusId` in `store/view.store.ts` is set, and the frame gets extra view CSS. On a site, the page holding the component is opened first (`showNode`). While focused, Add puts new things inside the component unless something inside it is selected. Focus ends automatically if the component is deleted or released.
- **Needs:** Reusable components. No sign-in or network.
- **How it works:**
  1. `editComponent` (`actions/reuseActions.ts`) -> `showNode` (switches page with `setPageId`, selects) -> `useViewStore.setFocus(mainId)`.
  2. `frame/EditorFrame.tsx` calls `viewCss(doc, pageId, viewer, focusId)` from `frame/editorSource.ts`.
  3. `viewCss` adds `body *:not([data-fe-id="<id>"]):not([data-fe-id="<id>"] *):not(:has([data-fe-id="<id>"])) { display: none !important; }` into the `fe-view-css` style (`VIEW_STYLE_ID`).
  4. `resolveInsertTarget` (`actions/contentActions.ts`) reads `focusId` so "Add" goes inside the component.
  5. `FocusBar` (rendered by `layout/EditorLayout.tsx`) shows the copy count from `instancesOf`; its effect clears focus when `COMPONENT_ATTR` is no longer on the node. `createComponent`, `createComponentFromCode` and `addFromLibrary` call `leaveComponent()` first.
- **Debug:**
  - Files: `frame/editorSource.ts` (`viewCss`), `store/view.store.ts` (`focusId`, `setFocus`), `toolbar/FocusBar.tsx`, `actions/contentActions.ts`.
  - Unit tests: none specific to `viewCss` that I confirmed. E2E: `e2e/component-isolation.mjs`.
  - Inspect: the `<style id="fe-view-css">` inside the editor frame (devtools, pick the frame context).
  - Whole page stays visible -> `focusId` points at a node that no longer exists in `doc.nodes` (the CSS is only built when it does), or the frame has not rebuilt the view style yet.
  - New block lands outside the component -> the current selection is inside another box; select inside the component or nothing.
  - Strip vanishes by itself -> the component was deleted or turned into a normal box (`alive` is false in `FocusBar`).
  - Edits made here still reach copies -> expected, `propagate` runs on every commit.

### Account component library
- **What it does:** Lets a signed-in person save a component (all its looks and the CSS it needs) to their account and add it to any of their pages, with versions and an "update" path.
- **Where in the app:** Components tab: "My library" block (Add to this page, Remove from library, "version N") and, on each component row, the buttons "Save to my library" / "Update my library" / "Save as new" / "Get the newer version" (`sidebar/components/MyLibrary.tsx`, `LibraryButtons.tsx`).
- **Accepts (input):** A main component id. Stored `LibraryEntry`: `{ v: 1, name, looks: [{ nodes, topId }], css, links }`. Limits: packed data at most 200,000 characters (`MAX_CHARS` in `workspace/api/componentLibrary.ts` and `firestore.rules`), name 1 to 100 characters.
- **Produces (output / redirect):** Firestore collection `tweaks_components` (`COLLECTIONS.components`): fields `ownerId, name, data, version, createdAt, updatedAt`. In the page: a linked main has `data-fe-library="<entry id>@<version>"`; the entry's CSS is inserted as a block `/* tweak-library:<id> */ ... /* end tweak-library:<id> */` in front of the page CSS. Toasts: "... saved to your library.", "... updated in your library.", "... added. It sits at the end of your page; press Add a copy to use it.", "Updated to version N.", "The library could not be reached. Check your connection and try again.", "This page is too big to save..." style friendly errors (`ProjectTooBigError`).
- **Needs:** Sign-in (`libraryAvailable()` = auth status `signedIn`) and network. Firebase is only loaded by dynamic import (`api()` in `actions/libraryActions.ts`). Rules in `firestore.rules` block `tweaks_components/{entryId}`: owner-only read/delete, create requires `version == 1` and an exact key list, update requires `version == resource.version + 1` and only `name, data, version, updatedAt` changing.
- **How it works:**
  1. `MyLibrary` on mount (when signed in) -> `loadLibrary()` -> `listLibrary(uid)` (query `where('ownerId','==',uid)`, sorted by `updatedAt` in the client; entries that cannot be unpacked are skipped).
  2. Save: `saveToMyLibrary(mainId, asNew?)` -> `keyLooks` (gives every look's boxes keys) -> `entryFromComponent` (`model/reuse/entry.ts`; CSS via `pickCss(doc.css, usageOf(...))` in `model/reuse/pickCss.ts`) -> `saveToLibrary` (version 1) or `updateLibraryEntry` (version + 1).
  3. `pack` uses `packValue` (`workspace/api/packDoc.ts`, gzip + base64 when large) and refuses over 200,000 characters.
  4. `stamp` writes `data-fe-library` on every look of the page's component, then `loadLibrary` refreshes the list.
  5. Add: `addFromLibrary(itemId)` -> `leaveComponent`, `addEntry` (new ids, new unique name, CSS block, extra stylesheet links) -> `updateDoc`.
  6. Update: `newerInLibrary` compares versions; `updateFromLibrary` -> `updateFromEntry`, which reuses box ids by `data-fe-key` so `propagate` carries the change to copies. Removing calls `deleteLibraryEntry`; pages that already use it keep their copy.
- **Debug:**
  - Files: `model/reuse/entry.ts`, `pickCss.ts`, `actions/libraryActions.ts`, `store/library.store.ts` (`items`, `status`, `busy`), `workspace/api/componentLibrary.ts`, `firestore.rules`.
  - Unit tests: `model/reuse/entry.test.ts`, `pickCss.test.ts`; rules: `tests/rules/firestore.rules.test.ts` ("component library" block, run with `npm run test:rules`, needs the Firebase emulator). No e2e covers the library (I found none).
  - Inspect: Network tab to firestore.googleapis.com; the Firestore document `tweaks_components/<id>`; the page CSS for the `tweak-library` markers.
  - "Sign in to keep components..." shown -> auth status is not `signedIn` yet.
  - Save fails with "too big" -> packed entry over 200,000 characters, usually pictures pasted inside the code.
  - Update rejected -> version did not go up by exactly 1 (rules); another page may have saved first, which is why `saveToMyLibrary` reloads the list for a linked component.
  - Added component looks unstyled -> `pickCss` is "a good guess, not a parser": a rule using unrelated selectors was not kept.

### Preview and public view
- **What it does:** Shows the page as visitors will get it, with its JavaScript running, inside a locked-down frame. The same frame component shows shared pages at `/p/:projectId`.
- **Where in the app:** Editor toolbar "Preview" button (opens a full-screen "Preview" dialog with "Back to editing", device switch, "Viewing as" menu; Esc closes). Public: `/p/:projectId` ("Make my own copy" or "Edit" for the owner).
- **Accepts (input):** A `PageDoc` (a snapshot taken when Preview opens, `useState(getDoc)`), the open `pageId`, the page address `params` (e.g. `/products/3` -> `{ id: "3" }`), the `viewer` (visitor, member, admin and flags), and the screen size.
- **Produces (output / redirect):** An `<iframe srcDoc=...>` with `sandbox="allow-scripts allow-forms allow-popups allow-modals"` and `referrerPolicy="no-referrer"`. Never `allow-same-origin`. On a site, link clicks post `tweakOpenPath` to the parent, which switches page (`matchPage`); a guarded page shows a login page or "no access" notice (`guardPage`, `noticeHtml`). Public view: "This page isn't shared" empty state when the project can't be loaded.
- **Needs:** No flag. Public view needs network and Firestore reads (`getProjectMeta`, `loadProjectContent`). Preview works offline.
- **How it works:**
  1. `export/ExportButtons.tsx` -> `useViewStore.setPreview(true)` -> `PreviewOverlay.tsx` -> `SafePageFrame.tsx`.
  2. `SafePageFrame` (`useMemo`): for a site `guardPage(doc, pageId, viewer)`; else `pageDoc(doc, pageId)` (`model/serialize/sitePages.ts`).
  3. `forVisitors(...)` (`model/serialize/forVisitors.ts`) in this order: `stripComponents`, `forViewer` (remove what this viewer may not see; pages stay), `expandDataLists`, `expandRecords`, then `withAnimations`, `withRecords`, `withForms`, `withPopups`, `withClickedRows`, then `withUpdateClicks`, `withFlagClicks`, `withLayouts`, `withWidgets`.
  4. `withoutLocalFiles` drops links to files that were not pasted (they would load from Tweak's own server).
  5. `buildPageParts` -> `partsToSingleFile` makes one HTML string; for sites the `NAVIGATE` script is added before `</body>`.
  6. A `message` listener ignores any event whose `source` is not this frame's window.
  7. Public: `PublicPageView` loads project content, renders `Seo` (index off unless `INDEX_SHARED_PAGES`), and the same `SafePageFrame`.
- **Debug:**
  - Files: `export/SafePageFrame.tsx`, `PreviewOverlay.tsx`, `model/serialize/forVisitors.ts`, `gallery/PublicPageView.tsx`.
  - Unit tests: the players each have a test using `forVisitors` (`clickedPlayer.test.ts`, `flagPlayer.test.ts`, `formPlayer.test.ts`, `layoutPlayer.test.ts`, `popupPlayer.test.ts`, `updatePlayer.test.ts`, `widgets.test.ts`, `dataRecords.test.ts`, `reuseOutputs.test.ts`). E2E: `e2e/export.mjs` (script runs in preview, Esc leaves, editor untouched), `e2e/conditions.mjs`, `e2e/dynamic-routes.mjs`, `e2e/animation.mjs`, `e2e/data-list.mjs`.
  - Inspect: devtools -> the preview iframe's `srcdoc`; console messages from the page appear in the frame context.
  - Preview differs from the editor -> Preview uses `forVisitors` (lists filled, players added); the editor uses the live frame runtime.
  - A page script reads the app's localStorage/cookies and fails -> expected, the frame has no same-origin access.
  - Clicking a link does nothing on a site -> the path matches no page (`matchPage` returned null), or the frame is not the event source.
  - Preview does not update after edits -> by design, it is a snapshot; close and reopen.
  - Shared page empty state -> the project is private or deleted.

### Download .html / .zip / .png
- **What it does:** Saves the page (or one selected part) as one self-contained .html file, a .zip of separate files, or a .png picture. "Copy the code instead" puts the HTML on the clipboard.
- **Where in the app:** Toolbar "Download" -> dialog "Download your page": "Web page (.html)", "Picture (.png)", "Files for a developer (.zip)", "React project (.zip)"; "Whole page / Only <part>" when a box is selected; "Copy the code instead".
- **Accepts (input):** The open document; an optional `ExportScope` (id of the selected part, or null); the current page on a site (`useViewStore.pageId`). The `DownloadGate` from the host page.
- **Produces (output / redirect):** Browser downloads `<title>.html`, `<title>.zip` (`index.html`, `styles.css`, `script.js`, `module.js` only when needed), `<title>.png`, or `<title>-part.*` for a part. A site's .zip has one .html per page (home is `index.html`) sharing one stylesheet. Toasts: "Downloaded!", "Code copied - paste it anywhere", "Sorry - <error message>". Try-it asks to sign up ("Create a free account to download"); saved pages show downloads left.
- **Needs:** Gate: Try-it passes `signin`, saved pages `counted` (`workspace/useDownloadGate`, `recordDownload`), `open` is dev/e2e only. The picture needs the live editor frame and the bundled `html-to-image` (loaded lazily with `?raw`).
- **How it works:**
  1. `ExportButtons` -> `ExportDialog.tsx` `run(id, prepare, done)`.
  2. `prepare` is one of `prepareHtml` / `prepareZip` / `prepareReact` / `preparePng` / `prepareCopy` in `export/exportActions.ts`; each returns a `deliver()` step. Order is prepare, `gate.consume()`, `deliver()`, so a failed export never uses a download.
  3. HTML/zip: `pageForExport` = `currentPageDoc(getDoc(), pageId, true)` (`export/siteFiles.ts`), which runs `forVisitors` and, for sites, `linkToFiles`.
  4. `buildPageParts(doc, scope)` then `partsToSingleFile` (html) or `partsToSplitFiles` (`export/buildFiles.ts`) + `zipFiles` (`export/zip.ts`, fflate). A whole site uses `siteToSplitFiles`, which also adds a redirect script for pages a signed-out visitor may not open (`withGuard`).
  5. PNG: `capturePng(id)` -> `loadPictureTool` (sends the bundled library once) -> `bridge.request('capture', ...)` handled in `frame/runtime/capture.js` (pixelRatio 2; boxes with `data-fe-hidden` are filtered out).
  6. `downloadFile` (`lib/download`) saves it; `track('download', ...)`.
- **Debug:**
  - Files: `export/exportActions.ts`, `ExportDialog.tsx`, `downloadGate.ts`, `buildFiles.ts`, `siteFiles.ts`, `capturePng.ts`, `frame/runtime/capture.js`.
  - Unit tests: `export/buildFiles.test.ts`, `export/siteFiles.test.ts`. E2E: `e2e/export.mjs` (gate, html, zip, react zip, part png, preview).
  - Inspect: the file contents; `track` events `download` and `download_blocked`.
  - Buttons disabled -> `downloadsBlocked(gate)`: signed out in Try-it, gate still loading, or zero downloads left.
  - PNG fails with "The page is still loading - try again in a second." -> no frame bridge yet (`useFrameStore.getState().bridge` is null).
  - Zip has no `script.js` -> no inline classic scripts; external and unusual script types stay in the HTML.
  - Whole-page PNG vs HTML differ -> the picture is taken from the live editor frame, not from `forVisitors`. I did not confirm that main components are hidden in a whole-page PNG; check `capture.js` before relying on it.

### React project download
- **What it does:** Builds a Vite + React + TypeScript project from the page: one component file per part, repeated cards turned into one component with props, and extra files for data, sign-in, forms, pop-ups, widgets and animations when the page uses them.
- **Where in the app:** Download dialog -> "React project (.zip)". On a multi-page site a "Pages router for the React project" choice (`ROUTERS`, `RouterKind`: `react-router` or `tanstack`) appears. The Code tab's React view reads the same builders.
- **Accepts (input):** The `PageDoc` (or one part by id); `router` for sites. Data sources, conditions (who can see), forms, pop-ups, animations and widgets come from the model.
- **Produces (output / redirect):** A zip `<title>-react.zip` with `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx` (site: `src/router.tsx`, `src/layout/Layout.tsx`, `src/pages/*Page.tsx`, `NotFoundPage.tsx`), `src/components/*.tsx`, `src/styles/page.css`, `src/runPageScripts.ts`, `public/scripts/*`, `README.md`. Conditional files: data (`src/data/types.ts`, `mockData.ts`, `src/api/*.ts`, `client.ts`, `queryClient.ts`, `.env.example`), sign-in (`src/auth/*`, `src/config/flags.ts`, `RequireAuth`, login and no-access pages), forms (form kit, zod/React Hook Form), pop-ups (`src/components/ui/popup.ts`, `Modal.tsx`, `confirm.tsx`), `src/data/handlers.ts` for card clicks, `src/widgets.ts`, animation helpers, and the hidden `.tweak/project.json` (whole projects only, not for a single part).
- **Needs:** No sign-in beyond the download gate. Needs the app to load the builders lazily (`await import('./react/buildReactProject')`). Generated project needs `npm install`; `VITE_API_URL` and `VITE_USE_MOCK` are read by the generated code.
- **How it works:**
  1. `prepareReact` (`export/exportActions.ts`) picks `buildSiteProject` (multi-page, no scope) or `buildReactProject`.
  2. Both start with `stripComponents` (main components never ship).
  3. `renderParts` (`export/react/projectShell.ts`) -> `componentFiles.ts` `partComponent` writes one file per part; `repeats.ts` `findRepeats` makes item components with props; `jsxWriter.ts` writes the JSX from nodes (not an HTML serializer: it drops editor attributes with `isEditorAttr`, hides `hidden` boxes, converts links to router `Link`).
  4. `projectShell` builds the shell: `buildPageParts` for CSS, `planScripts` (`pageScripts.ts`) decides which scripts move to `public/scripts` and run after mount.
  5. Feature files are added when used: `dataFiles` (`dataTemplates.ts`), `authFiles` (only when `needsAuth(doc)`), `formProject`, `popupFiles`, `widgetFiles`, `listUiFiles`, `animationFiles`, `handlerFiles`, and `mainFile` (`src/main.tsx`).
  6. A whole project gets `withSnapshot(files, getDoc())` (`export/react/snapshot.ts`) and everything is zipped under a `<title>-react/` folder.
- **Debug:**
  - Files: `export/react/buildReactProject.ts`, `buildSiteProject.ts`, `jsxWriter.ts`, `jsxExtras.ts`, `componentFiles.ts`, `projectShell.ts`, `dataTemplates.ts`, `auth/authFiles.ts`, `forms/formTemplates.ts`, `popups/uiTemplates.ts`, `widgetFiles.ts`.
  - Unit tests in `src/features/export/react/`: `reactExport.test.ts`, `siteProject.test.ts`, `listExport.test.ts`, `dataFiles.test.ts`, `auth/authFiles.test.ts`, `forms/formExport.test.ts`, `popups/popupExport.test.ts`, `records/recordExport.test.ts`, `motionExport.test.ts`, `dynamicRoutes.test.ts`, `connectApiExport.test.ts`, `cardClick.test.ts`, `updateExport.test.ts`, `componentViews.test.ts`; also `model/reuse/reuseOutputs.test.ts`. E2E: `e2e/export.mjs`, `e2e/react-view.mjs`, `e2e/react-edit.mjs`.
  - Inspect: unzip and run `npm install && npm run dev`; compare `src/components/*.tsx` with the page; check `.env.example`.
  - A `data-fe-*` attribute appears in JSX -> it went around `isEditorAttr` (only `data-fe-go` is kept on purpose).
  - No auth files -> nothing has a condition, flag click or login/register form (`needsAuth`).
  - Pop-up or card click does nothing -> its handler is a stub in `src/data/handlers.ts` that only `console.info`s; fill it in.
  - Body CSS rules do not apply -> they must go through `#root` (covered by a test in `reactExport.test.ts`).
  - Single-part download has no `.tweak` file -> by design (`scope ? files : withSnapshot(...)`).

### Reopen a React project
- **What it does:** Opens again a React project that Tweak downloaded earlier (.zip or folder), restoring the page exactly from a hidden snapshot. Tweak does not parse arbitrary React code.
- **Where in the app:** Start/paste screen (`import/PasteScreen.tsx`): "Already have a React project from Tweak?" with "Open a .zip" and "Choose a folder"; "Open anyway" / "Cancel" when files changed.
- **Accepts (input):** A `.zip` file or a folder chosen with a directory picker. It must contain `.tweak/project.json`. Per-file limit 8 MB (`MAX_FILE_BYTES`).
- **Produces (output / redirect):** `onOpen(doc)` from the parent page, which calls `openDocument(doc)` (the editor opens with the restored `PageDoc`, main components and looks included). Messages: "This folder wasn't downloaded from Tweak, so it can't be opened here..." (`NOT_FROM_TWEAK`); "The hidden .tweak file is damaged, so this project can't be opened."; "This project was made with a newer Tweak. Refresh the page and try again."; "<name> is too big to be part of a Tweak project."; a list of files "changed outside Tweak" (up to 4 names) with a warning that they won't carry over. Analytics `react_project_open` with `changed`.
- **Needs:** No sign-in, no network (all in the browser, `fflate`). The snapshot format `tweak-project`, `VERSION = 1` in `export/react/snapshot.ts`.
- **How it works:**
  1. `ReactProjectOpener` `load(read)` -> `readZip(file)` or `readFolder(list)` in `import/readProject.ts`.
  2. `readZip` streams with fflate `Unzip`; entries matching `SKIPPED` (`node_modules`, `.git`, `dist`, `build`) or `BINARY` (images, fonts, archives, pdf...) are never opened, so a zip with `node_modules` is as fast as a clean one.
  3. `withoutTopFolder` drops the shared top folder ("my-site-react/").
  4. `readSnapshot(files)` (`export/react/snapshot.ts`) parses `.tweak/project.json`, checks `format`, `isDoc`, and `version`, and compares each file's `fingerprint` (FNV-1a, CRLF normalised) to find changed or removed files.
  5. If nothing changed `open(doc, 0)`; else the "changed outside Tweak" notice waits for "Open anyway".
  6. Bump `VERSION` when `PageDoc` changes so old snapshots are refused rather than misread.
- **Debug:**
  - Files: `import/readProject.ts`, `import/ReactProjectOpener.tsx`, `export/react/snapshot.ts`.
  - Unit tests: `export/react/snapshot.test.ts` (one page, a site, changed files, foreign folder, fingerprints). `readProject.ts` has no unit test that I found. E2E: `e2e/react-reimport.mjs` (zip, folder, changed file, foreign folder).
  - Inspect: open `.tweak/project.json` in the zip; check `format`, `version`, `files`.
  - "wasn't downloaded from Tweak" -> no `.tweak/project.json` (it was a single-part download, the folder was copied without hidden folders, or it is not a Tweak project).
  - Every file listed as changed -> the project was re-saved with another tool; compare fingerprints of those paths.
  - Folder picker missing files -> hidden folders may be skipped by the OS or browser; zip it instead.

### SEO (the app's own, and the page's kept head tags)
- **What it does:** Two separate things. (a) The Tweak app's own SEO: titles, descriptions, share tags, robots, structured data, a static HTML copy of each public screen, `sitemap.xml` and `robots.txt`. (b) For a page being edited, the safe `<head>` tags (meta and a few link kinds) found in pasted code are kept and written back into every output. There is no editor UI to write SEO fields for the user's page; I found none.
- **Where in the app:** (a) no UI; visible in the page head and in `dist/`. (b) no UI; these tags appear in the Code tab's whole-page source and in downloads.
- **Accepts (input):** (a) `src/config/seoRoutes.ts`: `SEO_ROUTES` (`path`, `title` up to about 65 characters, `description` 70 to 160, `index`, `priority`, `changefreq`, `summary`), `NOINDEX_PREFIXES` (`/edit/`, `/p/`, `/projects`, `/plans`, `/market`), env `VITE_SITE_URL`. (b) The pasted document's `<head>`.
- **Produces (output / redirect):** (a) Runtime head tags (`title`, `description`, `robots`, canonical, `og:*`, `twitter:*`, JSON-LD); build output `<route>/index.html` per indexed route, `robots.txt`, and `sitemap.xml` only when `VITE_SITE_URL` is set (otherwise a console warning "[seo] VITE_SITE_URL is not set..."). Unknown addresses get "Page not found - Tweak" and noindex. Shared pages (`/p/:id`) are noindex unless `INDEX_SHARED_PAGES` is true (`config/seo.config.ts`, currently `false`). (b) `PageDoc.headTags` (`meta` except `charset` and `http-equiv`, and `link` with rel `preconnect`, `dns-prefetch`, `preload`, `icon`, `shortcut icon`, `apple-touch-icon`, `canonical`); a default viewport is added when the page has none.
- **Needs:** (a) `VITE_SITE_URL` for canonical, `og:url`, share picture and sitemap. Share picture `/og-image.png` (`SHARE_IMAGE`; `scripts/seo/make-images.mjs` exists to make images). Hosts must serve the static files before the SPA rewrite (`vercel.json`). (b) Nothing.
- **How it works:**
  1. (a) Runtime: `app/RouteSeo.tsx` `metaFor(pathname)` -> `shared/seo/Seo.tsx` -> `headTags(meta, SITE_URL)` (`shared/seo/headTags.ts`) -> `applyTags` (`shared/seo/applyTags.ts`, finds tags by `data-seo` or adopts hand-written ones). A screen with its own `<Seo>` wins as it renders later; `JsonLd` adds `page-*` structured data.
  2. (a) Build: `vite.config.ts` registers `seoPlugin(VITE_SITE_URL)` (`scripts/seo/vitePlugin.ts`); in `closeBundle` it reads `dist/index.html`, and for each `INDEXED_ROUTES` entry writes `renderRoutePage` output (`shared/seo/staticPages.ts`), then `buildRobots` and `buildSitemap`.
  3. (b) Import: `model/parse/parseDocument.ts` calls `readHeadTags` (`model/parse/headTags.ts`).
  4. (b) Output: `headTagLines(doc)` in `model/serialize/buildPage.ts` is used by `buildPageParts` (html, zip, React `index.html` via `projectShell`) and by the editor frame source (`frame/editorSource.ts`); `model/serialize/editableSource.ts` writes them back into the editable whole-page source.
- **Debug:**
  - Files: `config/seoRoutes.ts`, `config/seo.config.ts`, `shared/seo/*`, `scripts/seo/vitePlugin.ts`, `app/RouteSeo.tsx`; for (b) `model/parse/headTags.ts`, `model/serialize/buildPage.ts`.
  - Unit tests: `shared/seo/seo.test.ts` (route list lengths, indexing, canonical, static pages, sitemap, robots, `applyTags`). E2E: `e2e/seo.mjs` (head per address, no console errors). For (b) there is no dedicated test I could confirm; `model/model.test.ts` and the export tests cover the pipeline in general.
  - Inspect: `view-source:` on the built `dist/<route>/index.html`; devtools Elements for `[data-seo]` tags; `dist/sitemap.xml`.
  - No sitemap or canonical in the build -> `VITE_SITE_URL` was empty at build time.
  - New public screen missing from search -> it has no line in `SEO_ROUTES` (so it is noindex and "not found" titled) or is under a `NOINDEX_PREFIXES` prefix.
  - Duplicate description tags -> a hand-written tag in `index.html` was not adopted; check `findExisting` in `applyTags.ts`.
  - A pasted page's `<meta http-equiv="refresh">` vanished -> dropped on purpose by `isKeptMeta`.

### Static output rules shared by all outputs
- **What it does:** One set of rules, applied in the same order by Preview, the public view, .html, .zip and (partly) React, so what you see matches what you ship. Editor-only structure never reaches visitors.
- **Where in the app:** No UI. It shows as: main components absent from Preview and downloads, lists filled with real rows, data-bound boxes filled, and no `data-fe-*` markers in React code.
- **Accepts (input):** A `PageDoc` containing main components, copies, looks and options, "List from data" boxes (`isListBox`), "one record" boxes (`isRecordBox`), animations, forms, pop-ups, layouts, widgets, conditions.
- **Produces (output / redirect):** A `PageDoc` for serializers: `stripComponents` removes every main component (all looks) and deletes `data-fe-of`, `data-fe-instance`, `data-fe-key`, `data-fe-part`, `data-fe-variant`, `data-fe-library` from the rest. `expandDataLists` replaces each list's one card design with one filled card per row (boxes without rows keep their design). `expandRecords` fills one-record boxes with a row's values (first row, row number, or the row matching a `params` value). React: `isEditorAttr(name)` = starts with `data-fe-` and is not `data-fe-go`, so those attributes are not written to JSX; hidden boxes are skipped (`visibleChildren`).
- **Needs:** Data sources in `doc.data` for lists and records. No flags.
- **How it works:**
  1. `forVisitors` (`model/serialize/forVisitors.ts`) calls `stripComponents(doc)` (`model/reuse/omit.ts`) first, so later steps never see main boxes.
  2. `forViewer` removes boxes this viewer can't see (downloads use a signed-out `VISITOR`).
  3. `expandDataLists(doc)` and `expandRecords(doc, params)` (`model/serialize/expandLists.ts`) use `fillCard` and `cloneSubtree`; cards that open a pop-up or update data also get `ITEM_ATTR` and `FROM_ATTR` so the player knows the item.
  4. The players are then added as scripts (animations, records, forms, pop-ups, clicked rows, updates, flags, layouts, widgets).
  5. The React builders do not use `forVisitors`: both call `stripComponents` themselves, keep lists as generated list components (live data) and write JSX with `jsxWriter` (`isEditorAttr` in `export/react/jsxExtras.ts`).
  6. Any new output path must go through `stripComponents` or `forVisitors` (editor-model skill, rule 30). Data-bound boxes keep one design in the model (rule 21).
- **Debug:**
  - Files: `model/reuse/omit.ts`, `model/serialize/forVisitors.ts`, `model/serialize/expandLists.ts`, `export/react/jsxExtras.ts`, `export/react/jsxWriter.ts`.
  - Unit tests: `model/reuse/reuseOutputs.test.ts`, `model/reuse/entry.test.ts` ("leaves no trace in what visitors get"), `model/reuse/looks.test.ts` ("the outputs carry none of the bookkeeping"), `model/dataLists.test.ts`, `export/react/listExport.test.ts`, `dynamicRoutes.test.ts`, `cardClick.test.ts`, `updateExport.test.ts`. E2E: `e2e/data-list.mjs`, `e2e/data-wire.mjs`, `e2e/components.mjs`, `e2e/export.mjs`.
  - Inspect: open the downloaded .html and search for `data-fe-of` or `data-fe-component` (should be none); in React output search for `data-fe-`.
  - A purple dashed component box shows in Preview -> a path skipped `stripComponents`; the dashed outline is editor-only helper CSS (`[data-fe-component]` in `HELPER_CSS`, `frame/editorSource.ts`).
  - A list shows one card in a download -> the list has no rows (`rowsFor` is empty) or no `templateId`, so it keeps its design.
  - A one-record box shows design text -> no matching row for the `params` value (downloads rely on `recordPlayer` for "?id" boxes).
  - Nothing proves HTML output removes every other `data-fe-*` attribute; only React is documented to drop them.

## Marketplace (development only)

Billing and the marketplace are behind `enable_billing` and `enable_marketplace`, which follow `import.meta.env.DEV`: the screens exist on the
development server and are 404 in a production build. All money is handled by `workers/billing`; see "Billing and payments" in ARCHITECTURE.md.

### Marketplace: browse, buy, sell and earn
- **What it does:** People list a page for sale; buyers browse, pay with crypto, and get their own private copy; sellers see orders, earnings (90 % of each sale) and can ask for a payout.
- **Where in the app:** `/market` (Browse), `/market/:id` (a listing, Buy), `/market/sell`, `/market/orders`, `/market/earnings` (top bar of every marketplace screen: Browse, Sell a page, My orders, Earnings).
- **Accepts (input):** a listing (`title` up to 100 letters, `description` up to 1000, `priceUsd` 1 to 500, visible or paused) for one of the seller's saved pages; a Buy click; a payout request (`wallet`, amount from $20 up to the balance).
- **Produces (output / redirect):** `tweaks_listings` documents; Buy redirects to the processor's hosted checkout (`window.location.assign`), which returns to `/market/orders?payment=<id>`; after the confirmed payment the buyer has a new private project (and the order says "Delivered" with an "Open in the editor" link), the seller has a ledger line and a higher balance, the listing counts the sale. A payout request moves the amount from the balance to a payout record that a person pays by hand.
- **Needs:** sign-in for Buy, Sell, Orders and Earnings; Firebase; the billing Worker (`VITE_BILLING_URL`, NOWPayments keys, the service account) and the deployed `firestore.rules`; `enable_marketplace`.
- **How it works:**
  1. Browse: `listActiveListings` (`where status == active`, sorted here) -> `shown(listings, search, sort)` in `marketplace/browse.ts`.
  2. Sell: `ListingForm` -> `listingProblem` (`validate.ts`) -> `createListing` (rules check the project is the seller's, price 1-500, `salesCount` 0) / `updateListing` / `deleteListing` (only while nothing sold).
  3. Buy: `ListingPage.buy` -> `startCheckout({ kind: 'order', listingId })` -> Worker `handleCheckout` -> `checkoutOrder` (listing active, price in range, seller's project exists, not your own page, not bought already) -> `startPayment` (order + pending payment, NOWPayments invoice).
  4. Payment: NOWPayments calls `/webhook/nowpayments`; `handleWebhook` checks the signature and amount, then one atomic commit marks the payment paid and runs `fulfilOrder` (copy of the seller's content as a new project, counters, ledger, balance, `salesCount`, order delivered).
  5. Return: `OrdersPage` shows `CheckoutStatus` until the payment settles, then reloads the orders.
  6. Payout: `EarningsPage` -> `payoutProblem` -> `requestPayout` -> Worker `handlePayout` (holds the amount, creates `tweaks_payouts`, ledger line).
- **Debug:**
  - Files: `src/features/marketplace/*`, `src/features/workspace/api/marketListings.ts`, `marketMoney.ts`, `src/features/billing/payments.ts`, `workers/billing/src/{checkoutOrder,startPayment,fulfilOrder,payout,webhook}.ts`, `firestore.rules` (marketplace block).
  - Tests: `src/features/marketplace/marketplace.test.ts`, `workers/billing/src/market.test.ts` (checkout, delivery, idempotence, missing seller page, payouts), `tests/rules/commerce.test.ts` (needs the emulator), `e2e/market.mjs` (screens with a mocked database), `e2e/flags.mjs` (hidden in production).
  - Inspect: the Worker's logs (`npx wrangler tail`), `tweaks_payments` / `tweaks_orders` in the Firebase console (`status`, `needsReview`, `paymentStatus`), the NOWPayments dashboard (IPN history).
  - Checkout errors while developing: the Worker adds `detail` to its error answers when `NOWPAYMENTS_SANDBOX` is not `false`; the README has a table of the usual ones (Cloudflare Access in front of the Worker, an incomplete `GOOGLE_SERVICE_ACCOUNT`, a missing Datastore role, a non-sandbox NOWPayments key).
  - Bought but nothing delivered -> the payment is not `finished` yet, or the order says `needsReview` (the seller's page was gone); look at `tweaks_orders/{id}.note`. Webhook answers 401 -> the IPN secret differs from `NOWPAYMENTS_IPN_SECRET`. Webhook answers 409 -> a document changed during the commit; the processor retries. Browse is empty with a console 403 -> the new `firestore.rules` are not deployed.

### Finished examples
- **What it does:** Opens one of four complete example websites (online shop, cafe, studio portfolio, members area) in the editor, ready to change and download.
- **Where in the app:** The paste screen (Try it and a saved page): the fold "No idea yet? Start from a finished example" with an "Open this example" button on each card.
- **Accepts (input):** a click on a card; nothing else.
- **Produces (output / redirect):** a new `PageDoc` (a multi-page site) handed to `onOpen`, which opens the editor (the same path as pasted code); `track('open_showcase', { id, where })`.
- **Needs:** nothing (no account, no network for the document; pictures and the shop's web fonts load from the internet; the shop's live data needs the API only after export).
- **How it works:**
  1. `ShowcasePicker` (`src/features/showcase/ShowcasePicker.tsx`) lists `SHOWCASES` (`catalog.ts`).
  2. The button calls `item.build()`: each example's `index.ts` calls `buildSite(spec)` (`site.ts`) with its CSS, pages, data sources and access.
  3. `buildSite`: parses home + footer, `toSite`, `addPage` for each page, `addSource` for each data source, marks the menu pages, adds the CSS of each widget found (`addWidgetCss`), `applyLayout` for the top bar and optionally `addAuthPages`.
  4. The shop and agency also post-process (live category choices; reusable "Team member" component with two looks).
  5. `PasteScreen` passes the document to `onOpen`; the editor opens it like any page.
- **Debug:**
  - Files: `src/features/showcase/*` (`site.ts`, `catalog.ts`, one folder per example).
  - Tests: `showcase.test.ts` (the gate each example must pass), `site.test.ts`, `catalog.test.ts`; e2e `e2e/showcase.mjs`, `e2e/showcase-behavior.mjs`.
  - A card opens an empty or broken site -> look at the example's `build()`; run `npx vitest run src/features/showcase` and read which check fails. A filter does nothing in Preview -> the list needs `data-ui-filterable="<name>"` and the filter `data-ui-for`/`data-ui-by` (see Search and filters). A picture is missing -> its https address no longer loads (the tests only check that it is an https address).

### Open a React project that Tweak did not make
- **What it does:** Opens a Vite + React project (for example one an AI wrote to the React prompt) in the editor: Tweak runs it, visits every page and turns the pages into a Tweak site you can change by clicking.
- **Where in the app:** The paste screen (Try it and a saved page): "Already have a React project?" -> **Open a .zip** or **Choose a folder**; then "Open it as a Tweak site", an animated progress screen, a result with the pages found, and **Open in the editor**.
- **Accepts (input):** a .zip or folder with package.json (React), index.html and src/main.tsx; the router created with `createBrowserRouter`; the signed-in person kept under the localStorage key `tweak:session` (to see members-only pages). node_modules, dist and pictures are skipped.
- **Produces (output / redirect):** a `PageDoc` site: first page with the app's header and footer as the shared layout, one page per address (a changing address like /shop/:id keeps one example), the pages in the header menu listed in the menu, members-only pages private, the app's CSS as page CSS and its fonts as links. Notes about what could not be read (pictures, `import.meta.glob`, pages that did not open). Pages are a snapshot: the project's own code does not carry over.
- **Needs:** internet (React and the project's libraries load from esm.sh); a project that follows the prompt's "SO THE PROJECT CAN BE OPENED IN TWEAK" rules; no account.
- **How it works:**
  1. `ReactProjectOpener.load` reads the files (showing `UploadProgress`, fed by the `onProgress` callback of `readZip` / `readFolder`); with no `.tweak` snapshot and `detectReactApp` ok it shows `AppProjectImport`.
  2. `importReactApp` (lazy) -> `compileProject` (Sucrase, import resolution, library list) -> `crawlApp`.
  3. `crawlApp` starts the app in a locked frame (`startRunner`: import map, module system, memory router), visits routes and links (`goto`, wait until calm, `capture`), repeats signed in for pages that redirected to the login.
  4. `crawlToDoc` builds the site (`toSite`, `addPage`, menu and private marks, CSS, fonts); `ImportProgress` shows the events while it runs.
- **Debug:**
  - Files: `src/features/importReact/*` (`compile.ts`, `externals.ts`, `runner.ts`, `runner/runtime.js`, `crawl.ts`, `toDoc.ts`, `importApp.ts`), `src/features/import/AppProjectImport.tsx`, `ImportProgress.tsx`, `progressState.ts`, `UploadProgress.tsx` (the animation while a .zip or folder is read), `readProject.ts`.
  - Tests: `importReact/engine.test.ts`, `toDoc.test.ts`, `import/progressState.test.ts`; e2e `e2e/react-import.mjs` (opens the sample app in `e2e/fixtures/ai-react-shop`: progress screen, 13 pages, members-only pages, Pages panel, Preview), `react-import-debug.mjs` (prints the status text).
  - "Failed to resolve module specifier" -> a library is missing from the import map (`externals.ts`). Stuck at "Starting your app" -> a library did not load (offline?) or the app threw at start: the message is shown. Few pages found -> links are not real `<a>` links, or the router is not `createBrowserRouter`. No members-only pages -> the session key is not `tweak:session`. Menu shows the wrong page highlighted -> the active state was captured from the home page.

### Terms of Use and Privacy Policy
- **What it does:** Two public pages that tell people the rules for using the app and what happens to their data.
- **Where in the app:** `/terms` and `/privacy`; links in the home page footer and under "Create account" on the sign-up page; each page has a table of contents and a link to the other.
- **Accepts (input):** nothing from the visitor; the operator's details from `.env` (`VITE_LEGAL_OPERATOR`, `VITE_LEGAL_EMAIL`, `VITE_LEGAL_COUNTRY`, `VITE_LEGAL_ADDRESS`).
- **Produces (output / redirect):** the formatted text with numbered sections; a dev-only note and visible `[… not set]` placeholders while a setting is empty; sections for paid plans and the marketplace only while those features are on; a static copy for crawlers (title, description, summary from `seoRoutes.ts`).
- **Needs:** nothing else (no account, no network).
- **How it works:**
  1. `TermsPage` / `PrivacyPage` render `LegalDocument` with `TERMS` / `PRIVACY` (`src/features/legal/terms/index.ts`, `privacy/index.ts`).
  2. `visibleSections` hides sections whose `when` feature is off (`features.enable_billing`, `features.enable_marketplace`).
  3. `Rich` (`text.tsx`) fills `{tokens}` from `legal.config.ts` and renders **bold** and links (links inside the app use the router).
  4. Plan limits, prices, fee and payout minimum are read from `PLANS` and the marketplace constants.
- **Debug:**
  - Files: `src/features/legal/*`, `src/config/legal.config.ts`, `src/config/seoRoutes.ts`.
  - Tests: `src/features/legal/legal.test.ts` (complete sections, valid tokens and links, every browser storage key listed, companies named, feature sections); e2e `e2e/legal.mjs`.
  - Placeholders show in production -> the `VITE_LEGAL_*` values were not set when the site was built. A test fails after adding a localStorage key -> add the key to the privacy policy's storage table. The Terms still mention payments after switching billing off -> check the flag value the build used.

## Accounts and platform

Developer reference for the account, storage, sharing, billing, analytics, docs and shipping features of Tweak.

- Account sign-in
- My pages (workspace)
- Autosave and the local draft
- Share, public pages, Explore and Make a copy
- Plans, limits and download counting
- Picture uploads and thumbnails
- Usage stats
- User guide, Home page and Try playground
- Developer docs page (`/dev`)
- Feature flags and settings
- Build, checks and shipping

Common facts: Firebase code is only reached through lazy imports (bundle rule in `.claude/skills/firebase-data/SKILL.md`); Firestore Lite (`firebase/firestore/lite`) is used, never the full SDK; collection names live in `src/lib/collections.ts` (`tweak_users`, `tweaks_projects`, `tweaks_project_content`, `tweaks_components`) and are repeated in `firestore.rules` and `firestore.indexes.json`.

### Account sign-in
- **What it does:** Lets a person create an account or sign in (email and password, Google, GitHub) so they can save, share and download counted pages. Private screens send signed-out people to the sign-in page and back.
- **Where in the app:** `/login`, `/signup`, `/reset` (pages `LoginPage`, `SignupPage`, `ResetPasswordPage`); the avatar menu (`AccountMenu`) has "Sign out".
- **Accepts (input):** email, password, optional "Your name" (sign-up), an OAuth button click. Optional `?next=/path`; only paths that start with `/` and not `//` are followed (`useAfterSignIn`).
- **Produces (output / redirect):** `useAuthStore` becomes `{ user, status }` (`loading | signedIn | signedOut | unconfigured`); a profile doc `tweak_users/{uid}` (plan `free`, `projectCount` 0); redirect to `next` or `/projects`. Plain-language errors from `friendlyAuthError`; closed popups are silent (`isCancelled`). The localStorage hint `tweak:signed-in` (`wasSignedIn()`) lets light pages say "My pages".
- **Needs:** all `VITE_FIREBASE_*` values (`isFirebaseConfigured` needs at least `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_PROJECT_ID`); network; flag `enable_oauth` for the Google/GitHub buttons (`OAuthButtons`). Without keys, `AuthCard` shows "Accounts aren't switched on yet" and status is `unconfigured`.
- **How it works:**
  1. `router.tsx` `privatePage()` wraps a screen in `RequireAuth`, which runs `startAuth()` and shows `PageSpinner` while status is `loading`.
  2. `startAuth()` (`auth.store.ts`) dynamically imports `authService.ts` once and calls `watchAuth`, which wraps Firebase `onAuthStateChanged`.
  3. On each change `watchAuth` maps the user with `toAppUser`, calls `ensureUserProfile` (self-heal), `identifyUser`, then the callback sets the store and `rememberSignedIn`.
  4. Forms call `useAuthAction().run(...)` -> `authService().signInWithEmail / signUpWithEmail / signInWithProvider`, each followed by `ensureUserProfile` and a `track('login' | 'sign_up')`.
  5. `ensureUserProfile` (`userProfile.ts`) is one `runTransaction`: creates the profile, or only adds `projectCount: 0` (and `plan: 'free'` if absent) to a doc another app made.
  6. Not signed in: `RequireAuth` returns `<Navigate to="/login?next=...">`; `useRedirectIfSignedIn` skips the sign-in page when already signed in.
  7. Other services get a token with `getIdToken()` (used by the uploads Worker).
- **Debug:**
  - Files: `src/features/auth/*` (`auth.store.ts`, `authService.ts`, `userProfile.ts`, `authErrors.ts`, `components/useAuthAction.ts`, `RequireAuth.tsx`), `src/lib/firebase.ts`, `src/lib/firebaseConfig.ts`.
  - Tests: no unit test for auth itself; `tests/rules/appFlow.test.ts` runs the real `ensureUserProfile` against the emulator (`npm run test:rules`); `tests/rules/firestore.rules.test.ts` "users". E2E: `e2e/auth.mjs` (forms, or the "not configured" notice), `e2e/auth-pages.mjs` (this is the sign-in PAGES template for sites, not the app login).
  - Inspect: `useAuthStore.getState()`, localStorage `tweak:signed-in`, console warning "Profile check failed:".
  - Spinner forever -> `startAuth()` never ran or Firebase config is wrong (`isFirebaseConfigured`). "permission-denied" on first New page -> profile missing or shared-project doc without `projectCount` (see `repairProfile()` in `firestore.rules`). Sign-in page shows only a notice -> `.env` has no Firebase keys. No Google/GitHub buttons -> `enable_oauth` is false.

### My pages (workspace)
- **What it does:** Lists the person's saved pages, shows how many slots are used, and creates, renames, makes public/private and deletes pages.
- **Where in the app:** `/projects` ("Your pages" screen, `DashboardPage`), `/projects/new` ("New page", `NewProjectPage`), cards with Rename / Make public / Delete buttons, the "New page" tile.
- **Accepts (input):** pasted code on the paste screen (a `PageDoc`), optionally the saved "Try it" draft ("Save the page from Try it"); rename text; delete confirmation.
- **Produces (output / redirect):** Firestore docs `tweaks_projects/{id}` and `tweaks_project_content/{id}` and `tweak_users/{uid}.projectCount`; redirect to `/edit/:id` after create; toasts such as "You've reached N saved pages." (`ProjectLimitError`) or a size message (`ProjectTooBigError`); the "You've used all N page slots." banner.
- **Needs:** sign-in; Firebase; plan limits (`features/billing/plans.ts`, `maxProjects()` in `firestore.rules`); deployed `firestore.rules`.
- **How it works:**
  1. `DashboardPage` calls `listMyProjects(uid)` (filter `ownerId ==`, sorted in the app: no custom index) and `getUsage(uid)`; `canCreate = used < planFor(plan).maxProjects`.
  2. "New page" -> `NewProjectPage.create` -> `createProject(user, doc, remixOf = null)` in `workspace/api/projectMutations.ts`.
  3. `createProject`: `ensureUserProfile`, read the profile, throw `ProjectLimitError` (and `track('page_limit_reached')`) when full.
  4. One `writeBatch`: set project meta, set content (`serializeDoc`), update `users/{uid}` with `increment(1)` and `lastProjectOp = id`; commit; `track('page_create')`.
  5. `deleteProject(uid, id)` is one batch too: delete content and project, `increment(-1)`, `lastProjectOp = id`.
  6. `firestore.rules` `countUp` / `countDown` accept the counter change only if the project appears or disappears in the same batch (`existsAfter`, `getAfter`), within `maxProjects`.
  7. `ProjectGrid` updates the list optimistically; `onDeleted` reloads usage.
- **Debug:**
  - Files: `src/features/workspace/*` (`DashboardPage.tsx`, `NewProjectPage.tsx`, `api/projectMutations.ts`, `api/projectQueries.ts`, `api/refs.ts`, `components/*`), `firestore.rules`, `firestore.indexes.json`.
  - Tests: `tests/rules/firestore.rules.test.ts` (creates with counter, refuses 11th page, refuses uncounted create), `tests/rules/appFlow.test.ts`; run `npm run test:rules` (needs Java and `firebase-tools`). No e2e spec opens the dashboard (they run without Firebase); `e2e/live/firestore.mjs` is a manual smoke test against a real project, not part of `npm run e2e`.
  - Inspect: Firestore console `tweak_users/{uid}` (`projectCount`, `lastProjectOp`), network calls in devtools.
  - Create fails with permission-denied -> counter not in the same batch, profile missing, or deployed rules older than the code. Count is off by one -> something updated `projectCount` outside the batch (never do that). "failed-precondition" in the gallery -> the `isPublic + updatedAt` index is not deployed. Limits differ between UI and server -> `plans.ts` and `firestore.rules` not in step.

### Autosave and the local draft
- **What it does:** Saves the page a moment after the last edit: to the account for saved pages, to this browser for "Try it". It also warns before leaving with unsaved changes.
- **Where in the app:** The save indicator in the editor top bar (`SaveIndicator`), Ctrl/Cmd+S (`useSaveShortcut`), "Move pictures out of the code" button when a save is too big.
- **Accepts (input):** every change to `useDocStore` (`version` and `doc` change); `AUTOSAVE_DELAY_MS` = 1500 ms (`config/app.config.ts`).
- **Produces (output / redirect):** `useSaveStore` status (`idle | unsaved | saving | saved | error`) plus a `problem` text; Firestore `tweaks_project_content/{id}.doc` and `updatedAt` / `name` on the project; localStorage `tweak:try-draft` for Try it; a once-only error toast for friendly errors.
- **Needs:** sign-in and network for account saves; Firestore size limit (`MAX_DOC_CHARS` = 900,000 characters in `projectContent.ts`); `CompressionStream` in the browser to gzip (falls back to plain JSON).
- **How it works:**
  1. The page passes its own save function: `ProjectEditorPage` passes `saveProjectContent` (and `useThumbnail`), `PlaygroundPage` passes `saveLocalDraft`; both call `useAutosave(save, where)`.
  2. `useAutosave` subscribes to `useDocStore`; each change sets `unsaved` and (re)starts a timer.
  3. When the timer fires, `run()` sets `saving`, calls the save function with the current doc, then `saved`.
  4. `saveProjectContent` -> `serializeDoc` -> `packDoc` (`packValue`: JSON; above `MIN_TO_SQUEEZE` = 20,000 characters gzip + base64 with the prefix `gz1:` when smaller) -> size check.
  5. Too big: `ProjectTooBigError` (`friendly = true`) built with `tooBigAdvice(sizeReport(doc))` (`model/embedded.ts`); `useAutosave` puts its message in `useSaveStore.problem` and toasts once.
  6. Loading: `loadProjectContent` -> `unpackDoc` reads both plain and `gz1:` text. `saveLocalDraft` throws a plain message when storage is full.
  7. On unmount a pending change is saved once more; `beforeunload` warns while `pending`.
- **Debug:**
  - Files: `src/features/editor/persistence/*` (`useAutosave.ts`, `save.store.ts`, `localDraft.ts`, `useSaveShortcut.ts`), `src/features/workspace/api/projectContent.ts`, `packDoc.ts`, `types.ts`, `src/features/editor/toolbar/SaveIndicator.tsx`, `src/features/assets/movePictures.ts`.
  - Tests: `packDoc.test.ts`, `projectContent.test.ts`; e2e `e2e/too-big.mjs` (real Chrome gzip round trip, "Too big to save" indicator, move-pictures offer).
  - Inspect: `useSaveStore.getState()`, `localStorage['tweak:try-draft']`, `console.error` from `run()`.
  - Indicator stuck on error with the "check your connection" wording -> the error has no `friendly` flag (a network or rules failure). "This browser can't open this saved page." -> `DecompressionStream` missing. Page never saved -> pages that call `useAutosave` with an unstable `save` are fine (ref is updated), but check the doc `version` actually changes. Reload loses Try-it work -> localStorage blocked (`saveLocalDraft` error).

### Share, public pages, Explore and Make a copy
- **What it does:** An owner can make a page public: anyone with the link can view it, it appears in Explore, and others can make their own private copy.
- **Where in the app:** Editor top bar "Share" (`ShareDialog`, "Share this page"), card buttons Make public / Make private on My pages, `/gallery` ("Explore pages"), `/p/:projectId` (public view, "Make my own copy" or "Edit" for the owner).
- **Accepts (input):** the Share switch ("Anyone with the link can see it"); a click on "Show more" (24 per page); "Make my own copy".
- **Produces (output / redirect):** `isPublic` changed on both `tweaks_projects/{id}` and `tweaks_project_content/{id}`; the link `<origin>/p/<id>` (`publicLink`); a copy via `createProject(user, doc, projectId)` with title `"<title> (my copy)"` and `remixOf` = the source id; redirect to `/edit/<newId>` with toast "Copied to your pages". Signed-out visitors are sent to `/login?next=/p/<id>`. Public pages are `noindex` unless `INDEX_SHARED_PAGES` (`config/seo.config.ts`, currently `false`) is true.
- **Needs:** flag `enable_gallery` (hides the Explore link on the dashboard), Firebase, the composite index `isPublic + updatedAt` in `firestore.indexes.json`, sign-in for copying.
- **How it works:**
  1. Share toggle -> `setProjectPublic(id, isPublic)` (`projectMutations.ts`): one `writeBatch` updating project and content (the mirror lets read rules avoid an extra `get()`); `track('share')`.
  2. `firestore.rules`: content `update` requires `isPublic == getAfter(projectPath).data.isPublic`; reads allow `isPublic == true` or the owner.
  3. Explore: `GalleryPage` -> `listPublicProjects(afterUpdatedAt)` (where `isPublic == true`, `orderBy updatedAt desc`, `limit 24`, cursor = last `updatedAt`).
  4. `PublicPageView` -> `loadPublicPage` (`getProjectMeta` + `loadProjectContent`); not shared or missing shows "This page isn't shared".
  5. The page runs in `SafePageFrame` (sandbox without `allow-same-origin`); there is no direct download here, visitors copy first.
  6. `useMakeCopy.makeCopy` -> `createProject(user, copy, projectId)` (counts against the visitor's page limit; `ProjectLimitError` / `ProjectTooBigError` become toasts).
- **Debug:**
  - Files: `src/features/gallery/*` (`GalleryPage.tsx`, `PublicPageView.tsx`, `useMakeCopy.ts`), `src/features/workspace/components/ShareDialog.tsx`, `projectMutations.ts`, `projectQueries.ts`, `src/features/export/SafePageFrame.tsx`.
  - Tests: `tests/rules/firestore.rules.test.ts` ("hides private projects from others but shows public ones", "never lets someone else edit or take over a project"); e2e `e2e/gallery.mjs` (graceful failure without Firebase; empty state, unknown page message), `e2e/live/firestore.mjs` (manual, real project).
  - Inspect: both docs' `isPublic` in the Firestore console; network errors on `/gallery`.
  - Gallery shows "We couldn't load pages right now" -> missing index or rules not deployed. Public link says "This page isn't shared" -> project private, or the two `isPublic` values differ (a write bypassed `setProjectPublic`). "Make my own copy" fails with a limit message -> visitor has no free slot. Page scripts misbehave in the public view -> sandbox is `allow-scripts` only by design; never add `allow-same-origin`.

### Plans, limits and download counting
- **What it does:** Free accounts get 10 saved pages and 10 downloads per page per month; Pro (development only for now: pay with crypto through `workers/billing`, one month per payment) has 100 pages and unlimited downloads until `planUntil`. Each download or code copy of a saved page uses one allowance.
- **Where in the app:** The Download dialog ("Download your page", `ExportDialog`, with `DownloadsLeft` / `SignInToDownload` notices); the usage meter on My pages; `/plans` only when `enable_billing` is on.
- **Accepts (input):** a click on a download format in a saved page; plan from `tweak_users/{uid}.plan`.
- **Produces (output / redirect):** `downloadPeriod` (UTC `YYYYMM`) and `downloadCount` on `tweaks_projects/{id}`; the file only after counting; toast "Sorry - ..." with `DownloadLimitError` ("You've used this page's N downloads for this month."); `track('download')` / `track('download_blocked')`. Try it uses the `signin` gate instead (account needed).
- **Needs:** sign-in; Firebase; `PLANS` in `src/features/billing/plans.ts` kept equal to `maxProjects()` / `maxDownloads()` in `firestore.rules`; defaults in `config/app.config.ts`. `plan` is never client-writable; Upgrades come only from `workers/billing` after a confirmed NOWPayments callback (`tweaks_payments`, `planUntil`); `payments.ts` only starts a checkout (needs `VITE_BILLING_URL`). An ended Pro counts as Free (`planOf` in the rules, `effectivePlan` in the app).
- **How it works:**
  1. `ProjectEditorPage` calls `useDownloadGate(id)` -> `readDownloadUsage` (transaction read) -> `{ kind: 'counted', status, used, max, resetsOn, consume }`.
  2. `ExportDialog.run`: `prepare(scope)` first, then `gate.consume()`, then `deliver()`: a failed export never uses a download.
  3. `consume` -> `recordDownload(projectId, uid)` (`api/downloads.ts`): a transaction that reads the project and user, throws `DownloadLimitError` if `used >= max`, else updates `downloadPeriod` and `downloadCount: used + 1`.
  4. `firestore.rules` `countDownload()` allows only the owner, `+1`, same-month logic via `thisMonth()` (`request.time`, UTC) and `<= maxDownloads(plan)`; project create must not carry download fields.
  5. `downloadsBlocked(gate)` disables the buttons when loading or `remainingDownloads` is 0.
  6. If the usage read fails, `status` is `unknown` and the server decides on click.
- **Debug:**
  - Files: `src/features/billing/plans.ts`, `payments.ts`, `PlansPage.tsx`, `src/features/workspace/api/downloads.ts`, `useDownloadGate.ts`, `src/features/export/downloadGate.ts`, `ExportDialog.tsx`, `firestore.rules`.
  - Tests: `src/features/workspace/api/downloads.test.ts` (UTC month, reset); `tests/rules/downloads.test.ts` (limit of 10, no skipping, new month, Pro unlimited, other users, no made-up count); `src/features/billing/plans.test.ts`, `payments.test.ts`, `workers/billing/src/billing.test.ts`; e2e `e2e/flags.mjs` (`/plans` and `/market` exist in dev and are hidden in a production build: see the file's header), `e2e/export.mjs` for the dialog.
  - Inspect: project doc `downloadPeriod` / `downloadCount`; localStorage `tweak:e2e-open-downloads` (only honoured in `vite dev`) opens the Try-it gate for tests.
  - Count says "used" on one device but not another -> `consume` failure refreshes usage; check the transaction. Rules refuse a download the UI allowed -> limits drifted between `plans.ts` and `firestore.rules`, or clock/UTC month mismatch. Download buttons stay disabled -> gate `status` is `loading` (usage read pending).

### Picture uploads and thumbnails
- **What it does:** Stores pictures people add (and each saved page's card thumbnail) in Cloudflare R2 through a small Worker; without it, small pictures are embedded in the page.
- **Where in the app:** Quick actions "Change picture" and the Picture section ("Use a picture from my computer", `PictureFileButton`); the "Move pictures out of the code" button in the save indicator; thumbnails show on My pages and Explore cards.
- **Accepts (input):** a PNG, JPG, WebP, GIF or AVIF file up to 5 MB (client and Worker); a body of raw bytes with `Authorization: Bearer <Firebase ID token>` to `POST /upload?kind=image` or `?kind=thumbnail&project=<id>`.
- **Produces (output / redirect):** JSON `{ url }` with status 201 (`<worker>/a/<key>`); keys `u/<uid>/<random>.<ext>` or `thumbs/<uid>/<project>.<ext>` (thumbnail gets `?v=<time>`); errors 401 "Please sign in again.", 415 "Only PNG, JPG, WebP, GIF or AVIF pictures.", 413 "Pictures can be up to 5 MB.", 400 "Missing project."; `setProjectThumbnail` writes `thumbnailUrl`.
- **Needs:** `VITE_ASSETS_URL` (the deployed Worker, not an `r2.dev` address: `enable_uploads` stays false for that and `features.config.ts` warns in dev); signed-in user; Worker vars `FIREBASE_PROJECT_ID` and `ALLOWED_ORIGINS` plus the R2 binding `ASSETS` (`workers/assets/wrangler.toml`); library `jose` in the Worker.
- **How it works:**
  1. `pictureFromFile(file)` (`assets/uploadImage.ts`) checks type, then if `canUpload()` (flag and `status === 'signedIn'`) calls `uploadImage`.
  2. `uploadImage` gets `authService().getIdToken()` and POSTs the blob; `track('picture_add')`.
  3. Worker `index.ts` routes: `OPTIONS` (CORS via `corsHeaders`), `POST /upload` -> `handleUpload`, `GET /a/<key>` -> `serveAsset`.
  4. `handleUpload` (`workers/assets/src/upload.ts`): `verifyFirebaseUser` (`auth.ts`: `jwtVerify` against Google's securetoken JWKS, issuer and audience = project id) -> type allow-list (SVG refused: it can carry scripts) -> size checks -> `safeSegment` for the project id -> `ASSETS.put` with cache headers.
  5. `serveAsset` sets `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none'; img-src 'self'`, and `Access-Control-Allow-Origin: *` (images are public).
  6. Fallback: network `TypeError` or uploads off -> embed as a data address if the file is under `MAX_EMBED_BYTES` (400 KB), else a plain message.
  7. Thumbnails: `useThumbnail(projectId)` (after saves, throttled to 2 minutes, `force` on Ctrl+S) -> `capturePng(null, { pixelRatio: 0.35, topOnly: true })` -> `uploadImage(..., { kind: 'thumbnail' })` -> `setProjectThumbnail`; failures only `console.warn('Thumbnail skipped:', ...)`.
- **Debug:**
  - Files: `src/features/assets/*` (`uploadImage.ts`, `PictureFileButton.tsx`, `movePictures.ts`), `src/features/workspace/useThumbnail.ts`, `workers/assets/src/{index,upload,auth,http}.ts`, `workers/assets/wrangler.toml`.
  - Tests: `src/features/assets/uploadImage.test.ts` (embed, SVG refusal, too big); e2e `e2e/assets.mjs`, `e2e/too-big.mjs`. Worker has no tests: check with `cd workers/assets && npm run check`.
  - Inspect: devtools Network for `/upload` status and body; the Worker's `wrangler dev` / Cloudflare logs.
  - Pictures become inline data -> `VITE_ASSETS_URL` empty or an `r2.dev` address, or not signed in. Upload fails in the browser but the Worker is up -> origin missing from `ALLOWED_ORIGINS` (no CORS headers returned). 401 "Please sign in again." -> `FIREBASE_PROJECT_ID` differs from the app's Firebase project, or token expired. No card pictures -> upload disabled or `capturePng` failed (see console "Thumbnail skipped").

### Usage stats
- **What it does:** Sends anonymous counts of what people use (screens, edits, downloads, errors, speed) so the team knows what to improve, never page content or typed text.
- **Where in the app:** The avatar menu item "Share usage stats: on/off" (`UsageStatsToggle`); otherwise no UI.
- **Accepts (input):** calls `track(name, params)` with names and typed params from `analytics/events.ts`; `identifyUser(uid, plan)`; the person's switch; browser Do Not Track / Global Privacy Control.
- **Produces (output / redirect):** Firebase Analytics (GA4) events, one `page_view` per screen with ids removed (`/edit/:projectId`), `exception` events (max 10 per visit), `web_vital` events (CLS x1000, INP, LCP, FCP, TTFB); Vercel Web Analytics page views in production; localStorage `tweak:analytics` = `off` when opted out.
- **Needs:** `VITE_FIREBASE_MEASUREMENT_ID` (`isAnalyticsConfigured`); a production build, or `VITE_ANALYTICS_IN_DEV=1` in `vite dev`; never in tests (`MODE === 'test'`); library `web-vitals`, `@vercel/analytics`.
- **How it works:**
  1. `App` runs `startAutoTracking(router)` (`autoTrack.ts`): `trackPageViews`, `trackErrors`, `startWebVitals`.
  2. `track()` (`track.ts`) returns at once unless `sending()` (`ACTIVE && analyticsAllowed()`).
  3. First use waits for browser idle, then dynamically imports `analyticsClient.ts` (own chunk `firebase-analytics`) and `startAnalytics`.
  4. `startAnalytics` checks `isSupported()`, sets Consent Mode v2 (analytics granted; ad storage, user data, personalization denied), `initializeAnalytics` with `send_page_view: false`.
  5. `identifyUser` sets user id and `signed_in` / `plan` properties; `getUsage` supplies the plan.
  6. `setUsageStats(on)` saves the opt-out via `saveOptOut` and calls `setEnabled` on the client.
  7. `VercelAnalytics` (production only) filters events through `beforeSend` (`withoutIds`, `analyticsAllowed`).
- **Debug:**
  - Files: `src/features/analytics/*`, `src/lib/firebaseConfig.ts`, `src/app/App.tsx`, `src/features/auth/components/AccountMenu.tsx`; rules for new events in `.claude/skills/add-feature/SKILL.md` section 5b.
  - Tests: `src/features/analytics/analytics.test.ts` (`screenPath`, consent, `withoutIds`). No e2e spec targets analytics.
  - Inspect: localStorage `tweak:analytics`; set `VITE_ANALYTICS_IN_DEV=1` and use GA DebugView; check the `firebase-analytics` chunk loads in Network.
  - No events in dev -> by design (needs `VITE_ANALYTICS_IN_DEV=1`). No events in production -> measurement id empty, DNT/GPC on, or ad blocker (the client load is caught and ignored). Toggle missing from the menu -> `usageStatsAvailable` false or the browser says no tracking. A new event type fails typecheck -> add it to `events.ts` first.

### User guide, Home page and Try playground
- **What it does:** The guide explains every feature in plain words (quick and full versions); the Home page sells the product; "Try it" lets anyone paste or start from an example and edit without an account.
- **Where in the app:** `/guide` (Quick guide), `/guide/full` (Full guide with search and `#topic` links), `/` (Home), `/try` (paste screen, then editor with "Paste new code", "Save to an account", Download).
- **Accepts (input):** guide search words; pasted code or "Try an example page" / "Continue my last page" on `/try`; guide data in `features/guide/content/*.ts` made of blocks (`p`, `steps`, `list`, `tip`, `note`, `figure`, `table`).
- **Produces (output / redirect):** guide topics and pictures (`public/guide/art-<topic id>.svg`, real screenshots `public/guide/ui-*.png`); Try it saves to localStorage `tweak:try-draft`; downloads need an account (`playgroundGate` gives the `signin` gate; "Save to an account" goes to `/signup?next=%2Fprojects%2Fnew`, where the draft can be saved as a page).
- **Needs:** none for the guide or Home; `/try` needs no sign-in; SEO lines for these routes are in `config/seoRoutes.ts`.
- **How it works:**
  1. `GROUPS` in `guideContent.ts` lists the groups (START, RECIPES, TOUR, LOOKS, WEBSITE, ACCESS, FORMS, DATA, INTERACTIVE, WIDGETS, CODE, HELP); `QUICK_STEPS` links to topics.
  2. `GuidePage` shows `QuickGuide` or `FullGuide` by pathname; `searchGuide(query)` requires every word to appear in `searchText`; `topicHref(id)` = `/guide/full#id`.
  3. Every topic's first block is a `figure`; the SVGs are generated by `node scripts/guide-art/index.mjs` (one file per group, helpers in `kit.mjs`); real screenshots come from `e2e/guide-shots.mjs`.
  4. `HomePage` renders `homeContent.ts` (`FEATURES`, `STEPS`, `DOWNLOADS`, `AUDIENCE`, `AI_NAMES`) and `HeroMock`; top bar shows "My pages" when `wasSignedIn()`.
  5. `PlaygroundPage`: `PasteScreen where="try"` -> `saveLocalDraft(doc)` + `openDocument(doc)` -> `PlaygroundEditor` with `useAutosave(saveLocalDraft, 'in this browser')`.
- **Debug:**
  - Files: `src/features/guide/*`, `scripts/guide-art/*`, `public/guide/`, `src/features/home/*`, `src/features/editor/pages/{PlaygroundPage,playgroundGate}.tsx`, `src/config/seoRoutes.ts`.
  - Tests: `src/features/guide/guideContent.test.ts` (unique ids, brief per topic, search, picture exists); e2e `e2e/guide.mjs` (search, `#topic` scroll), `e2e/guide-shots.mjs` (regenerates pictures; excluded from `npm run e2e`), `e2e/project-kind.mjs` (paste screen choices on `/try`), `e2e/seo.mjs`.
  - A topic test fails on "picture exists" -> run `node scripts/guide-art/index.mjs` or add the id to a `scripts/guide-art` set. Search finds nothing -> text not in `summary`, `brief` or blocks. Anchor link does not scroll -> topic `id` mismatch with `#hash`. Try-it work lost on reload -> localStorage blocked.

### Developer docs page (`/dev`)
- **What it does:** A development-only reference inside the app: overview facts, workflow diagrams, architecture, code reference read from the source, rules and history.
- **Where in the app:** `http://localhost:<port>/dev` while running `npm run dev`. Tabs: Overview, Workflow, Features, Architecture, Code reference, Rules, History, README. Nothing links to it.
- **Accepts (input):** `?tab=` query value; choice of a skill under Rules; files of the repo read through `import.meta.glob`.
- **Produces (output / redirect):** rendered pages only. In a production build there is no route and no chunk; `DevDocsPage` also returns the not-found page when `!import.meta.env.DEV`; the route is `noindex`.
- **Needs:** the Vite dev server; files under `docs/`, `.claude/skills`, `src`, `e2e`, `docs/diagrams`. The Features tab loads `docs/FEATURES.md`; I did not find that file in `docs/` (only `ARCHITECTURE.md`, `HISTORY.md`, `WORKFLOW.md`), so that tab is empty until it exists.
- **How it works:**
  1. `router.tsx` adds `/dev` only inside `...(import.meta.env.DEV ? [...] : [])`.
  2. `DevDocsPage` picks the tab and loads docs with `readFile(DOC_FILES, ...)` from `docsFiles.ts`.
  3. `docsFiles.ts` holds the globs: `DOC_FILES`, `README`, `SKILLS`, `SOURCES`, `TEST_FILES`, `E2E_SPECS`, `SMALL_FILES`, and diagram maps `DIAGRAM_SVG` / `DIAGRAM_PNG` / `DIAGRAM_SOURCE`.
  4. `markdown.tsx` reads markdown; `codeIndex.ts` extracts exports with the comment above each; `overviewData.ts` gives `parseRoutes`, `parseFlags`, `parseEnv` (settings come from `src/vite-env.d.ts`, since Vite will not serve `.env*`).
  5. `WorkflowView.tsx` `DIAGRAMS` lists 12 diagrams; each needs a `docs/diagrams/<id>.mmd` and its `.svg` / `.png`, drawn by `node scripts/diagrams/render.mjs` (needs Chrome and internet for the Mermaid script).
  6. After `vite build`, searching `dist` for "Tweak developer docs" must find nothing.
- **Debug:**
  - Files: `src/dev/*`, `src/app/router.tsx`, `docs/diagrams/`, `scripts/diagrams/render.mjs`.
  - Tests: `src/dev/dev.test.ts` (code reference, markdown reader, overview facts); e2e `e2e/dev-docs.mjs` (opens in dev, noindex, 12 diagrams, no links from Home or Guide).
  - A diagram shows blank -> missing `.svg` (re-run the render script) or no `DIAGRAMS` entry. Routes table wrong -> `parseRoutes` expects one `{ path: '...' ...}` per line in `router.tsx`. A setting is missing from Overview -> it is not declared in `vite-env.d.ts`. Not-found at `/dev` -> production build or `vite preview`.

### Feature flags and settings
- **What it does:** Flags switch whole features on or off; `VITE_*` settings point the app to Firebase, the uploads Worker, analytics and the public site address.
- **Where in the app:** no UI (edit `src/config/features.config.ts`, `.env`, or the host's environment variables); the `/dev` Overview tab lists them.
- **Accepts (input):** flags `enable_oauth` (true), `enable_gallery` (true), `enable_uploads` (true when `VITE_ASSETS_URL` is set and not an `r2.dev` address), `enable_billing` (false), `enable_marketplace` (false). Settings declared in `src/vite-env.d.ts`: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`, `VITE_ANALYTICS_IN_DEV`, `VITE_ASSETS_URL`, `VITE_SITE_URL`. A template is `.env.example`.
- **Produces (output / redirect):** flagged routes return the not-found page while off (`flagged()` in `router.tsx`: `/plans`, `/market`); links check `features.enable_x`; accounts show the "not switched on" notice without Firebase keys; `VITE_SITE_URL` enables canonical links, share pictures and `sitemap.xml` in the build.
- **Needs:** values are inlined into the public bundle at build time (identifiers, not secrets); rebuild or restart the dev server after changing them.
- **How it works:**
  1. `features.config.ts` exports `features` (`as const`) and `FeatureName`.
  2. `firebaseConfig.ts` reads `import.meta.env.VITE_FIREBASE_*` and exposes `isFirebaseConfigured` and `isAnalyticsConfigured`.
  3. `router.tsx` `flagged(flag, element)` picks the real page or `NotFoundPage`.
  4. UI checks flags directly (`OAuthButtons`, `DashboardPage`, `AccountMenu`, `canUpload`).
  5. `vite.config.ts` reads `VITE_SITE_URL` with `loadEnv` for `seoPlugin`.
  6. A new flag: `enable_<name>` with a doc comment (the Overview parser reads the comment above it), future features default `false` (rule in `add-feature` skill). A new setting: declare it in `vite-env.d.ts` with a comment, add to `.env.example`, update README.
- **Debug:**
  - Files: `src/config/features.config.ts`, `src/config/app.config.ts`, `src/vite-env.d.ts`, `.env.example`, `src/lib/firebaseConfig.ts`, `src/app/router.tsx`.
  - Tests: `src/dev/dev.test.ts` ("overview facts": `parseFlags`, `parseEnv`); e2e `e2e/flags.mjs`.
  - Inspect: dev console warning "[uploads] VITE_ASSETS_URL is an r2.dev bucket address..."; `import.meta.env` in devtools.
  - Change has no effect -> dev server not restarted, or the host (Vercel) lacks the variable at build time. Uploads silently off -> `VITE_ASSETS_URL` empty or an `r2.dev` address. Sitemap/canonical missing -> `VITE_SITE_URL` unset (build prints a `[seo]` warning).

### Build, checks and shipping
- **What it does:** The commands and workflow that check a change and produce the deployable site: type check, lint, unit tests, production build, browser checks and rules tests.
- **Where in the app:** no UI (terminal). Workflow rules: `.claude/skills/add-feature/SKILL.md`; diagram "Building and shipping" (`docs/diagrams/08-build.mmd`).
- **Accepts (input):** commands from `package.json`: `npm run dev`, `build` (`tsc -b && vite build`), `typecheck`, `lint`, `test` (`vitest run`), `preview`, `e2e` (`node e2e/run.mjs`), `test:rules` (`firebase emulators:exec --only firestore "vitest run --config vitest.rules.config.ts"`); env `E2E_URL`, `CHROME_PATH`.
- **Produces (output / redirect):** `dist/` with static per-route pages, `robots.txt` and, with `VITE_SITE_URL`, `sitemap.xml`; screenshots in `e2e/screenshots/`; pass/fail exit codes.
- **Needs:** Node; local Chrome for e2e (`playwright-core`, default `C:/Program Files/Google/Chrome/Application/chrome.exe`); Java and `firebase-tools` for rules tests (portable-JRE recipe in the `firebase-data` skill); Vercel (`vercel.json`: SPA rewrite for everything except `/assets/`, immutable cache on `/assets/*`); `firebase.json` for rules, indexes and emulators.
- **How it works:**
  1. Branch per feature (`git checkout -b feature/<name>`), small commits, each passing `tsc` and `eslint`.
  2. Verify in this order: `npx tsc -b`, `npx eslint .` (ESLint enforces `max-lines` 150 and `max-lines-per-function` 100), `npx vitest run` (`src/**/*.test.ts`, jsdom), `npx vite build`.
  3. For UI: `npx vite --port 5317` in the background, then `npm run e2e`; `e2e/run.mjs` runs every `e2e/*.mjs` except `run.mjs`, `browser.mjs` and `guide-shots.mjs`, and exits 1 if any fails. Shared helpers (`openPage`, `openExample`, `check`) are in `e2e/browser.mjs`.
  4. Rules change: add a case in `tests/rules/*.test.ts` and run `npm run test:rules` (config `vitest.rules.config.ts`, files not run by plain `vitest run`).
  5. `vite build` also runs `seoPlugin` (`scripts/seo/vitePlugin.ts`) in `closeBundle`; chunks are split in `vite.config.ts` `manualChunks` (`firebase`, `firebase-analytics`, `konva`, `quill`, `codemirror`).
  6. Bundle checks: `grep -c firebase- dist/index.html` must print `0`; "Tweak developer docs" must not appear in `dist`.
  7. Other scripts: `node scripts/guide-art/index.mjs` (guide SVGs), `node scripts/diagrams/render.mjs` (diagram images), `scripts/seo/make-images.mjs` (share pictures); Worker: `cd workers/assets && npm run check` / `npm run deploy`.
  8. Records: update `docs/HISTORY.md` (entry at top), `docs/ARCHITECTURE.md`, `README.md` and the skills when relevant; merge with `git merge --no-ff`; commit messages are plain conventional commits without AI attribution trailers (repo rule in `CLAUDE.md`).
- **Debug:**
  - Files: `package.json`, `vite.config.ts`, `eslint.config.js`, `vitest.rules.config.ts`, `vercel.json`, `firebase.json`, `e2e/run.mjs`, `e2e/browser.mjs`, `scripts/*`.
  - Tests: all `src/**/*.test.ts`; `tests/rules/*.test.ts`; e2e specs in `e2e/*.mjs`.
  - e2e fails to connect -> dev server is not on port 5317 (or set `E2E_URL`). e2e cannot launch -> Chrome not at the default path (set `CHROME_PATH`). ESLint "max-lines" -> split the file, do not raise the limit. `test:rules` fails to start -> Java or `firebase-tools` missing. Deep link 404 on the host -> SPA rewrite in `vercel.json` not applied. Chunk-size warning -> new heavy import landed in the first load; keep it lazy.
