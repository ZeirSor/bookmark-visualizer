import { useState } from "react";
import type { BookmarkNode, FolderOption } from "../../bookmarks";
import { ChevronRightIcon, FolderIcon } from "../../../popup/components/PopupIcons";
import { InlineFolderPicker, type InlineFolderPickerCreateControls } from "./InlineFolderPicker";

export function FolderPathSelector({
  compactPath,
  create,
  fullPath,
  loading,
  recentFolders,
  selectedFolderId,
  selectedTitle,
  title,
  tree,
  onManage,
  onSelect
}: {
  title: string;
  compactPath: string;
  fullPath: string;
  selectedFolderId: string;
  selectedTitle: string;
  tree: BookmarkNode[];
  recentFolders: FolderOption[];
  loading: boolean;
  create?: InlineFolderPickerCreateControls;
  onSelect(folderId: string): void;
  onManage(): void;
}) {
  const [open, setOpen] = useState(false);
  const displayPath = compactPath || selectedTitle || "请选择文件夹";

  return (
    <div className={`folder-path-selector ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="folder-path-trigger"
        aria-expanded={open}
        aria-haspopup="tree"
        disabled={loading}
        title={fullPath || displayPath}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="location-folder-icon" aria-hidden="true">
          <FolderIcon />
        </span>
        <span className="folder-path-trigger-copy">
          <strong>{title}</strong>
          <small>{loading ? "正在读取保存位置" : displayPath}</small>
        </span>
        <ChevronRightIcon />
      </button>

      {open ? (
        <InlineFolderPicker
          create={create}
          loading={loading}
          recentFolders={recentFolders}
          selectedFolderId={selectedFolderId}
          tree={tree}
          onManage={onManage}
          onRequestClose={() => setOpen(false)}
          onSelect={onSelect}
        />
      ) : null}
    </div>
  );
}
