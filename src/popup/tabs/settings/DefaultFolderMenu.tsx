import { useState } from "react";
import { InlineFolderPicker } from "../../../components/folder-picker";
import type { BookmarkNode, FolderOption } from "../../../features/bookmarks";
import { openWorkspace } from "../../../features/popup";
import { FolderIcon } from "../../components/PopupIcons";

export function DefaultFolderMenu({
  defaultCompactPath,
  defaultFolderId,
  defaultPath,
  recentFolders,
  tree,
  updateDefaultFolder
}: {
  defaultCompactPath: string;
  defaultFolderId: string;
  defaultPath: string;
  recentFolders: FolderOption[];
  tree: BookmarkNode[];
  updateDefaultFolder(folderId: string): void;
}) {
  const [folderMenuOpen, setFolderMenuOpen] = useState(false);

  return (
    <div className="default-folder-control">
      <button
        type="button"
        className="folder-path-selector"
        aria-expanded={folderMenuOpen}
        aria-haspopup="dialog"
        onClick={() => setFolderMenuOpen((current) => !current)}
      >
        <span className="location-folder-icon" aria-hidden="true">
          <FolderIcon />
        </span>
        <span className="folder-path-selector-copy">
          <strong>当前位置</strong>
          <small title={defaultPath || undefined}>{defaultCompactPath || "正在读取保存位置"}</small>
        </span>
        <span className="folder-path-selector-action">{folderMenuOpen ? "收起" : "更改"}</span>
      </button>
      {folderMenuOpen ? (
        <div className="default-folder-picker-expanded">
          <InlineFolderPicker
            loading={false}
            recentFolders={recentFolders}
            selectedFolderId={defaultFolderId}
            tree={tree}
            onManage={() => void openWorkspace()}
            onRequestClose={() => setFolderMenuOpen(false)}
            onSelect={(folderId) => {
              updateDefaultFolder(folderId);
              setFolderMenuOpen(false);
            }}
          />
        </div>
      ) : null}
      {recentFolders.length > 0 ? (
        <div className="settings-mini-chips" aria-label="最近位置">
          {recentFolders.map((option) => (
            <button key={option.id} type="button" onClick={() => updateDefaultFolder(option.id)}>
              {option.title}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
