/** The package.json the AI must copy: the same stack and versions as the React projects Tweak itself downloads (export/react). */
export const REACT_PACKAGE_JSON = `{
  "name": "my-site",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.0",
    "@tanstack/react-query": "^5.90.0",
    "axios": "^1.12.0",
    "react": "^19.3.0",
    "react-dom": "^19.3.0",
    "react-hook-form": "^7.62.0",
    "react-router": "^7.9.0",
    "zod": "^4.1.0"
  },
  "devDependencies": {
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.1.1",
    "typescript": "~5.9.0",
    "vite": "^8.3.1"
  }
}`

/** Part 2 of the React prompt, first third: the answer format, the stack and the folder structure. */
export const REACT_RULES_STACK = `PART 2 — OUTPUT RULES FOR A REACT + TYPESCRIPT PROJECT (keep these exactly)

The result is a complete, runnable, multi-page web app (Vite + React + TypeScript) built from Part 1. A person will save each file you write, run "npm install" and then "npm run dev". It must work the first time: zero TypeScript errors, no missing imports, no placeholders. It follows the same stack and conventions as the React projects Tweak itself downloads (React Router 7, TanStack Query with axios, React Hook Form with Zod, a VITE_USE_MOCK switch for sample data).

1. ANSWER FORMAT
- Reply with ONLY these three things, in this order: (a) a line "FILE TREE" followed by ONE text code block listing every file of the project; (b) every file, each written as a line "FILE: path/from/the/project/root" followed by ONE code block (with its language) holding the COMPLETE file; (c) a final "RUN IT" block with the commands.
- No explanations, notes or alternatives between the files. Never write "...", "// rest unchanged", "same as before" or "add more here". Every file in the tree appears in full below it.
- SIZE: the whole answer has to fit in a few chat messages, so keep the project compact: aim for 30 to 45 files in total, no more than 12 pages, and make a few well-made files rather than many tiny ones (one CSS Module per feature page or per shared component is enough). When space is short, drop optional extras before dropping a required page, the sign-in or the README.
- Keep each file focused and under about 150 lines; split larger ones. If you run out of room, finish the file you are writing completely, end with the line "CONTINUE FROM: <next file path>" and stop; continue exactly there when asked.
- Forward slashes in paths. Text files only: pictures are https:// addresses, never files.

2. STACK (use exactly this, add nothing unnecessary)
- Vite, React 19, TypeScript in strict mode. Routing: react-router (v7) with createBrowserRouter + RouterProvider and lazy routes. Data: @tanstack/react-query + axios. Forms: react-hook-form + zod + @hookform/resolvers. Styling: CSS Modules (*.module.css) plus global CSS variables. No Tailwind, no UI kits, no Redux, no CSS-in-JS, no animation libraries. Icons: small inline SVG components or emoji.
- package.json must be exactly this (same versions):
${REACT_PACKAGE_JSON}
- Also write: tsconfig.json (strict, noUnusedLocals, noUnusedParameters, jsx react-jsx, moduleResolution bundler, types ["vite/client"], and the alias "@/*" -> "src/*"), vite.config.ts (react plugin and the same "@" alias), index.html (lang, viewport, title, Google Fonts link, <div id="root">), .env.example, .gitignore and README.md.
- Import with the alias ("@/features/...") instead of long "../../.." paths.
- Exact API details (they differ between versions, so follow them): import { createBrowserRouter, NavLink, Outlet, Link, useNavigate, useParams, useSearchParams, useLocation, Navigate } from "react-router" and import { RouterProvider } from "react-router/dom". A lazy route is written as { path: "products/:id", lazy: async () => ({ Component: (await import("@/features/catalog/ProductPage")).default }) }. Zod is version 4: write z.email(), z.string().min(8, "…") and z.infer<typeof schema>; connect it with zodResolver from @hookform/resolvers/zod. React 19: no need to import React for JSX, and a component's props are a plain typed object.

3. FOLDER STRUCTURE (by feature, not by file type)
  src/main.tsx                    mounts the app
  src/app/                        router.tsx, providers.tsx (QueryClient, auth)
  src/app/layouts/                RootLayout.tsx, Header.tsx, Footer.tsx (the shared layout: always here)
  src/features/<name>/            one folder per part of the product (for example catalog, auth, contact, home)
      <Name>Page.tsx              the page: thin, only puts components together
      components/                 the feature's own components (one per file)
      hooks/                      useX hooks (React Query, form logic)
      api/                        functions that fetch or send data
      types.ts                    the feature's types (and zod schemas)
      index.ts                    the only file other features may import from
  src/shared/ui/                  Button, Input, Card, Modal, Spinner, EmptyState, ErrorState (used everywhere)
  src/shared/hooks/, src/shared/lib/   small helpers (useDocumentTitle, formatPrice, formatDate)
  src/api/client.ts               the axios client and the USE_MOCK switch
  src/data/                       typed mock data, one file per list
  src/styles/                     tokens.css (variables), global.css (reset, base)
- A feature imports another feature only through its index.ts; shared/ never imports from features/; pages never fetch data themselves. If two features need each other, move the shared part into shared/ or into the feature that owns the data, so there are no import cycles.
- State shared between pages that is not sign-in (a cart, favourites) lives in a small store in src/shared/lib built on useSyncExternalStore and localStorage (its own key), with a hook in src/shared/hooks: no extra library. The session helpers (read, write, clear "tweak:session") live in src/shared/lib/session.ts so both the auth feature and the axios client can use them.
- One component per file, PascalCase file names; hooks start with "use"; every feature has an index.ts that exports only what others need.`
