import type { IconProps } from "./AppIcons";
import { IconSvg } from "./AppIcons";

export function EditIcon(props: IconProps) {
  return (
    <IconSvg className="menu-action-icon" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </IconSvg>
  );
}

export function BookmarkBeforeIcon(props: IconProps) {
  return (
    <IconSvg className="menu-action-icon" {...props}>
      <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z" />
      <path d="M12 8v5" />
      <path d="M9.5 10.5h5" />
      <path d="M4 2h16" />
    </IconSvg>
  );
}

export function BookmarkAfterIcon(props: IconProps) {
  return (
    <IconSvg className="menu-action-icon" {...props}>
      <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z" />
      <path d="M12 8v5" />
      <path d="M9.5 10.5h5" />
      <path d="M4 22h16" />
    </IconSvg>
  );
}

export function MoveToFolderIcon(props: IconProps) {
  return (
    <IconSvg className="menu-action-icon" {...props}>
      <path d="M3 7.5h6l2 2h10v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1.5" />
      <path d="m13 14 3 3 3-3" />
      <path d="M16 11v6" />
    </IconSvg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <IconSvg className="menu-action-icon" {...props}>
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
    </IconSvg>
  );
}

export function SearchFolderIcon(props: IconProps) {
  return (
    <IconSvg className="menu-action-icon" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
      <path d="M7 11h8" />
    </IconSvg>
  );
}

export function RecentFolderIcon(props: IconProps) {
  return (
    <IconSvg className="menu-action-icon" {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
      <path d="M5 5 3.5 6.5" />
      <path d="M19 5l1.5 1.5" />
    </IconSvg>
  );
}

export function FolderLineIcon(props: IconProps) {
  return (
    <IconSvg className="menu-action-icon" {...props}>
      <path d="M3 7.5h6l2 2h10v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1.5" />
    </IconSvg>
  );
}

export function FolderPlusMenuIcon(props: IconProps) {
  return (
    <IconSvg className="menu-action-icon" {...props}>
      <path d="M3 7.5h6l2 2h10v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1.5" />
      <path d="M12 13v5" />
      <path d="M9.5 15.5h5" />
    </IconSvg>
  );
}
