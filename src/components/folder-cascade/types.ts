import type { FocusEvent, ReactNode } from "react";
import type { BookmarkNode } from "../../features/bookmarks";
import type {
  CascadeMenuAnchorRect,
  CascadeMenuPlacement,
  CascadeMenuSize
} from "../../features/context-menu";

export interface FolderCascadeMenuProps {
  nodes: BookmarkNode[];
  selectedFolderId?: string;
  currentFolderId?: string;
  initialActivePathIds?: string[];
  autoExpandInitialPath?: boolean;
  highlightedFolderIds?: string[];
  disabledLabel?: string;
  density?: "default" | "compact";
  menuWidth?: number;
  onSelect(folder: BookmarkNode): void;
  canSelect(folder: BookmarkNode): boolean;
  onCreateFolder?(parentFolder: BookmarkNode): void;
  onOpenFolder?(folder: BookmarkNode): void;
  onCascadeEnter?(): void;
  onCascadeLeave?(): void;
  portalContainer?: Element | DocumentFragment;
  renderCreateAction?(parentFolder: BookmarkNode): ReactNode;
}

export interface CascadeLayer {
  folder: BookmarkNode;
  path: string[];
  placement: CascadeMenuPlacement;
}

export interface FolderCascadeListProps {
  folders: BookmarkNode[];
  parentPath: string[];
  activePath: string[];
  highlightedFolderIdSet: Set<string>;
  selectedFolderId?: string;
  currentFolderId?: string;
  disabledLabel?: string;
  onSelect(folder: BookmarkNode): void;
  canSelect(folder: BookmarkNode): boolean;
  onOpenFolder?(folder: BookmarkNode): void;
  canCreateFolder: boolean;
  onRowEnter(parentPath: string[], folder: BookmarkNode, hasSubmenu: boolean, element: HTMLElement): void;
  onRegisterAnchor(folderId: string, element: HTMLElement): void;
  onCascadeEnter(): void;
  onCascadeLeave(): void;
}

export interface FloatingCascadeLayerProps
  extends Omit<FolderCascadeListProps, "folders" | "parentPath" | "canCreateFolder"> {
  layer: CascadeLayer;
  zIndex: number;
  density: "default" | "compact";
  menuWidth: number;
  onCreateFolder?(parentFolder: BookmarkNode): void;
  renderCreateAction?(parentFolder: BookmarkNode): ReactNode;
  onSizeChange(folderId: string, size: CascadeMenuSize): void;
}

export type CascadeBlurEvent = FocusEvent<HTMLElement>;
export type { CascadeMenuAnchorRect, CascadeMenuSize };
