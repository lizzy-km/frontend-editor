---
name: add-feature
description: Checklist for adding or changing any feature in frontend-editor (branch per feature, folder placement, size rules, plain-language UI, verification, docs/history/skill updates). Use for every new feature, panel control, store, route, or integration in this repo.
---

# Adding a feature to frontend-editor

The audience is **everyday people**, neither coders nor designers. They paste
code an AI gave them and change it by clicking. Every decision below serves that.

## 1. Branch
- `git checkout main && git checkout -b feature/<name>`, one branch per feature.
- When it is done and verified: `git checkout main && git merge --no-ff feature/<name>`.

**Commit after every logical change.** Make small focused commits inside
the branch (e.g. controls, config, wiring, then each fix found in testing as
its own `fix(...)`), and make sure each one passes `tsc` and `eslint`.

### Adding a settings-panel control
- Style property: add a `StyleField` in `src/features/editor/inspector/fields/*.ts`
  with an everyday label. Put it under `more` unless people change it often.
- If it does nothing alone (like border-width without a style), add a rule in `companionStyles.ts`.
- If the computed value misleads (like flex-direction on a block), add `read`.
- For anything that isn't a single CSS property, write a custom section in `inspector/sections/`.

## 2. Where code goes
- `src/features/<name>/`: the feature's pages, components, hooks, store and API.
- Shared UI goes in `src/shared/ui`, framework-free helpers in `src/lib`.
- A feature never imports another feature's internals, only its public functions or components.
- A toggleable or future feature gets a flag in `src/config/features.config.ts`
  (`enable_<name>`, with a comment). Future features ship with the flag `false`.

- A route for a flagged feature goes through `flagged('enable_x', ...)` in
  `src/app/router.tsx`, so it returns 404 while the flag is off. Links to it
  check `features.enable_x` too.
- Anything involving money (plans, marketplace orders) changes data only on a
  trusted server. The browser starts the checkout; it never grants the result.

## 3. Size and shape rules (ESLint enforces the numbers)
- A file is at most 150 lines; split it before it reaches that.
- A function is at most 100 lines; aim for under 40. One responsibility each.
- Every exported function gets a one-line comment saying what it does in plain words.
- Prefer data-driven config (arrays of fields or options) over repeated JSX,
  so adding one more thing means adding one entry.

## 4. UI copy and UX
- Use everyday words: "Text color", "Space inside", "Rounded corners", "Picture".
  Never show CSS names in the default view; raw CSS belongs under "More options / Advanced".
- Show only the few most common controls by default, and hide the rest behind a disclosure.
- Every empty state says what to do next, and every error says what happened and how to fix it.
- Keep it fast: subscribe to the smallest store slice, lazy-load routes and
  heavy libraries (Konva, Quill, Firebase), and never re-render the whole page for one edit.

## 5. Editor-specific rules
- Edits go through `features/editor/actions/*` (which call `commit`), never
  straight into the store. Use a `coalesceKey` for continuous inputs so undo
  treats a whole drag as one step.
- Nested content lives in `ElementNode.children` only.
- Never execute page JavaScript while editing. New trusted style libraries
  are added to `model/scripts.ts` only after a review.

## 6. Verify (every change)
1. `npx tsc -b`
2. `npx eslint .`
3. `npx vitest run` (add tests for any new pure logic)
4. `npx vite build`
5. For UI or canvas changes: `npx vite --port 5317` in the background, then
   `npm run e2e`, and add or adjust a check in `e2e/` for the new behavior.
   Look at the screenshots in `e2e/screenshots/`.

## 7. Update the records (every feature)
- `docs/HISTORY.md`: new entry at the top covering the branch, date, what changed and key decisions.
- `docs/ARCHITECTURE.md`: update it if structure, data model or flows changed.
- `README.md`: update it if setup, scripts or env vars changed.
- This skill, or `.claude/skills/editor-model`: update it if you learned a rule the next person needs.
