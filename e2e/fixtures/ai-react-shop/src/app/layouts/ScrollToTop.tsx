import { useEffect } from "react";
import { useLocation } from "react-router";

// Scrolls back to the top of the window whenever the visitor opens a different page.
export function ScrollToTop(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
