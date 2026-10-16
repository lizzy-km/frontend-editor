---
name: editor-model
description: How frontend-editor's page model, renderer and edit precedence work — read before touching features/editor/model, store, actions or frame (parsing pasted code, tree ops, export, sandboxed editor frame and bridge, CSS layering, script safety).
---

# Editor model: rules that must hold

The full explanation is in `docs/ARCHITECTURE.md`. These are the invariants
that break things if you ignore them.

1. **The node map is immutable.** Never mutate a node. Tree helpers in
   `model/tree/treeOps.ts` return new maps, and unchanged nodes must keep the
   same object identity. The renderer and undo both depend on that.
2. **`children` is the only list of child nodes.**
3. **The root is the `<body>` node** (`doc.rootId`). It can't be deleted, moved or duplicated.
4. **The original CSS stays text.** Edits go to `node.styles[breakpoint]` and
   never back into `doc.css`, except through the Advanced/Code editor.
5. **Precedence:** pasted CSS goes inside `@layer page`; edits are doubled
   selectors, `.fe-<id>.fe-<id>` on export and `[data-fe-id]` doubled in the
   editor. Keep the editor and export specificity identical.
6. **Scripts and the frame:** the page's scripts run while editing, in a
   frame with `sandbox="allow-scripts"` only. **Never add
   `allow-same-origin`** (to the editor frame, Preview or the public view):
   page code would reach the app and the user's login. So the app can't touch
   the frame's DOM: everything goes through `frame/bridge.ts` via
   `askFrame` / `tellFrame` / `watchNode` (`frame.store`), handled by
   `frame/runtime/*.js` (plain JS, inlined with `?raw`). New DOM questions =
   a new runtime handler. `loadCapture` may only ever send the app's own
   bundled html-to-image, never page or user code.
7. **One edit = one `commit`.** Continuous inputs pass a `coalesceKey`.
8. **Export and the editor share the serializers** in `model/serialize`.
   Don't write a second HTML serializer.

9. **Canvas coordinates:** always convert through `canvas/geometry.ts` with a
   `FramePlacement`. Never mix iframe and overlay pixels by hand.
10. **Konva shapes that follow elements are positioned imperatively**
    (`DraggableBox`). Don't pass x/y/width/height as React props, because it
    breaks drag and resize.
11. **Drop rules** (`frame/runtime/drop.js`, called by `canvas/dropTarget.ts`): over a sibling, reorder; over a
    container, nest; over a leaf, go before or after it. Change them there
    only, and check them in the browser.
12. **Browser check:** tsc/vitest can't see canvas bugs. For canvas or text
    changes, start `npx vite --port 5317` and run `npm run e2e` (playwright-core
    on the local Chrome, scripts in `e2e/`). Add a check there for new canvas
    behavior. Every real canvas bug so far was only visible there.
13. **Konva events:** don't rely on Konva `dblclick`, because the target
    shape changes between clicks. Use `event.evt.detail >= 2` in `onClick`.
14. **Quill:** only elements passing `isTextEditable` may open in Quill.
    Save only when the output differs from Quill's first output. Keep
    `classSpan` registered or colored words lose their class.
    `survivesQuill` in `model/tree/textRules.ts` is the list of what Quill
    keeps exactly: bare formatting tags, plain links, and spans whose only
    attribute is a class. Anything else, SVG text included, falls back to
    the Words list. Add to it only after a round-trip test.
15. **Canvas wrappers use `overflow: clip`, never `hidden`.** A hidden box
    can be scrolled by code, and Chrome scrolls it when content inside the
    iframe calls `scrollIntoView()`. That shifts the page under the overlay
    and breaks hit-testing.
16. **Editor-only DOM state** (such as opening `<details>` so answers can be
    edited) is applied to the frame DOM, never to the model, and undone when
    the selection changes. Use the runtime's `mark` (turning a mark off
    restores the model's value). See `canvas/useRevealDetails.ts`.
17. **Code shown for editing uses `nodeToHtml(..., { forEditing: true })`.**
    It must parse back to the same nodes: desktop styles as inline
    `style`, and hidden elements as `data-fe-hidden`, which `domToNodes`
    turns back into `hidden`. Apply it through `actions/codeActions.applyHtml`
    (one commit). If you add node state that HTML can't express, warn before
    applying, the way `hasScreenSizeEdits` does.
    The whole-page source (`docToEditableSource`) must stay idempotent:
    source → parse → source is identical. Never put whitespace between body
    content, body scripts and `</body></html>`, because the parser moves it
    into the body.
18. **Test with real pages.** `e2e/fixtures/*.html` holds real AI output.
    When a pasted page misbehaves, add it there with a check in `e2e/`.
19. **AI prompt rules** (`features/prompts/promptRules.ts`) describe what
    the parser and frame handle best (breakpoints 1024/640, sections with
    id + class, real text, enhance-only JS). Change them together with the
    editor.

20. **Sites are one document.** Pages are body-level containers
    (`[data-fe-page]`, `display: contents`); the rest of <body> is the shared
    layout. Use `listPages`/`resolvePage`/`pageOfNode` (`model/pages.ts`) and the
    pure ops in `model/pageOps.ts` (committed by `actions/pageActions.ts`).
    Showing one page is editor-only view CSS, never a model change. Anything
    that exports or previews a page goes through `serialize/sitePages.ts`.

21. **Data-bound boxes keep ONE design in the model.** Copies are never
    model nodes: live ones come from `runtime/lists.js` (they reuse the design's
    `data-fe-id`), static ones from `serialize/expandLists.ts`. `data-fe-*`
    attributes are the editor's: React output drops them (`isEditorAttr`).

22. **Sign-in export** (`export/react/auth/`) is only added when something has
    a condition (`needsAuth`). API paths live in `model/authApi.ts` (editor and
    export share them). Check guard changes by building both routers' output
    and running it in Chrome: route redirects race in ways tests can't see.

23. **Forms stay plain HTML.** Rules are the browser's own attributes; only
    `data-fe-match/-message/-submit/-success` are the editor's. Anything about
    fields goes through `model/forms.ts`. React forms are generated
    components (`export/react/forms/`); never group a form into repeated items.

24. **Sign-in pages are normal pages with normal forms.** Their behaviour is
    only `data-fe-submit` (kind) + conventional field names (email, password,
    name). Never hard-code them in the export; the redirect after login uses
    `sessionStorage['auth:redirect']`, cleared only when the wanted page loads.

25. **Pop-ups are plain boxes while editing** (never hidden or fixed in the
    model); the visitors' player and the React `<Modal>` add the overlay. A
    button's click goes through `export/react/popups/jsxPopups.clickAttrs`, so
    never add a second `onClick` in the JSX writer. Generated file names must
    not differ only by case.

26. **Layouts are generated boxes, not model features.** `data-fe-layout`
    boxes + one marked CSS block; always go through `applyLayout` /
    `removeLayout` so there is never more than one of each. Don't assume the
    boxes are direct children of `<body>` in exported CSS (React wraps them in
    `#root`).

27. **Data wiring uses the same bindings for lists and one-item boxes**
    (`model/dataRecords.ts`). A binding starting with "/" is an address template:
    resolve it with `resolveBinding`, keep the three copies (static, frame runtime,
    record player) and the React `fieldExpression` in sync. Page paths may hold
    `:param` parts: always match with `matchPage`, never `===`.
28. **Wording on screen is for non-developers**: item, link, detail page, menu.
    Developer terms (function, route, param, handlers.ts) only in a short
    "For developers" note, and only where the React download needs it.

29. **Ready-made widgets** (tabs, select, calendar, table, search, filter…) are plain HTML with `data-ui-*`
    hooks (not `data-fe-*`: those are dropped from the React export) and a marked page-CSS block per kind.
    Their initial state must be complete in the markup; the runtime (`model/widgets/runtime/*.js`) only reacts
    to clicks and keys. Closed parts are revealed in the editor with `useRevealWidgets`, never in the model.
    Change the HTML builder, the runtime JS and the inspector panel together.

30. **Reusable components** (`model/reuse/`): copies are plain nodes marked `data-fe-instance` / `data-fe-of`; the main
    component is `data-fe-component` and is removed from every output (`stripComponents`). Changes are carried to copies by
    `propagate` inside `useDocStore.commit`, as a three-way merge against the previous document, so edit actions need no
    special code. Never nest components; any new output path must go through `stripComponents` (or `forVisitors`).

## Adding a new kind of edit
Write a function in `features/editor/actions/` that calls `updateNodes` or
`updateDoc`, then add a test in `model/*.test.ts` if it adds new tree logic.
- The React download carries `.tweak/project.json` (`export/react/snapshot.ts`): the whole `PageDoc` plus file fingerprints, so the start screen can reopen it. If you change `PageDoc` in a way old snapshots can't be read, bump `VERSION` there.
