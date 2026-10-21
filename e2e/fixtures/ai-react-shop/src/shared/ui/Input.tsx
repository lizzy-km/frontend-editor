import { useId, type ComponentPropsWithRef, type ReactElement, type ReactNode } from "react";
import { Field, describedBy } from "./Field";
import styles from "./Field.module.css";

export type InputProps = ComponentPropsWithRef<"input"> & {
  label: string;
  error?: string;
  hint?: string;
  adornment?: ReactNode;
};

// A labelled text box that shows its own error message.
export function Input({ label, error, hint, adornment, id, ...rest }: InputProps): ReactElement {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <Field id={inputId} label={label} error={error} hint={hint}>
      <div className={styles.control}>
        <input
          id={inputId}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          {...rest}
        />
        {adornment}
      </div>
    </Field>
  );
}
