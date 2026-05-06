import type { ReactNode } from "react";

export function MenuActionContent({
  icon,
  children,
  trailing
}: {
  icon: ReactNode;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <>
      <span className="menu-action-icon-slot" aria-hidden="true">
        {icon}
      </span>
      <span className="menu-action-label">{children}</span>
      {trailing ? <span className="menu-action-trailing">{trailing}</span> : null}
    </>
  );
}
