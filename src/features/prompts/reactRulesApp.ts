/** Part 2 of the React prompt, middle third: the pages, sign-in, the mock data, and responsive and accessible pages. */
export const REACT_RULES_APP = `4. PAGES AND ROUTING
- Build the pages named in Part 1 (in that order). If none are given, make 6 to 9 that suit the subject: Home, a list page with search and filters, a detail page at a dynamic address (for example /products/:id), About, Contact, Log in, Create account, Forgot password, an Account page (signed-in only) and a Not found page.
- All routes live in src/app/router.tsx. Every page is lazy loaded (the "lazy: () => import(...)" route property). A shared RootLayout gives every page the same header (logo, NavLink navigation with an active style, Log in / Sign up buttons that become the person's name and a Log out button when signed in, a menu button on phones), an <Outlet /> and the footer.
- Scroll to the top when the page changes. Set a useful document title on every page (a small useDocumentTitle hook). Add an errorElement to the root route and a "*" route for the Not found page.
- Every page has exactly one h1, is complete, and has real, specific copy for this business or person: no lorem ipsum, no "Your text here". Home has a big hero, highlights and a clear next step; other pages start with a smaller title band.

5. SIGN-IN (a working mock that is ready to swap for a real API)
- features/auth holds: AuthProvider and a useAuth() hook (user, status, login, register, logout), the session saved in localStorage (typed), ProtectedRoute, LoginPage, RegisterPage and ForgotPasswordPage.
- ProtectedRoute sends signed-out people to /login and remembers where they wanted to go (location state), then returns them there after they sign in. Roles "member" and "admin" exist; one page or section is admin only and shows a clear "No access" message to members.
- Forms use react-hook-form + zod: a schema per form, a message under each field, a disabled submit button while sending, an error summary with role="alert", passwords of at least 8 characters, and a show/hide password button.
- features/auth/api/authApi.ts hides how it talks to the server. While USE_MOCK is true (import.meta.env.VITE_USE_MOCK !== "false") it uses a users list in localStorage with a short delay (about 400ms) and two demo accounts: admin@example.com / admin123 and member@example.com / member123 (show them on the login page and in the README). When VITE_USE_MOCK is "false" it calls axios endpoints POST /auth/login, POST /auth/register, POST /auth/forgot-password and GET /auth/me, with the token in the session. The README lists these endpoints.

6. DATA AND FORMS
- Realistic, typed sample data in src/data/*.ts: 8 to 12 items per list with believable names, prices, dates, descriptions, categories and Unsplash photo URLs (https://images.unsplash.com/photo-...?auto=format&fit=crop&w=800&q=80). The types live in each feature's types.ts.
- Each feature has an api/ file with functions that return Promises (a short delay in mock mode) and React Query hooks (useItems, useItem(id)) with query keys kept in constants. The API layer switches between mock data and the real API with USE_MOCK and VITE_API_URL, the same way as sign-in. Components never fetch data directly: they use the hooks.
- Every screen that loads data shows three states in plain words: loading (a Spinner), empty (EmptyState with a next step) and error (ErrorState with a "Try again" button).
- The list page has a search box, a category filter and sorting kept in the URL (useSearchParams) so links can be shared, plus a results count. The detail page finds an item by id and shows a friendly "not found" state.
- Contact and newsletter forms use react-hook-form + zod, a mock submit and a thank-you message.

7. RESPONSIVE AND ACCESSIBLE
- Mobile first: write the base CSS for phones, then add @media (min-width: 640px) and @media (min-width: 1024px). Fluid type with clamp(), grid and flexbox, images with max-width: 100% and object-fit. Nothing scrolls sideways from 360px up. Touch targets are at least 44px.
- The header menu on phones is a button (aria-expanded, aria-controls) that opens a menu and closes on navigation and on the Escape key.
- Semantic HTML (header, nav, main, section, footer), a <label> for every field, alt text on every picture, aria-label on icon-only buttons, visible focus styles, strong colour contrast, and animations that stop under prefers-reduced-motion.`
