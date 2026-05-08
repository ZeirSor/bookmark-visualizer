import { FolderIcon, GridIcon } from "../../components/icons/AppIcons";

export function NewTabSidebar({
  activeFolderId,
  folders,
  onManage,
  onSelectFolder
}: {
  activeFolderId?: string;
  folders: Array<{ id: string; title: string; bookmarkCount: number }>;
  onManage(): void;
  onSelectFolder(folderId: string): void;
}) {
  return (
    <aside className="nt-hover-sidebar" aria-label="书签侧栏">
      <button type="button" className="nt-sidebar-entry" onClick={onManage}>
        <GridIcon />
        <span>全部书签</span>
      </button>
      <div className="nt-sidebar-section">
        <p>书签文件夹</p>
        {folders.map((folder) => (
          <button
            key={folder.id}
            type="button"
            className={folder.id === activeFolderId ? "is-active" : undefined}
            onClick={() => onSelectFolder(folder.id)}
          >
            <FolderIcon />
            <span>{folder.title}</span>
            <small>{folder.bookmarkCount}</small>
          </button>
        ))}
      </div>
    </aside>
  );
}
