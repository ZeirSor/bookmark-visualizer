import type { ReactNode } from "react";

export function SwitchRow({
  checked,
  label,
  onChange
}: {
  checked: boolean;
  label: string;
  onChange(value: boolean): void;
}) {
  return (
    <label className="switch-row">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

export function SelectRow({
  children,
  label,
  onChange,
  value
}: {
  children: ReactNode;
  label: string;
  value: string;
  onChange(value: string): void;
}) {
  return (
    <label className="select-row">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}
