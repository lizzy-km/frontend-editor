import type { ReactElement, ReactNode } from "react";
import { cx } from "@/shared/lib/classNames";
import styles from "./Card.module.css";

type CardProps = {
  as?: "div" | "article" | "li";
  hoverable?: boolean;
  className?: string;
  children: ReactNode;
};

// A rounded white card; hoverable cards lift when the pointer is over them.
export function Card({ as: Tag = "div", hoverable = false, className, children }: CardProps): ReactElement {
  return <Tag className={cx(styles.card, hoverable && styles.hoverable, className)}>{children}</Tag>;
}
