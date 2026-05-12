import type { InputHTMLAttributes, ReactNode } from "react";
import "./FormControls.css";

type FormControlSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: FormControlSize;
  invalid?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingSlot?: ReactNode;
}

export function Input({
  className,
  disabled,
  fullWidth = false,
  invalid = false,
  leadingIcon,
  readOnly,
  size = "md",
  style,
  trailingSlot,
  ...props
}: InputProps) {
  const ariaInvalid = props["aria-invalid"] ?? (invalid ? true : undefined);
  const classes = [
    "bv-input-shell",
    `bv-input-shell--${size}`,
    fullWidth ? "is-full-width" : "",
    invalid ? "is-invalid" : "",
    disabled ? "is-disabled" : "",
    readOnly ? "is-readonly" : "",
    className ?? ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} style={style} data-invalid={invalid || undefined} data-readonly={readOnly || undefined}>
      {leadingIcon ? <span className="bv-input-icon" aria-hidden="true">{leadingIcon}</span> : null}
      <input
        {...props}
        aria-invalid={ariaInvalid}
        className="bv-input-control"
        disabled={disabled}
        readOnly={readOnly}
      />
      {trailingSlot ? <span className="bv-input-trailing">{trailingSlot}</span> : null}
    </span>
  );
}
