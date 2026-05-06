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

export function GlobeIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.4 2.4 3.6 5.4 3.6 9S14.4 18.6 12 21" />
      <path d="M12 3c-2.4 2.4-3.6 5.4-3.6 9s1.2 6.6 3.6 9" />
    </IconSvg>
  );
}

export function ImageIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8" cy="10" r="1.5" />
      <path d="m21 15-4.5-4.5L8 19" />
    </IconSvg>
  );
}

export function NewsIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M4 5h13a3 3 0 0 1 3 3v11H6a2 2 0 0 1-2-2Z" />
      <path d="M8 9h6" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </IconSvg>
  );
}

export function VideoIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="m16 10 5-3v10l-5-3" />
    </IconSvg>
  );
}

export function MapIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3Z" />
      <path d="M9 3v15" />
      <path d="M15 6v15" />
    </IconSvg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 7 7 0 1 0 20 15.5Z" />
    </IconSvg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <rect x="4" y="4" width="6" height="6" rx="1.5" />
      <rect x="14" y="4" width="6" height="6" rx="1.5" />
      <rect x="4" y="14" width="6" height="6" rx="1.5" />
      <rect x="14" y="14" width="6" height="6" rx="1.5" />
    </IconSvg>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M12 3v12" />
      <path d="m7 8 5-5 5 5" />
      <path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
    </IconSvg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconSvg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2l-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" />
    </IconSvg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="m15 4 5 5-4 1-4 4v4l-2 2-4-4 2-2h4l4-4Z" />
      <path d="m4 20 5-5" />
    </IconSvg>
  );
}

export function ReturnIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M20 7v5a4 4 0 0 1-4 4H5" />
      <path d="m9 12-4 4 4 4" />
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
