import type { ReactElement } from "react";
import { Link } from "react-router";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import styles from "./RouteError.module.css";

// A friendly full-page message for when something unexpected breaks while a page opens.
export function RouteError(): ReactElement {
  useDocumentTitle("Something went wrong");

  return (
    <main className={styles.box}>
      <h1>Something went wrong</h1>
      <p>We could not show this page. Please go back to the home page and try again.</p>
      <Link to="/">Back to the home page</Link>
    </main>
  );
}
