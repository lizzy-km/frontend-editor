import type { ReactElement } from "react";
import { Link } from "react-router";
import { useCart } from "@/features/cart";
import { cx } from "@/shared/lib/classNames";
import { AccountActions } from "./AccountActions";
import { NavLinks } from "./NavLinks";
import { useMobileMenu } from "./useMobileMenu";
import styles from "./Header.module.css";

const MENU_ID = "site-menu";

// The sticky header: logo, menu, account buttons, the cart with its badge and a phone menu button.
export function Header(): ReactElement {
  const { count } = useCart();
  const { isOpen, toggle } = useMobileMenu();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.row}`}>
        <Link to="/" className={styles.logo}>
          Alder <span className={styles.amp}>&amp;</span> Co.
        </Link>
        <div id={MENU_ID} className={cx(styles.panel, isOpen && styles.open)}>
          <NavLinks />
          <AccountActions />
        </div>
        <Link to="/cart" className={styles.cart} aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}>
          <span aria-hidden="true">🛍</span>
          <span>Cart</span>
          {count > 0 ? <span className={styles.badge}>{count}</span> : null}
        </Link>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={isOpen}
          aria-controls={MENU_ID}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={toggle}
        >
          <span aria-hidden="true">{isOpen ? "✕" : "☰"}</span>
        </button>
      </div>
    </header>
  );
}
