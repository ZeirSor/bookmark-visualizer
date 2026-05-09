import {
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent
} from "react";
import {
  buildFolderBreadcrumbItems,
  canCreateBookmarkInFolder,
  filterFolderOptions,
  flattenFolders,
  rankFolderOption,
  type BookmarkNode,
  type FolderOption
} from "../../features/bookmarks";
import { InlineCreateFolderRow } from "../../popup/components/save-location/InlineCreateFolderRow";
import { RecentFolderChips } from "../../popup/components/save-location/RecentFolderChips";
import { FolderSearchInput } from "./FolderSearchInput";
import {
  buildVisibleFolderEntries,
  FolderTree,
  type FolderTreeEntry
} from "./FolderTree";
import { FolderTreeItem } from "./FolderTreeItem";

export interface InlineFolderPickerCreateControls {
  open: boolean;
  creating: boolean;
  folderName: string;
  parentTitle: string;
  onOpen(parentFolderId?: string): void;
  onCancel(): void;
  onCreate(): Promise<void>;
  onFolderNameChange(value: string): void;
}

export function InlineFolderPicker({
  create,
  loading,
  recentFolders,
  selectedFolderId,
  tree,
  onManage,
  onRequestClose,
  onSelect
}: {
  tree: BookmarkNode[];
  selectedFolderId: string;
  recentFolders: FolderOption[];
  loading: boolean;
  create?: InlineFolderPickerCreateControls;
  onSelect(folderId: string): void;
  onManage(): void;
  onRequestClose(): void;
}) {
  const [query, setQuery] = useState("");
  const [recentExpanded, setRecentExpanded] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [activeFolderId, setActiveFolderId] = useState(selectedFolderId);
  const folderOptions = useMemo(
    () => flattenFolders(tree).filter((option) => canCreateBookmarkInFolder(option.node)),
    [tree]
  );
  const searchResults = useMemo(() => {
    const normalized = query.trim();
    return normalized
      ? filterFolderOptions(folderOptions, normalized)
          .sort((left, right) => {
            const rankDiff = rankFolderOption(left, normalized) - rankFolderOption(right, normalized);
            return rankDiff || left.path.localeCompare(right.path, "zh-CN");
          })
          .slice(0, 8)
      : [];
  }, [folderOptions, query]);
  const visibleTreeEntries = useMemo(
    () => buildVisibleFolderEntries(tree, expandedIds),
    [expandedIds, tree]
  );
  const searchEntries = useMemo(
    () => searchResults.map(folderOptionToTreeEntry),
    [searchResults]
  );
  const navigableEntries = query ? searchEntries : visibleTreeEntries.filter((entry) => entry.canSelect);

  useEffect(() => {
    const pathIds = buildFolderBreadcrumbItems(tree, selectedFolderId).map((item) => item.id);
    setExpandedIds(new Set(pathIds));
    setActiveFolderId(selectedFolderId || pathIds.at(-1) || "");
  }, [selectedFolderId, tree]);

  return (
    <div className="inline-folder-picker" onKeyDown={handleKeyDown}>
      <div className="inline-folder-picker-header">
        <strong>选择保存位置</strong>
        <button type="button" className="text-action" onClick={onRequestClose}>
          关闭
        </button>
      </div>

      <div className="inline-folder-picker-toolbar">
        <FolderSearchInput
          value={query}
          onChange={(value) => {
            setQuery(value);
            create?.onCancel();
            setActiveFolderId("");
          }}
          onClear={() => {
            setQuery("");
            setActiveFolderId(selectedFolderId);
          }}
        />
        {create ? (
          <button
            type="button"
            className={`picker-create-toggle ${create.open ? "is-active" : ""}`}
            onClick={() => {
              setQuery("");
              if (create.open) {
                create.onCancel();
              } else {
                create.onOpen(selectedFolderId);
              }
            }}
          >
            新建文件夹
          </button>
        ) : null}
      </div>

      <div className="inline-folder-picker-body">
        {loading ? <p className="inline-picker-empty">正在读取文件夹...</p> : null}
        {!loading && query ? (
          <div className="folder-tree search-results-tree" role="listbox" aria-label="搜索结果">
            {searchEntries.length === 0 ? <p className="inline-picker-empty">没有匹配的文件夹</p> : null}
            {searchEntries.map((entry) => (
              <FolderTreeItem
                key={entry.id}
                active={activeFolderId === entry.id}
                entry={entry}
                selected={selectedFolderId === entry.id}
                showPath
                onActivate={setActiveFolderId}
                onSelect={selectFolder}
                onToggleExpanded={toggleExpanded}
              />
            ))}
          </div>
        ) : null}
        {!loading && !query ? (
          <FolderTree
            activeFolderId={activeFolderId}
            entries={visibleTreeEntries}
            selectedFolderId={selectedFolderId}
            onActivate={setActiveFolderId}
            onSelect={selectFolder}
            onToggleExpanded={toggleExpanded}
          />
        ) : null}
      </div>

      {create?.open ? (
        <InlineCreateFolderRow
          creating={create.creating}
          folderName={create.folderName}
          selectedTitle={create.parentTitle}
          onCancel={create.onCancel}
          onCreate={create.onCreate}
          onFolderNameChange={create.onFolderNameChange}
        />
      ) : null}

      <RecentFolderChips
        loading={loading}
        recentExpanded={recentExpanded}
        recentFolders={recentFolders}
        onManage={onManage}
        onSelect={selectFolder}
        onToggleExpanded={() => setRecentExpanded((current) => !current)}
      />
    </div>
  );

  function selectFolder(folderId: string) {
    onSelect(folderId);
    setQuery("");
    onRequestClose();
  }

  function toggleExpanded(folderId: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      expandActive();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      collapseOrMoveToParent();
      return;
    }

    if (event.key === "Enter") {
      const active = getActiveEntry();
      if (active?.canSelect) {
        event.preventDefault();
        selectFolder(active.id);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (query) {
        setQuery("");
      } else {
        onRequestClose();
      }
    }
  }

  function moveActive(offset: number) {
    if (navigableEntries.length === 0) {
      return;
    }

    const currentIndex = Math.max(
      0,
      navigableEntries.findIndex((entry) => entry.id === activeFolderId)
    );
    const nextIndex = (currentIndex + offset + navigableEntries.length) % navigableEntries.length;
    setActiveFolderId(navigableEntries[nextIndex]?.id ?? "");
  }

  function getActiveEntry(): FolderTreeEntry | undefined {
    return navigableEntries.find((entry) => entry.id === activeFolderId) ?? navigableEntries[0];
  }

  function expandActive() {
    if (query) {
      return;
    }

    const active = visibleTreeEntries.find((entry) => entry.id === activeFolderId);
    if (active?.hasChildren && !expandedIds.has(active.id)) {
      toggleExpanded(active.id);
    }
  }

  function collapseOrMoveToParent() {
    if (query) {
      return;
    }

    const active = visibleTreeEntries.find((entry) => entry.id === activeFolderId);
    if (!active) {
      return;
    }

    if (active.hasChildren && expandedIds.has(active.id)) {
      toggleExpanded(active.id);
      return;
    }

    const parent = visibleTreeEntries.find((entry) => entry.id === active.parentId);
    if (parent) {
      setActiveFolderId(parent.id);
    }
  }
}

function folderOptionToTreeEntry(option: FolderOption): FolderTreeEntry {
  return {
    id: option.id,
    title: option.title,
    path: option.path,
    node: option.node,
    parentId: option.node.parentId,
    depth: 0,
    canSelect: canCreateBookmarkInFolder(option.node),
    hasChildren: Boolean(option.node.children?.some((child) => !child.url)),
    expanded: false
  };
}
