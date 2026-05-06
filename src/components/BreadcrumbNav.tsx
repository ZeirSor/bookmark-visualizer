import type { FolderBreadcrumbItem } from "../features/bookmarks";

interface BreadcrumbNavProps {
  items: FolderBreadcrumbItem[];
  homeFolderId?: string;
  onSelectFolder(folderId: string): void;
}

export function BreadcrumbNav({ items, homeFolderId, onSelectFolder }: BreadcrumbNavProps) {
  return (
    <nav className="breadcrumb" aria-label="文件夹路径">
      <ol>
        <li>
          <button
            type="button"
            disabled={!homeFolderId}
            onClick={() => {
              if (homeFolderId) {
                onSelectFolder(homeFolderId);
              }
            }}
          >
            首页
          </button>
        </li>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          const isRetained = Boolean(item.isRetained);

          return (
            <li key={item.id} className={isRetained ? "is-retained" : undefined}>
              <span className="breadcrumb-separator" aria-hidden="true">
                /
              </span>
              <button
                type="button"
                aria-current={isCurrent && !isRetained ? "location" : undefined}
                data-retained={isRetained ? "true" : undefined}
                onClick={() => onSelectFolder(item.id)}
              >
                {item.title}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
