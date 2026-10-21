import { useId, type ComponentPropsWithRef, type ReactElement } from "react";
import { Field, describedBy } from "./Field";
import styles from "./Field.module.css";

type TextareaProps = ComponentPropsWithRef<"textarea"> & {
  label: string;
  error?: string;
  hint?: string;
};

// A labelled multi-line text box that shows its own error message.
export function Textarea({ label, error, hint, id, ...rest }: TextareaProps): ReactElement {
  const generatedId = useId();
  const areaId = id ?? generatedId;

  return (
    <Field id={areaId} label={label} error={error} hint={hint}>
      <textarea
        id={areaId}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(areaId, error, hint)}
        {...rest}
      />
    </Field>
  );
}
