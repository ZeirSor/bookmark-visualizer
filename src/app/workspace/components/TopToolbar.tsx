import { BreadcrumbNav } from "../../../components/BreadcrumbNav";
import { SearchBar } from "../../../components/SearchBar";
import type { FolderBreadcrumbItem } from "../../../features/bookmarks";
import type { CardSize } from "../../../features/settings";
import { CardSizeControl } from "../WorkspaceComponents";

interface TopToolbarProps {
  breadcrumbItems: FolderBreadcrumbItem[];
  homeFolderId?: string;
  query: string;
  cardSize: CardSize;
  theme: "light" | "dark";
  operationLogCount: number;
  operationLogOpen: boolean;
  onSelectBreadcrumb(folderId: string): void;
  onSearchChange(query: string): void;
  onClearSearch(): void;
  onCardSizeChange(size: CardSize): void;
  onToggleOperationLog(): void;
  onOpenShortcutSettings(): void;
  onToggleTheme(): void;
}

export function TopToolbar({
  breadcrumbItems,
  homeFolderId,
  query,
  cardSize,
  theme,
  operationLogCount,
  operationLogOpen,
  onSelectBreadcrumb,
  onSearchChange,
  onClearSearch,
  onCardSizeChange,
  onToggleOperationLog,
  onOpenShortcutSettings,
  onToggleTheme
}: TopToolbarProps) {
  return (
    <header className="toolbar">
      <BreadcrumbNav
        items={breadcrumbItems}
        homeFolderId={homeFolderId}
        onSelectFolder={onSelectBreadcrumb}
      />
      <SearchBar
        value={query}
        onChange={onSearchChange}
        onClear={onClearSearch}
        placeholder="搜索标题或 URL"
      />
      <div className="toolbar-meta">
        <CardSizeControl value={cardSize} onChange={onCardSizeChange} />
        <button
          className="log-button"
          type="button"
          aria-expanded={operationLogOpen}
          onClick={onToggleOperationLog}
        >
          操作日志
          {operationLogCount > 0 ? <span>{operationLogCount}</span> : null}
        </button>
        <button
          className="shortcut-button"
          type="button"
          aria-label="打开快捷键设置"
          title="快捷键设置"
          onClick={onOpenShortcutSettings}
        >
          快捷键
        </button>
        <button
          className="theme-button"
          type="button"
          aria-label={theme === "light" ? "切换为深色主题" : "切换为浅色主题"}
          title={theme === "light" ? "切换为深色主题" : "切换为浅色主题"}
          onClick={onToggleTheme}
        >
          <span className={theme === "light" ? "moon-mark" : "sun-mark"} />
        </button>
      </div>
    </header>
  );
}
