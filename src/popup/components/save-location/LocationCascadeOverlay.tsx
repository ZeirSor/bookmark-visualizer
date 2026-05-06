import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FolderCascadeMenu } from "../../../components/FolderCascadeMenu";
import {
  canCreateBookmarkInFolder,
  type BookmarkNode
} from "../../../features/bookmarks";
import {
  getPopupCascadeRootPlacement,
  type PopupCascadeAnchorRect
} from "../../../features/context-menu/popupCascadePlacement";

const POPUP_CASCADE_MENU_WIDTH = 224;
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

  useLayoutEffect(() => {
    updatePlacement();

    function handleResize() {
      updatePlacement();
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [anchorElement]);

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

  if (!placement || typeof document === "undefined") {
    return null;
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
        autoExpandInitialPath={false}
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
