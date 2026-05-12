import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";
import {
  getCascadeMenuPlacement,
  getCascadePathOnRowEnter
} from "../features/context-menu";
import { FloatingCascadeLayer } from "./folder-cascade/FloatingCascadeLayer";
import { FolderCascadeList } from "./folder-cascade/FolderCascadeList";
import { CASCADE_SUBMENU_CLOSE_DELAY_MS } from "./folder-cascade/cascadeBehavior";
import {
  FLOATING_CASCADE_WIDTH,
  buildFolderMap,
  estimateLayerSize,
  getMenuFolders,
  getViewport,
  rectToAnchor
} from "./folder-cascade/cascadePlacement";
import type {
  CascadeMenuSize,
  FolderCascadeMenuProps
} from "./folder-cascade/types";
import type { BookmarkNode } from "../features/bookmarks";

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
  const [anchors, setAnchors] = useState<Record<string, ReturnType<typeof rectToAnchor>>>({});
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

  useEffect(() => clearCloseTimer, [clearCloseTimer]);

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
                zIndex={620 + index}
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
