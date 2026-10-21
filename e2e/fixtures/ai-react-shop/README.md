# Alder & Co.

A complete online shop for clothes and home goods, built with Vite, React 19 and TypeScript. Visitors browse, members save favourites, order and follow their orders, and an admin manages the products. It runs on sample data, so it needs no server.

## Run it

You need Node.js 20 or newer.

```bash
npm install
npm run dev
npm run build
```

`npm run dev` starts the shop at the address it prints (usually http://localhost:5173). `npm run build` checks the types and makes a production build in `dist/`.

## Demo accounts

| Role   | Email              | Password  |
| ------ | ------------------ | --------- |
| Member | member@example.com | member123 |
| Admin  | admin@example.com  | admin123  |

The member has 3 sample orders. The admin can open `/admin/products` to add, edit and delete products (changes last until the page reloads). The demo coupon is `WELCOME10` (10% off) and shipping is free over $75.

## What is where

```text
src/main.tsx            mounts the app
src/app/                router.tsx, providers.tsx, layouts/ (RootLayout, Header, NavLinks, Footer)
src/features/<name>/    one folder per part of the shop
    <Name>Page.tsx      the page, kept thin
    components/         the feature's own components
    hooks/              React Query hooks and form logic
    api/                functions that fetch or send data
    types.ts            types and zod schemas
    index.ts            the only file other features import from
src/shared/ui/          Button, Input, Card, Modal, Spinner, EmptyState, ErrorState ...
src/shared/hooks/       useDocumentTitle, useStore
src/shared/lib/         formatPrice, formatDate, session, storage helpers
src/api/client.ts       the axios client and the USE_MOCK switch
src/data/               typed sample data, one file per list
src/styles/             tokens.css (variables) and global.css (reset, base)
```

Features: `home`, `catalog` (shop, product page, favourites button), `cart`, `checkout`, `orders`, `favourites`, `admin`, `auth`, `contact`, `newsletter`, `about`, `notfound`.

## Switch to a real API

Mock mode is the default. To use a real server, copy `.env.example` to `.env` and set:

```bash
VITE_USE_MOCK=false
VITE_API_URL=https://your-api.example.com
```

The app then calls these endpoints (the sign-in token is sent as `Authorization: Bearer <token>`):

| Method | Path                    | Purpose                                              |
| ------ | ----------------------- | ---------------------------------------------------- |
| POST   | /auth/login             | body `{ email, password }`, returns `{ token, user }` |
| POST   | /auth/register          | body `{ name, email, password }`, returns `{ token, user }` |
| POST   | /auth/forgot-password   | body `{ email }`                                     |
| GET    | /auth/me                | the signed-in user `{ id, name, email, role }`       |
| GET    | /products               | query `q, category, price, sort`, returns a list     |
| GET    | /products/featured      | products for the home page                           |
| GET    | /products/:id           | one product, 404 when it does not exist              |
| POST   | /products               | create a product (admin)                             |
| PUT    | /products/:id           | change a product (admin)                             |
| DELETE | /products/:id           | delete a product (admin)                             |
| GET    | /categories             | the categories                                       |
| GET    | /orders                 | the signed-in member's orders                        |
| POST   | /orders                 | place an order                                       |
| POST   | /contact                | contact form message                                 |
| POST   | /newsletter             | newsletter sign-up                                   |

The signed-in person is stored in `localStorage` under `tweak:session` as `{ "token", "user": { "id", "name", "email", "role" } }`.

## Add a page

1. Create `src/features/<feature>/<Name>Page.tsx` with a default export and call `useDocumentTitle`.
2. Add a lazy route to `src/app/router.tsx`, for example `{ path: "sale", lazy: async () => ({ Component: (await import("@/features/sale/SalePage")).default }) }`.
3. Add a link to it in `src/app/layouts/NavLinks.tsx`.

## Add a feature

1. Make `src/features/<name>/` with `types.ts`, `api/`, `hooks/`, `components/`, the page and an `index.ts`.
2. Write the API functions so they use sample data while `USE_MOCK` is true and `apiClient` otherwise.
3. Wrap them in React Query hooks, keep the query keys in a constants file, and show loading, empty and error states.
4. Export only what other features need from `index.ts`; other features import through it.
