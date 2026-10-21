import type { ReactElement } from "react";
import { Outlet } from "react-router";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { ScrollToTop } from "./ScrollToTop";
import styles from "./RootLayout.module.css";

// The frame of every page: header on top, the page in the middle, footer at the bottom.
export function RootLayout(): ReactElement {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
