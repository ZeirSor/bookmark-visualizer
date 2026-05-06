import type { ReactNode } from "react";

export function TabButton({
  active,
  children,
  icon,
  onClick
}: {
  active: boolean;
  children: string;
  icon: ReactNode;
  onClick(): void;
}) {
  return (
    <button type="button" className={active ? "is-active" : ""} onClick={onClick}>
      {icon}
      <span>{children}</span>
    </button>
  );
}

