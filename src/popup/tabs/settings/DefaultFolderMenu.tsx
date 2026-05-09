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
    <>
      <div className="default-folder-row">
        <span className="location-folder-icon">
          <FolderIcon />
        </span>
        <span title={defaultPath || undefined}>{defaultCompactPath || "正在读取保存位置"}</span>
        <button
          type="button"
          className="secondary-action small"
          aria-expanded={folderMenuOpen}
          aria-haspopup="dialog"
          onClick={() => setFolderMenuOpen((current) => !current)}
        >
          更改
        </button>
      </div>
      {folderMenuOpen ? (
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
    </>
  );
}
