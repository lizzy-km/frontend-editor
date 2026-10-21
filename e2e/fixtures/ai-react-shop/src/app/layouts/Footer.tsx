import type { ReactElement } from "react";
import { Link } from "react-router";
import { SUPPORT_EMAIL } from "@/features/contact";
import styles from "./Footer.module.css";

// The footer: shop name, contact details, useful links and the current year.
export function Footer(): ReactElement {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div>
          <p className={styles.brand}>Alder &amp; Co.</p>
          <p className={styles.text}>Clothes and home goods in natural fibres, made to last.</p>
        </div>
        <div>
          <h2 className={styles.title}>Shop</h2>
          <ul className={styles.list}>
            <li>
              <Link to="/shop">All products</Link>
            </li>
            <li>
              <Link to="/cart">Your cart</Link>
            </li>
            <li>
              <Link to="/login">Log in</Link>
            </li>
            <li>
              <Link to="/register">Create account</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className={styles.title}>Help</h2>
          <ul className={styles.list}>
            <li>
              <Link to="/about">About us</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </li>
            <li>30-day returns</li>
          </ul>
        </div>
      </div>
      <p className={styles.legal}>© {new Date().getFullYear()} Alder &amp; Co. All rights reserved.</p>
    </footer>
  );
}
