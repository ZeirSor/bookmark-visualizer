import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FolderCascadeMenu } from "../../../components/FolderCascadeMenu";
import {
  buildFolderCascadeInitialPathIds,
  canCreateBookmarkInFolder,
  type BookmarkNode
} from "../../../features/bookmarks";
import {
  getPopupCascadeRootPlacement,
  type PopupCascadeAnchorRect
} from "../../../features/context-menu/popupCascadePlacement";
import { isCompactLocationPickerViewport } from "./locationPickerViewport";

const POPUP_CASCADE_MENU_WIDTH = 236;
const POPUP_CASCADE_MENU_HEIGHT = 330;

export function LocationCascadeOverlay({
  anchorElement,
  currentFolderId,
  highlightedFolderIds,
  selectedFolderId,
  tree,
  onCascadeEnter,
  onCascadeLeave,
  onCreateFolder,
  onRequestClose,
  onSelect
}: {
  anchorElement: HTMLElement | null;
  currentFolderId: string;
  highlightedFolderIds: string[];
  selectedFolderId: string;
  tree: BookmarkNode[];
  onCascadeEnter(): void;
  onCascadeLeave(): void;
  onCreateFolder(parentFolder: BookmarkNode): void;
  onRequestClose(): void;
  onSelect(folder: BookmarkNode): void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [anchorRect, setAnchorRect] = useState<PopupCascadeAnchorRect>();
  const [viewport, setViewport] = useState(() => getViewport());
  const [dialogElement, setDialogElement] = useState<HTMLDivElement | null>(null);
  const useDialog = isCompactLocationPickerViewport(viewport);
  const setOverlayElement = useCallback((element: HTMLDivElement | null) => {
    overlayRef.current = element;
    setDialogElement((current) => (current === element ? current : element));
  }, []);

  useLayoutEffect(() => {
    updatePlacement();

    function handleResize() {
      updatePlacement();
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [anchorElement]);

  useEffect(() => {
    if (useDialog) {
      overlayRef.current?.focus();
    }
  }, [useDialog]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      const element = target instanceof Element ? target : target.parentElement;
      if (
        anchorElement?.contains(target) ||
        overlayRef.current?.contains(target) ||
        element?.closest("[data-popup-cascade-layer='true']")
      ) {
        return;
      }

      onRequestClose();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      onRequestClose();
    }

    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [anchorElement, onRequestClose]);

  const placement = useMemo(() => {
    if (!anchorRect) {
      return undefined;
    }

    return getPopupCascadeRootPlacement(anchorRect, viewport, {
      rootWidth: POPUP_CASCADE_MENU_WIDTH,
      columnWidth: POPUP_CASCADE_MENU_WIDTH,
      preferredColumns: 3,
      menuHeight: POPUP_CASCADE_MENU_HEIGHT
    });
  }, [anchorRect, viewport]);
  const initialActivePathIds = useMemo(
    () => buildFolderCascadeInitialPathIds(tree, selectedFolderId),
    [selectedFolderId, tree]
  );

  if (!placement || typeof document === "undefined") {
    return null;
  }

  if (useDialog) {
    return createPortal(
      <div
        className="location-picker-dialog-backdrop"
        data-popup-cascade-layer="true"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) {
            onRequestClose();
          }
        }}
      >
        <div
          ref={setOverlayElement}
          className="location-picker-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="选择保存位置"
          tabIndex={-1}
          onWheel={(event) => event.stopPropagation()}
        >
          <div className="location-picker-dialog-header">
            <strong>选择保存位置</strong>
            <button type="button" className="text-action" onClick={onRequestClose}>
              关闭
            </button>
          </div>
          <div className="location-picker-dialog-body">
            <FolderCascadeMenu
              nodes={tree}
              selectedFolderId={selectedFolderId}
              currentFolderId={currentFolderId}
              highlightedFolderIds={highlightedFolderIds}
              initialActivePathIds={initialActivePathIds}
              autoExpandInitialPath
              disabledLabel="不可保存"
              density="compact"
              menuWidth={POPUP_CASCADE_MENU_WIDTH}
              canSelect={canCreateBookmarkInFolder}
              onSelect={onSelect}
              onCreateFolder={onCreateFolder}
              onCascadeEnter={onCascadeEnter}
              onCascadeLeave={onCascadeLeave}
              portalContainer={dialogElement ?? document.body}
            />
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      ref={overlayRef}
      className="location-cascade-overlay"
      data-popup-cascade-layer="true"
      role="menu"
      style={{
        left: placement.x,
        top: placement.y,
        maxHeight: placement.maxHeight
      }}
      onPointerEnter={onCascadeEnter}
      onPointerLeave={onCascadeLeave}
      onFocus={onCascadeEnter}
      onBlur={onCascadeLeave}
      onWheel={(event) => event.stopPropagation()}
    >
      <FolderCascadeMenu
        nodes={tree}
        selectedFolderId={selectedFolderId}
        currentFolderId={currentFolderId}
        highlightedFolderIds={highlightedFolderIds}
        initialActivePathIds={initialActivePathIds}
        autoExpandInitialPath
        disabledLabel="不可保存"
        density="compact"
        menuWidth={POPUP_CASCADE_MENU_WIDTH}
        canSelect={canCreateBookmarkInFolder}
        onSelect={onSelect}
        onCreateFolder={onCreateFolder}
        onCascadeEnter={onCascadeEnter}
        onCascadeLeave={onCascadeLeave}
        portalContainer={document.body}
      />
    </div>,
    document.body
  );

  function updatePlacement() {
    if (!anchorElement) {
      return;
    }

    const rect = anchorElement.getBoundingClientRect();
    setAnchorRect({
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left
    });
    setViewport(getViewport());
  }
}

function getViewport() {
  if (typeof window === "undefined") {
    return { width: 1024, height: 768 };
  }

  return { width: window.innerWidth, height: window.innerHeight };
}
