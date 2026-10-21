import type { ReactElement } from "react";
import { Link, type LinkProps } from "react-router";
import { buttonClass, type ButtonVariant } from "./buttonClass";

type ButtonLinkProps = LinkProps & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

// A real link to another page that looks like a button.
export function ButtonLink({
  variant = "primary",
  fullWidth = false,
  className,
  ...rest
}: ButtonLinkProps): ReactElement {
  return <Link className={buttonClass(variant, fullWidth, className)} {...rest} />;
}
