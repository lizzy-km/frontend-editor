import { useEffect } from "react";

const SITE_NAME = "Alder & Co.";

// Sets the browser tab title for the current page.
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} | ${SITE_NAME}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
