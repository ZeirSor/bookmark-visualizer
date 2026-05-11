import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "text" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
  selected?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  className,
  disabled,
  fullWidth = false,
  leadingIcon,
  loading = false,
  selected = false,
  size = "md",
  trailingIcon,
  type = "button",
  variant = "secondary",
  ...props
}: ButtonProps) {
  const classes = [
    "bv-button",
    `bv-button--${variant}`,
    `bv-button--${size}`,
    fullWidth ? "is-full-width" : "",
    loading ? "is-loading" : "",
    selected ? "is-selected" : "",
    className ?? ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      aria-busy={loading || props["aria-busy"] ? true : undefined}
      className={classes}
      data-selected={selected || undefined}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? <span className="bv-button-spinner" aria-hidden="true" /> : null}
      {leadingIcon ? <span className="bv-button-icon" aria-hidden="true">{leadingIcon}</span> : null}
      <span className="bv-button-label">{children}</span>
      {trailingIcon ? <span className="bv-button-icon" aria-hidden="true">{trailingIcon}</span> : null}
    </button>
  );
}
