import type { ReactNode } from "react";

export function IconSvg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export function SaveIcon() {
  return (
    <IconSvg>
      <path d="M12 3v11" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </IconSvg>
  );
}

export function FolderIcon() {
  return (
    <IconSvg>
      <path d="M3 7.5h6l2 2H21v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1.5" />
    </IconSvg>
  );
}

export function SettingsIcon() {
  return (
    <IconSvg>
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

export function ExternalLinkIcon() {
  return (
    <IconSvg>
      <path d="M14 4h6v6" />
      <path d="M20 4 10 14" />
      <path d="M12 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6" />
    </IconSvg>
  );
}

export function SearchIcon() {
  return (
    <IconSvg>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </IconSvg>
  );
}

export function FolderPlusIcon() {
  return (
    <IconSvg>
      <path d="M3 7.5h6l2 2h10v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M16 13v5" />
      <path d="M13.5 15.5h5" />
    </IconSvg>
  );
}

export function ChevronRightIcon() {
  return (
    <IconSvg>
      <path d="m9 6 6 6-6 6" />
    </IconSvg>
  );
}

export function CheckIcon() {
  return (
    <IconSvg>
      <path d="m5 12 4 4L19 6" />
    </IconSvg>
  );
}

