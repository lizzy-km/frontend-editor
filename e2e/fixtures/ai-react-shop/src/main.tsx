import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { Providers } from "@/app/providers";
import { router } from "@/app/router";
import "@/styles/tokens.css";
import "@/styles/global.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("The page is missing its <div id=\"root\"> element.");
}

createRoot(container).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
