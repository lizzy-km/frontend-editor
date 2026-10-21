import { useId, type ComponentPropsWithRef, type ReactElement } from "react";
import { Field, describedBy } from "./Field";
import styles from "./Field.module.css";

type SelectProps = ComponentPropsWithRef<"select"> & {
  label: string;
  error?: string;
  hint?: string;
};

// A labelled drop-down list that shows its own error message.
export function Select({ label, error, hint, id, children, ...rest }: SelectProps): ReactElement {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <Field id={selectId} label={label} error={error} hint={hint}>
      <select
        id={selectId}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(selectId, error, hint)}
        {...rest}
      >
        {children}
      </select>
    </Field>
  );
}
