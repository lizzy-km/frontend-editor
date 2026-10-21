import { useState, type ReactElement } from "react";
import { Input, type InputProps } from "@/shared/ui/Input";
import styles from "./PasswordField.module.css";

type PasswordFieldProps = Omit<InputProps, "type" | "adornment">;

// A password box with a button that shows or hides what was typed.
export function PasswordField(props: PasswordFieldProps): ReactElement {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Input
      {...props}
      type={isVisible ? "text" : "password"}
      adornment={
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={isVisible}
          aria-label={isVisible ? "Hide password" : "Show password"}
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      }
    />
  );
}
