import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { buttonClass, type ButtonVariant } from "./buttonClass";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

// A button with the shop's look; it submits nothing unless type="submit" is given.
export function Button({
  variant = "primary",
  fullWidth = false,
  className,
  type = "button",
  ...rest
}: ButtonProps): ReactElement {
  return <button type={type} className={buttonClass(variant, fullWidth, className)} {...rest} />;
}
