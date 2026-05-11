import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

type IconButtonSize = "sm" | "md" | "lg";
type IconButtonTone = "neutral" | "accent" | "danger";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> {
  icon: ReactNode;
  label: string;
  size?: IconButtonSize;
  tone?: IconButtonTone;
  loading?: boolean;
  selected?: boolean;
  tooltip?: string;
}

export function IconButton({
  className,
  disabled,
  icon,
  label,
  loading = false,
  selected = false,
  size = "md",
  title,
  tone = "neutral",
  tooltip,
  type = "button",
  ...props
}: IconButtonProps) {
  const classes = [
    "bv-icon-button",
    `bv-icon-button--${size}`,
    `bv-icon-button--${tone}`,
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
      aria-label={label}
      className={classes}
      data-selected={selected || undefined}
      disabled={disabled || loading}
      title={title ?? tooltip ?? label}
      type={type}
    >
      {loading ? <span className="bv-button-spinner" aria-hidden="true" /> : icon}
    </button>
  );
}
