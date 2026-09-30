---
name: firebase-data
description: frontend-editor's Firestore data model, security-rule invariants (page limit counter, public/private), and bundle rules for Firebase imports. Read before touching features/workspace/api, features/auth, firestore.rules, billing plans, or anything that reads/writes Firestore.
---

# Firebase data: rules that must hold

## Collections
Names live in `src/lib/collections.ts` (prefixed so a shared Firebase project can't collide) and are repeated in `firestore.rules` + `firestore.indexes.json` — change all three together.

| Path | Who can read | What |
|---|---|---|
| `tweak_users/{uid}` | owner | `displayName, email, photoURL, plan ('free'|'pro'), projectCount, lastProjectOp, createdAt` |
| `tweaks_projects/{id}` | owner, or anyone if `isPublic` | `ownerId, ownerName, name, isPublic, thumbnailUrl, remixOf, createdAt, updatedAt` |
| `tweaks_project_content/{id}` | owner, or anyone if `isPublic` | `ownerId, isPublic (mirror), doc (JSON string of PageDoc), updatedAt` |

## Invariants
1. **The page counter only moves together with a project.** Create and delete are
   ONE `writeBatch`: the project and content docs, plus
   `users/{uid}.projectCount ±1` with `lastProjectOp = projectId`.
   `firestore.rules` check that the project really appears or disappears in
   that same batch. Never update `projectCount` any other way.
2. **Plan limits live in two places and must match:** `src/features/billing/plans.ts`
   (UI) and `maxProjects()` in `firestore.rules` (the real enforcement).
3. **`plan` is never writable by the client.** It can only be created as
   `'free'`. Upgrades must come from a trusted server (Admin SDK / Cloud
   Function) once billing exists.
4. **`isPublic` is mirrored** on `projectContent`, so read rules need no
   extra `get()`. Always change both in one batch (`setProjectPublic`).
5. **The page is stored as a JSON string** (`serializeDoc`), with a limit of
   about 900 KB because of Firestore's 1 MiB per document.
   `ProjectTooBigError` gives the user a friendly message. If pages outgrow
   that, move content to R2 behind the same `loadProjectContent` /
   `saveProjectContent` functions.
6. **The profile must exist before any counted write.** Without
   `users/{uid}`, the counter update in the create batch has nothing to
   update, and the rules refuse the whole batch with `permission-denied`.
   `ensureUserProfile` runs at sign-in, when a session is restored
   (`watchAuth`), and inside `createProject`. Keep all three.
7. **The Firebase project may be shared with another app.** `users/{uid}`
   can already exist without our fields. `ensureUserProfile` runs in a
   transaction and only *adds* `projectCount: 0` (plus `plan: 'free'` when
   absent), and the `repairProfile()` rule allows exactly that. Never
   overwrite another app's fields. Also remember that
   `firebase deploy --only firestore` REPLACES the whole project's rules;
   in a shared project that can break the other app. A dedicated project is
   strongly preferred.
8. **Downloads are counted per page per month** on `tweaks_projects/{id}`
   (`downloadPeriod` is a UTC `YYYYMM` number, plus `downloadCount`). Only
   `recordDownload` (a transaction) writes them. The rules allow the owner
   +1 within `maxDownloads(plan)`, and the limits must match
   `plans.ts maxDownloadsPerMonth`. Record a download BEFORE delivering the
   file, after preparing it (see `export/ExportDialog.tsx`).
9. **Public pages are untrusted code for the viewer.** Render them only in a
   sandbox WITHOUT `allow-same-origin`, like Preview does.

## Indexes
- Prefer queries that need **no custom index**. A missing index fails with
  `failed-precondition` on every fresh project until someone deploys it.
- Small per-user lists (such as My pages, capped by plan) filter on one
  field and sort in the app.
- A custom index is only for lists that must page through many documents
  (the public gallery: `isPublic + updatedAt`). Keep `firestore.indexes.json`
  in sync.

## Use Firestore Lite
The app imports **`firebase/firestore/lite`**, never `firebase/firestore`.
Lite uses plain HTTPS requests, so there is no WebChannel stream. The full
SDK's stream threw "AbortError: signal is aborted" on every navigation or
remount. Lite is also about 350 kB smaller.

It supports every call the app makes: get, query, writeBatch, increment and
serverTimestamp. If a feature ever truly needs live updates (`onSnapshot`),
use the full SDK only in that feature's lazy module.

The rules tests in `tests/rules` use the full SDK, and that is fine; they
never ship.

## Bundle rule
- `@/lib/firebase` (the SDK) may only be imported from lazily-loaded code:
  `features/auth/authService.ts`, `userProfile.ts`, `features/workspace/api/*`
  and gallery API files.
- UI that just needs to know whether Firebase is set up imports
  `@/lib/firebaseConfig`.
- To check, run `npx vite build`, then `grep -c firebase- dist/index.html`,
  which must print `0`.

## Testing rules
`npm run test:rules` runs `tests/rules/*.test.ts` against the Firestore
emulator (it needs Java and `firebase-tools`). Add a case for every rule
change. Rules can't be checked with tsc or unit tests.

- `tests/rules/appFlow.test.ts` runs the app's REAL code (Firestore Lite,
  `ensureUserProfile`, `createProject`) against the emulator. That is how the
  shared-project bug was found, since hand-written batches passed.
- Without Java installed: download a portable JRE (Adoptium) and
  `firebase-tools` into a scratch folder, put the JRE's `bin` on PATH
  (in Git Bash use `/c/...`, not `C:/...`), then run
  `firebase emulators:exec --only firestore --project demo-tweak "npx vitest run --config vitest.rules.config.ts"`.
