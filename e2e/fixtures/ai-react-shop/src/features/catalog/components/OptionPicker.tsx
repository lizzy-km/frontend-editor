import type { ReactElement } from "react";
import styles from "./OptionPicker.module.css";

type OptionPickerProps = {
  legend: string;
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

// A row of pill buttons (radio choices) for picking a size or a colour.
export function OptionPicker({ legend, name, options, value, onChange }: OptionPickerProps): ReactElement {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option} className={styles.option}>
            <input
              className={styles.input}
              type="radio"
              name={name}
              value={option}
              checked={option === value}
              onChange={() => onChange(option)}
            />
            <span className={styles.pill}>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
