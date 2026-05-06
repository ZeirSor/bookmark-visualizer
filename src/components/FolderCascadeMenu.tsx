import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
  type FocusEvent,
  type PointerEvent
} from "react";
import { createPortal } from "react-dom";
import {
  getDisplayTitle,
  isFolder,
  type BookmarkNode
} from "../features/bookmarks";
import {
  getCascadeButtonClassName,
  getCascadeMenuPlacement,
  getCascadePathOnRowEnter,
  getCascadeRowBehavior,
  type CascadeMenuAnchorRect,
  type CascadeMenuPlacement,
  type CascadeMenuSize
} from "../features/context-menu";
import { MenuActionContent } from "./MenuActionContent";
import { FolderLineIcon, FolderPlusMenuIcon } from "./icons/MenuActionIcons";

interface FolderCascadeMenuProps {
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

interface CascadeLayer {
  folder: BookmarkNode;
  path: string[];
  placement: CascadeMenuPlacement;
}

const CASCADE_SUBMENU_CLOSE_DELAY_MS = 320;
const FLOATING_CASCADE_WIDTH = 260;
const FLOATING_CASCADE_MIN_HEIGHT = 180;
const FLOATING_CASCADE_ROW_HEIGHT = 34;
const FLOATING_CASCADE_PADDING = 12;

export function FolderCascadeMenu({
  nodes,
  selectedFolderId,
  currentFolderId,
  initialActivePathIds,
  autoExpandInitialPath = true,
  highlightedFolderIds,
  disabledLabel,
  density = "default",
  menuWidth = FLOATING_CASCADE_WIDTH,
  onSelect,
  canSelect,
  onCreateFolder,
  onOpenFolder,
  onCascadeEnter,
  onCascadeLeave,
  portalContainer,
  renderCreateAction
}: FolderCascadeMenuProps) {
  const folders = useMemo(() => getMenuFolders(nodes), [nodes]);
  const folderMap = useMemo(() => buildFolderMap(folders), [folders]);
  const highlightedFolderIdSet = useMemo(
    () => new Set(highlightedFolderIds ?? []),
    [highlightedFolderIds]
  );
  const [activePath, setActivePath] = useState<string[]>([]);
  const [anchors, setAnchors] = useState<Record<string, CascadeMenuAnchorRect>>({});
  const [menuSizes, setMenuSizes] = useState<Record<string, CascadeMenuSize>>({});
  const [viewport, setViewport] = useState(() => getViewport());
  const closeTimerRef = useRef<number | undefined>(undefined);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = undefined;
    }
  }, []);

  const closeCascade = useCallback(() => {
    clearCloseTimer();
    setActivePath([]);
  }, [clearCloseTimer]);

  const scheduleCloseCascade = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(closeCascade, CASCADE_SUBMENU_CLOSE_DELAY_MS);
    onCascadeLeave?.();
  }, [clearCloseTimer, closeCascade, onCascadeLeave]);

  const keepCascadeOpen = useCallback(() => {
    clearCloseTimer();
    onCascadeEnter?.();
  }, [clearCloseTimer, onCascadeEnter]);

  const handleRowEnter = useCallback(
    (parentPath: string[], folder: BookmarkNode, hasSubmenu: boolean, element: HTMLElement) => {
      keepCascadeOpen();
      setViewport(getViewport());
      setAnchors((current) => ({
        ...current,
        [folder.id]: rectToAnchor(element.getBoundingClientRect())
      }));
      setActivePath(getCascadePathOnRowEnter(parentPath, folder.id, hasSubmenu));
    },
    [keepCascadeOpen]
  );

  const handleLayerSizeChange = useCallback((folderId: string, size: CascadeMenuSize) => {
    setMenuSizes((current) => {
      const previous = current[folderId];
      if (previous?.width === size.width && previous.height === size.height) {
        return current;
      }

      return { ...current, [folderId]: size };
    });
  }, []);

  const registerAnchor = useCallback((folderId: string, element: HTMLElement) => {
    const nextAnchor = rectToAnchor(element.getBoundingClientRect());

    setAnchors((current) => {
      const previous = current[folderId];

      if (
        previous &&
        previous.top === nextAnchor.top &&
        previous.right === nextAnchor.right &&
        previous.bottom === nextAnchor.bottom &&
        previous.left === nextAnchor.left
      ) {
        return current;
      }

      return {
        ...current,
        [folderId]: nextAnchor
      };
    });
  }, []);

  const layers = useMemo(() => {
    return activePath.flatMap((folderId, index) => {
      const folder = folderMap.get(folderId);
      const anchor = anchors[folderId];

      if (!folder || !anchor) {
        return [];
      }

      const size =
        menuSizes[folderId] ?? estimateLayerSize(folder, Boolean(onCreateFolder), menuWidth);
      const placement = getCascadeMenuPlacement(anchor, viewport, size);

      return [{ folder, path: activePath.slice(0, index + 1), placement }];
    });
  }, [activePath, anchors, folderMap, menuSizes, menuWidth, onCreateFolder, viewport]);

  useEffect(() => {
    return clearCloseTimer;
  }, [clearCloseTimer]);

  useEffect(() => {
    setActivePath((current) => current.filter((folderId) => folderMap.has(folderId)));
  }, [folderMap]);

  useEffect(() => {
    if (!autoExpandInitialPath || !initialActivePathIds) {
      return;
    }

    setActivePath(initialActivePathIds.filter((folderId) => folderMap.has(folderId)));
  }, [autoExpandInitialPath, folderMap, initialActivePathIds]);

  useEffect(() => {
    function handleResize() {
      setViewport(getViewport());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (folders.length === 0) {
    return <div className="move-menu-empty">没有可用文件夹</div>;
  }

  return (
    <>
      <FolderCascadeList
        folders={folders}
        parentPath={[]}
        activePath={activePath}
        highlightedFolderIdSet={highlightedFolderIdSet}
        selectedFolderId={selectedFolderId}
        currentFolderId={currentFolderId}
        disabledLabel={disabledLabel}
        onSelect={onSelect}
        canSelect={canSelect}
        onOpenFolder={onOpenFolder}
        canCreateFolder={Boolean(onCreateFolder)}
        onRowEnter={handleRowEnter}
        onRegisterAnchor={registerAnchor}
        onCascadeEnter={keepCascadeOpen}
        onCascadeLeave={scheduleCloseCascade}
      />
      {typeof document === "undefined"
        ? null
        : createPortal(
            layers.map((layer, index) => (
              <FloatingCascadeLayer
                key={layer.folder.id}
                layer={layer}
                zIndex={31 + index}
                density={density}
                menuWidth={menuWidth}
                selectedFolderId={selectedFolderId}
                currentFolderId={currentFolderId}
                activePath={activePath}
                highlightedFolderIdSet={highlightedFolderIdSet}
                disabledLabel={disabledLabel}
                onSelect={onSelect}
                canSelect={canSelect}
                onOpenFolder={onOpenFolder}
                onCreateFolder={onCreateFolder}
                renderCreateAction={renderCreateAction}
                onRowEnter={handleRowEnter}
                onRegisterAnchor={registerAnchor}
                onCascadeEnter={keepCascadeOpen}
                onCascadeLeave={scheduleCloseCascade}
                onSizeChange={handleLayerSizeChange}
              />
            )),
            portalContainer ?? document.body
          )}
    </>
  );
}

function FolderCascadeList({
  folders,
  parentPath,
  activePath,
  highlightedFolderIdSet,
  selectedFolderId,
  currentFolderId,
  disabledLabel,
  onSelect,
  canSelect,
  onOpenFolder,
  canCreateFolder,
  onRowEnter,
  onRegisterAnchor,
  onCascadeEnter,
  onCascadeLeave
}: {
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
}) {
  return (
    <div
      className="move-menu-list"
      onPointerEnter={onCascadeEnter}
      onPointerLeave={onCascadeLeave}
      onFocus={onCascadeEnter}
      onBlur={(event) => handleCascadeBlur(event, onCascadeLeave)}
      onWheel={(event) => event.stopPropagation()}
    >
      {folders.map((folder) => (
        <FolderCascadeRow
          key={folder.id}
          folder={folder}
          parentPath={parentPath}
          activePath={activePath}
          highlightedFolderIdSet={highlightedFolderIdSet}
          selectedFolderId={selectedFolderId}
          currentFolderId={currentFolderId}
          disabledLabel={disabledLabel}
          onSelect={onSelect}
          canSelect={canSelect}
          onOpenFolder={onOpenFolder}
          canCreateFolder={canCreateFolder}
          onRowEnter={onRowEnter}
          onRegisterAnchor={onRegisterAnchor}
        />
      ))}
    </div>
  );
}

function FolderCascadeRow({
  folder,
  parentPath,
  activePath,
  highlightedFolderIdSet,
  selectedFolderId,
  currentFolderId,
  disabledLabel,
  onSelect,
  canSelect,
  onOpenFolder,
  canCreateFolder,
  onRowEnter,
  onRegisterAnchor
}: {
  folder: BookmarkNode;
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
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const selectable = canSelect(folder);
  const nestedFolders = folder.children?.filter(isFolder) ?? [];
  const behavior = getCascadeRowBehavior({
    selectable,
    nestedFolderCount: nestedFolders.length,
    canCreateFolder
  });
  const isCurrentFolder = currentFolderId === folder.id;
  const isSelected = selectedFolderId === folder.id;
  const isHighlighted = highlightedFolderIdSet.has(folder.id);
  const title = getDisplayTitle(folder);
  const rowNote = isCurrentFolder
    ? "当前位置"
    : !behavior.canSelect && disabledLabel
      ? disabledLabel
      : undefined;
  const hasTrailing = Boolean(rowNote) || behavior.hasSubmenu;

  useLayoutEffect(() => {
    const element = rowRef.current;

    if (element && activePath.includes(folder.id)) {
      onRegisterAnchor(folder.id, element);
    }
  }, [activePath, folder.id, onRegisterAnchor]);

  function handleEnter(event: PointerEvent<HTMLDivElement> | FocusEvent<HTMLDivElement>) {
    onRowEnter(parentPath, folder, behavior.hasSubmenu, event.currentTarget);
  }

  return (
    <div
      ref={rowRef}
      className={`move-folder-row ${behavior.hasSubmenu ? "has-children" : ""} ${
        isCurrentFolder ? "is-current-parent" : ""
      } ${isSelected ? "is-selected" : ""} ${isHighlighted ? "is-path-highlighted" : ""}`}
      onPointerEnter={handleEnter}
      onFocus={handleEnter}
    >
      <button
        className={getCascadeButtonClassName()}
        type="button"
        aria-disabled={!behavior.canSelect}
        disabled={behavior.buttonDisabled}
        title={title}
        onClick={() => {
          if (behavior.canSelect) {
            onSelect(folder);
          }
        }}
        onDoubleClick={() => {
          if (behavior.hasSubmenu) {
            onOpenFolder?.(folder);
          }
        }}
      >
        <span className="menu-action-icon-slot" aria-hidden="true">
          <FolderLineIcon />
        </span>
        <span className="menu-action-label">{title}</span>
        {hasTrailing ? (
          <span className="move-folder-row-trailing">
            {rowNote ? <span className="move-menu-note">{rowNote}</span> : null}
            {behavior.hasSubmenu ? <span className="menu-chevron" aria-hidden="true" /> : null}
          </span>
        ) : null}
      </button>
    </div>
  );
}

function FloatingCascadeLayer({
  layer,
  zIndex,
  density,
  menuWidth,
  selectedFolderId,
  currentFolderId,
  activePath,
  highlightedFolderIdSet,
  disabledLabel,
  onSelect,
  canSelect,
  onOpenFolder,
  onCreateFolder,
  renderCreateAction,
  onRowEnter,
  onRegisterAnchor,
  onCascadeEnter,
  onCascadeLeave,
  onSizeChange
}: {
  layer: CascadeLayer;
  zIndex: number;
  density: "default" | "compact";
  menuWidth: number;
  selectedFolderId?: string;
  currentFolderId?: string;
  activePath: string[];
  highlightedFolderIdSet: Set<string>;
  disabledLabel?: string;
  onSelect(folder: BookmarkNode): void;
  canSelect(folder: BookmarkNode): boolean;
  onOpenFolder?(folder: BookmarkNode): void;
  onCreateFolder?(parentFolder: BookmarkNode): void;
  renderCreateAction?(parentFolder: BookmarkNode): ReactNode;
  onRowEnter(parentPath: string[], folder: BookmarkNode, hasSubmenu: boolean, element: HTMLElement): void;
  onRegisterAnchor(folderId: string, element: HTMLElement): void;
  onCascadeEnter(): void;
  onCascadeLeave(): void;
  onSizeChange(folderId: string, size: CascadeMenuSize): void;
}) {
  const layerRef = useRef<HTMLDivElement>(null);
  const nestedFolders = useMemo(() => getMenuFolders(layer.folder.children ?? []), [layer.folder]);
  const style = getFloatingLayerStyle(layer.placement, zIndex);

  useLayoutEffect(() => {
    const element = layerRef.current;

    if (!element) {
      return;
    }

    onSizeChange(layer.folder.id, {
      width: Math.max(element.offsetWidth || menuWidth, menuWidth),
      height: Math.max(element.scrollHeight || element.offsetHeight || FLOATING_CASCADE_MIN_HEIGHT, FLOATING_CASCADE_MIN_HEIGHT)
    });
  }, [layer.folder.id, menuWidth, nestedFolders.length, onCreateFolder, onSizeChange]);

  return (
    <div
      ref={layerRef}
      className={`context-submenu nested-submenu is-floating-cascade ${
        density === "compact" ? "popup-compact" : ""
      } opens-${layer.placement.submenuDirection} opens-${layer.placement.submenuBlockDirection}`}
      data-popup-cascade-layer={density === "compact" ? "true" : undefined}
      role="menu"
      style={style}
      onPointerEnter={onCascadeEnter}
      onPointerLeave={onCascadeLeave}
      onFocus={onCascadeEnter}
      onBlur={(event) => handleCascadeBlur(event, onCascadeLeave)}
      onWheel={(event) => event.stopPropagation()}
    >
      <FolderCascadeList
        folders={nestedFolders}
        parentPath={layer.path}
        activePath={activePath}
        highlightedFolderIdSet={highlightedFolderIdSet}
        selectedFolderId={selectedFolderId}
        currentFolderId={currentFolderId}
        disabledLabel={disabledLabel}
        onSelect={onSelect}
        canSelect={canSelect}
        onOpenFolder={onOpenFolder}
        canCreateFolder={Boolean(onCreateFolder)}
        onRowEnter={onRowEnter}
        onRegisterAnchor={onRegisterAnchor}
        onCascadeEnter={onCascadeEnter}
        onCascadeLeave={onCascadeLeave}
      />
      {renderCreateAction
        ? renderCreateAction(layer.folder)
        : onCreateFolder
          ? (
              <button
                className={getCascadeButtonClassName("move-folder-create")}
                type="button"
                role="menuitem"
                onClick={() => onCreateFolder(layer.folder)}
              >
                <MenuActionContent icon={<FolderPlusMenuIcon />}>新建文件夹...</MenuActionContent>
              </button>
            )
          : null}
    </div>
  );
}

function getMenuFolders(nodes: BookmarkNode[]): BookmarkNode[] {
  return nodes.flatMap((node) => {
    if (!isFolder(node)) {
      return [];
    }

    if (!node.parentId) {
      return getMenuFolders(node.children ?? []);
    }

    return [node];
  });
}

function buildFolderMap(folders: BookmarkNode[]): Map<string, BookmarkNode> {
  const map = new Map<string, BookmarkNode>();

  function walk(nodes: BookmarkNode[]) {
    nodes.forEach((node) => {
      map.set(node.id, node);
      walk(getMenuFolders(node.children ?? []));
    });
  }

  walk(folders);
  return map;
}

function estimateLayerSize(
  folder: BookmarkNode,
  canCreateFolder: boolean,
  menuWidth: number
): CascadeMenuSize {
  const rowCount = getMenuFolders(folder.children ?? []).length + (canCreateFolder ? 1 : 0);

  return {
    width: menuWidth,
    height: Math.max(
      FLOATING_CASCADE_MIN_HEIGHT,
      rowCount * FLOATING_CASCADE_ROW_HEIGHT + FLOATING_CASCADE_PADDING
    )
  };
}

function rectToAnchor(rect: DOMRect): CascadeMenuAnchorRect {
  return {
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left
  };
}

function getViewport() {
  if (typeof window === "undefined") {
    return { width: 1024, height: 768 };
  }

  return { width: window.innerWidth, height: window.innerHeight };
}

function getFloatingLayerStyle(placement: CascadeMenuPlacement, zIndex: number): CSSProperties {
  return {
    left: placement.x,
    top: placement.y,
    maxHeight: placement.maxHeight,
    overflowY: placement.needsScroll ? "auto" : "visible",
    overflowX: "hidden",
    zIndex
  };
}

function handleCascadeBlur(event: FocusEvent<HTMLElement>, onBlurOutside: () => void) {
  const nextTarget = event.relatedTarget;

  if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
    onBlurOutside();
  }
}
