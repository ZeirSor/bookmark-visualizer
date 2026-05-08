import type { IconProps } from "./AppIcons";
import { IconSvg } from "./AppIcons";

export function MoreIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <circle cx="6" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="18" cy="12" r="1" />
    </IconSvg>
  );
}

export function SortIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M6 7h12" />
      <path d="M9 12h9" />
      <path d="M12 17h6" />
      <path d="m5 15-2 2 2 2" />
      <path d="M3 17h5" />
    </IconSvg>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M4 5h16l-6 7v5l-4 2v-7Z" />
    </IconSvg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="m6 9 6 6 6-6" />
    </IconSvg>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M20 11a8 8 0 0 0-14.4-4.8L4 8" />
      <path d="M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 14.4 4.8L20 16" />
      <path d="M20 20v-4h-4" />
    </IconSvg>
  );
}

export function TagIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M20 13 13 20 4 11V4h7Z" />
      <circle cx="8.5" cy="8.5" r="1" />
    </IconSvg>
  );
}

export function ReadLaterIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z" />
      <path d="M12 8v4l3 2" />
    </IconSvg>
  );
}

export function TrashLineIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
    </IconSvg>
  );
}

export function ImportIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
    </IconSvg>
  );
}

export function ExportIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M12 21V9" />
      <path d="m8 17 4 4 4-4" />
      <path d="M5 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />
    </IconSvg>
  );
}

export function DuplicateIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <path d="M9 9h6" />
      <path d="M9 13h6" />
      <path d="M3 15V5a2 2 0 0 1 2-2h10" />
    </IconSvg>
  );
}

export function ActivityIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      <path d="M4 13h4l2-6 4 12 2-6h4" />
    </IconSvg>
  );
}
