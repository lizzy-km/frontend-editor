import { useEffect, useState } from "react";
import { useLocation } from "react-router";

export type MobileMenu = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
};

// Controls the phone menu: it closes on Escape and by itself when another page opens.
export function useMobileMenu(): MobileMenu {
  const { pathname } = useLocation();
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const isOpen = openOnPath === pathname;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpenOnPath(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return {
    isOpen,
    toggle: () => setOpenOnPath(isOpen ? null : pathname),
    close: () => setOpenOnPath(null),
  };
}
