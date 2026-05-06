import type { ReactNode, SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

export function IconSvg({ children, className, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export function SaveIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M12 3v11" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </IconSvg>
  );
}

export function FolderIcon(props: IconProps & { filled?: boolean }) {
  const { filled = false, className, ...iconProps } = props;

  return (
    <IconSvg className={`${filled ? "is-filled" : ""} ${className ?? ""}`.trim() || undefined} {...iconProps}>
      <path d="M3 7.5h6l2 2h10v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1.5" />
    </IconSvg>
  );
}

export function FolderPlusIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M3 7.5h6l2 2h10v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1.5" />
      <path d="M12 13v5" />
      <path d="M9.5 15.5h5" />
    </IconSvg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
      <path d="M4 12h2" />
      <path d="M18 12h2" />
      <path d="m6.3 6.3 1.4 1.4" />
      <path d="m16.3 16.3 1.4 1.4" />
      <path d="m17.7 6.3-1.4 1.4" />
      <path d="m7.7 16.3-1.4 1.4" />
    </IconSvg>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M14 4h6v6" />
      <path d="M20 4 10 14" />
      <path d="M12 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6" />
    </IconSvg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </IconSvg>
  );
}

export function RecentIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
      <path d="M5 5 3.5 6.5" />
      <path d="M19 5l1.5 1.5" />
    </IconSvg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="m9 6 6 6-6 6" />
    </IconSvg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="m5 12 4 4L19 6" />
    </IconSvg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="m7 7 10 10" />
      <path d="M17 7 7 17" />
    </IconSvg>
  );
}
