import { ChevronRightIcon } from "../../../components/icons/AppIcons";
import type { BookmarkNode } from "../../bookmarks";

export function FolderBreadcrumb({
  items,
  onSelect
}: {
  items: Array<{ id: string; title: string; node: BookmarkNode }>;
  onSelect(folder: BookmarkNode): void;
}) {
  if (items.length === 0) {
    return <div className="folder-breadcrumb">Root</div>;
  }

  return (
    <nav className="folder-breadcrumb" aria-label="浏览路径">
      {items.map((item, index) => (
        <span key={item.id}>
          {index > 0 ? <ChevronRightIcon className="chevron-icon" /> : null}
          <button type="button" onClick={() => onSelect(item.node)}>
            {item.title}
          </button>
        </span>
      ))}
    </nav>
  );
}
