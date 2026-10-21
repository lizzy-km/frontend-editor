/** Part 2 of the React prompt, last third: clean code, design, the README and the final check. */
export const REACT_RULES_QUALITY = `8. CLEAN CODE
- TypeScript strict: no "any", no non-null "!" assertions, casts only to narrow parsed JSON. Exported functions and components have explicit prop and return types. Use "type" for object types. Named exports everywhere, except default exports for lazy pages.
- Small functions that do one thing (under about 40 lines) and components under about 120 lines. Pull repeated logic into hooks (src/shared/hooks, features/*/hooks) or helpers (src/shared/lib). Use constants instead of magic numbers and strings, early returns instead of deep nesting, and descriptive names (isLoading, filteredProducts, handleSubmit).
- Put a one-line comment above every exported function, hook and component saying what it does in plain words. No other comments unless something is surprising.
- No console.log, no dead code, no TODOs, no commented-out code, no unused imports or variables (noUnusedLocals is on).
- State stays local; context is only for sign-in. Do not store values you can calculate. useEffect is only for syncing with the outside world (document title, event listeners) and always cleans up.
- Errors are shown to people in plain words, never as raw error objects or stack traces.
- Styles: CSS Modules per component, and global variables in src/styles/tokens.css (colours, font families, radius, spacing scale, shadows). No inline style attributes except for dynamic values, and no !important.

9. DESIGN
- One clear visual idea that fits the subject (mood, palette, type pairing, a recurring motif) carried through every page, written as variables in tokens.css and a Google Fonts link in index.html.
- A striking hero on Home: a big expressive headline (clamp()), a strong photo or layered background, a short line and one standout button. Use shared/ui components (Button, Card, Input) so every page looks like the same product. Vary the layouts from section to section (split layouts, bento grids, an image band), alternate light and tinted sections, add soft shadows, badges and gentle hover and transition motion (150 to 400ms).
- A footer with the name, short contact details, links and the current year.

10. README.md (written in full as one of the files)
- What the project is; the run commands (Node.js 20 or newer, npm install, npm run dev, npm run build); the two demo accounts; a map of the folders; how to switch to a real API (VITE_USE_MOCK=false, VITE_API_URL and the endpoints it expects); how to add a page and how to add a feature.

11. SO THE PROJECT CAN BE OPENED IN TWEAK (keep these exactly)
Tweak can open this project to change its pages by clicking: it runs the app in a locked frame, visits every page and turns what it sees into an editable site. For that to work:
- src/main.tsx finds <div id="root">, calls createRoot(...).render(...) and renders <RouterProvider router={router} />. The router is created in src/app/router.tsx with createBrowserRouter (never BrowserRouter, never a hash router) and exported as "router".
- The signed-in person is kept in localStorage under the exact key "tweak:session" as JSON: { "token": string, "user": { "id": string, "name": string, "email": string, "role": "member" | "admin" } }. The mock sign-in writes it on login and removes it on logout, and the auth provider reads it when the app starts, so a person who already has a session is signed in at once.
- Every style comes from imported .css or .module.css files. No CSS-in-JS and no style sheets from a CDN, except the Google Fonts link in index.html.
- The layout uses the semantic elements <header>, <main> and <footer> directly (one header with the logo and the menu, one footer). Menu links, cards and buttons that open another page are real links (<a> or Link / NavLink with a real path such as /shop/12), never an onClick that only calls navigate().
- Use the <header> element only for the site header (inside cards and articles use a <div> or <hgroup>). Decorative pictures use alt=""; content pictures get a helpful alt text.
- tsconfig.json includes only "src" (vite.config.ts is not type-checked).
- Use only the libraries in the package.json above. No import.meta.glob, no dynamic code, no web workers. Pictures are https:// addresses, never imported files.
- Mock mode is the default: with no .env file the app uses src/data and needs no network. Every page shows its real content shortly after it opens, without waiting for a click or a hover (menus and dialogs may open on click).
- Members-only pages redirect a signed-out visitor to /login (a <Navigate to="/login" /> inside ProtectedRoute), and show their content to a signed-in person without further steps.

12. BEFORE YOU ANSWER, CHECK
- "npm install && npm run build" would pass: every file that is imported is in the tree, everything that is imported is exported, there are no type errors in strict mode, and no unused variables.
- Every file in the FILE TREE appears below as "FILE: ..." and nothing is shortened.
- Every link and navigation path matches a route; the protected page sends signed-out people to /login and back; the demo accounts work.
- Every rule in section 11 is followed exactly (the router export, the "tweak:session" key, real links, semantic layout).
- It works at 1440px, 1024px, 768px, 390px and 360px wide, and the code reads like it was written by a careful senior engineer.`
