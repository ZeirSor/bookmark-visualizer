import type { TextareaHTMLAttributes } from "react";
import "./FormControls.css";

type FormControlSize = "sm" | "md" | "lg";
type TextareaResize = "none" | "vertical";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: FormControlSize;
  invalid?: boolean;
  fullWidth?: boolean;
  resize?: TextareaResize;
}

export function Textarea({
  className,
  fullWidth = false,
  invalid = false,
  readOnly,
  resize = "vertical",
  size = "md",
  ...props
}: TextareaProps) {
  const ariaInvalid = props["aria-invalid"] ?? (invalid ? true : undefined);
  const classes = [
    "bv-textarea",
    `bv-textarea--${size}`,
    `bv-textarea--resize-${resize}`,
    fullWidth ? "is-full-width" : "",
    invalid ? "is-invalid" : "",
    readOnly ? "is-readonly" : "",
    className ?? ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <textarea
      {...props}
      aria-invalid={ariaInvalid}
      className={classes}
      data-invalid={invalid || undefined}
      data-readonly={readOnly || undefined}
      readOnly={readOnly}
    />
  );
}
