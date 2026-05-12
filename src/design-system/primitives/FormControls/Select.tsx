import type { SelectHTMLAttributes } from "react";
import "./FormControls.css";

type FormControlSize = "sm" | "md" | "lg";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T extends string = string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size" | "value" | "onChange"> {
  options: Array<SelectOption<T>>;
  value: T;
  onValueChange(value: T): void;
  size?: FormControlSize;
  invalid?: boolean;
  fullWidth?: boolean;
}

export function Select<T extends string = string>({
  className,
  fullWidth = false,
  invalid = false,
  onValueChange,
  options,
  size = "md",
  value,
  ...props
}: SelectProps<T>) {
  const ariaInvalid = props["aria-invalid"] ?? (invalid ? true : undefined);
  const classes = [
    "bv-select",
    `bv-select--${size}`,
    fullWidth ? "is-full-width" : "",
    invalid ? "is-invalid" : "",
    className ?? ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <select
      {...props}
      aria-invalid={ariaInvalid}
      className={classes}
      data-invalid={invalid || undefined}
      value={value}
      onChange={(event) => onValueChange(event.currentTarget.value as T)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
