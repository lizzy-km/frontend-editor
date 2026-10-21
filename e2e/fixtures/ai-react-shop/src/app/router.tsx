import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "@/features/auth";
import { RootLayout } from "./layouts/RootLayout";
import { RouteError } from "./RouteError";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    errorElement: <RouteError />,
    children: [
      { index: true, lazy: async () => ({ Component: (await import("@/features/home/HomePage")).default }) },
      { path: "shop", lazy: async () => ({ Component: (await import("@/features/catalog/ShopPage")).default }) },
      { path: "shop/:id", lazy: async () => ({ Component: (await import("@/features/catalog/ProductPage")).default }) },
      { path: "cart", lazy: async () => ({ Component: (await import("@/features/cart/CartPage")).default }) },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "checkout", lazy: async () => ({ Component: (await import("@/features/checkout/CheckoutPage")).default }) },
          { path: "account/orders", lazy: async () => ({ Component: (await import("@/features/orders/OrdersPage")).default }) },
          { path: "account/favourites", lazy: async () => ({ Component: (await import("@/features/favourites/FavouritesPage")).default }) },
        ],
      },
      {
        element: <ProtectedRoute role="admin" />,
        children: [
          { path: "admin/products", lazy: async () => ({ Component: (await import("@/features/admin/AdminProductsPage")).default }) },
        ],
      },
      { path: "login", lazy: async () => ({ Component: (await import("@/features/auth/LoginPage")).default }) },
      { path: "register", lazy: async () => ({ Component: (await import("@/features/auth/RegisterPage")).default }) },
      { path: "forgot-password", lazy: async () => ({ Component: (await import("@/features/auth/ForgotPasswordPage")).default }) },
      { path: "about", lazy: async () => ({ Component: (await import("@/features/about/AboutPage")).default }) },
      { path: "contact", lazy: async () => ({ Component: (await import("@/features/contact/ContactPage")).default }) },
      { path: "*", lazy: async () => ({ Component: (await import("@/features/notfound/NotFoundPage")).default }) },
    ],
  },
]);
