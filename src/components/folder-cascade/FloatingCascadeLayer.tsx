import { useLayoutEffect, useMemo, useRef } from "react";
import { getCascadeButtonClassName } from "../../features/context-menu";
import { MenuActionContent } from "../MenuActionContent";
import { FolderPlusMenuIcon } from "../icons/MenuActionIcons";
import { FolderCascadeList } from "./FolderCascadeList";
import { handleCascadeBlur } from "./cascadeBehavior";
import {
  FLOATING_CASCADE_MIN_HEIGHT,
  getFloatingLayerStyle,
  getMenuFolders
} from "./cascadePlacement";
import type { FloatingCascadeLayerProps } from "./types";

export function FloatingCascadeLayer({
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
}: FloatingCascadeLayerProps) {
  const nestedFolders = useMemo(() => getMenuFolders(layer.folder.children ?? []), [layer.folder]);
  const style = getFloatingLayerStyle(layer.placement, zIndex);
  const layerRef = useLayoutSize(
    layer.folder.id,
    menuWidth,
    nestedFolders.length,
    Boolean(onCreateFolder),
    onSizeChange
  );

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

function useLayoutSize(
  folderId: string,
  menuWidth: number,
  nestedFolderCount: number,
  canCreateFolder: boolean,
  onSizeChange: FloatingCascadeLayerProps["onSizeChange"]
) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    onSizeChange(folderId, {
      width: Math.max(element.offsetWidth || menuWidth, menuWidth),
      height: Math.max(
        element.scrollHeight || element.offsetHeight || FLOATING_CASCADE_MIN_HEIGHT,
        FLOATING_CASCADE_MIN_HEIGHT
      )
    });
  }, [canCreateFolder, folderId, menuWidth, nestedFolderCount, onSizeChange, ref]);

  return ref;
}
