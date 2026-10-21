import type { ReactElement } from "react";
import { NavLink } from "react-router";
import { useAuth } from "@/features/auth";
import { cx } from "@/shared/lib/classNames";
import styles from "./NavLinks.module.css";

type NavItem = { to: string; label: string; end?: boolean };

const PUBLIC_LINKS: NavItem[] = [
  { to: "/", label: "Home", end: true },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const MEMBER_LINKS: NavItem[] = [
  { to: "/account/orders", label: "My orders" },
  { to: "/account/favourites", label: "Favourites" },
];

const ADMIN_LINKS: NavItem[] = [{ to: "/admin/products", label: "Admin products" }];

// The main menu links; members and admins also see their own links.
export function NavLinks(): ReactElement {
  const { user } = useAuth();
  const links = [
    ...PUBLIC_LINKS,
    ...(user ? MEMBER_LINKS : []),
    ...(user?.role === "admin" ? ADMIN_LINKS : []),
  ];

  return (
    <nav aria-label="Main menu">
      <ul className={styles.list}>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.end}
              className={({ isActive }) => cx(styles.link, isActive && styles.active)}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
