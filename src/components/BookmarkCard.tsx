import {
  useEffect,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent
} from "react";
import type { BookmarkNode } from "../features/bookmarks";
import { ExternalLinkIcon, StarIcon } from "./icons/AppIcons";
import { MoreIcon } from "./icons/ManagerIcons";
import { SiteFavicon } from "./SiteFavicon";

interface BookmarkCardProps {
  bookmark: BookmarkNode;
  folderPath?: string;
  note?: string;
  highlighted: boolean;
  highlightPulse: boolean;
  editRequestId?: number;
  onDragStart(bookmark: BookmarkNode): void;
  onDragEnd(): void;
  onDragOverBookmark(bookmark: BookmarkNode, event: DragEvent<HTMLElement>): void;
  onDragLeaveBookmark(bookmark: BookmarkNode, event: DragEvent<HTMLElement>): void;
  onDropOnBookmark(bookmark: BookmarkNode, event: DragEvent<HTMLElement>): void;
  onOpen(bookmark: BookmarkNode): void;
  onSaveTitle(bookmark: BookmarkNode, title: string): Promise<void>;
  onSaveUrl(bookmark: BookmarkNode, url: string): Promise<void>;
  onSaveNote(bookmark: BookmarkNode, note: string): Promise<void>;
  onContextMenu(bookmark: BookmarkNode, event: MouseEvent<HTMLElement>): void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelected?(bookmark: BookmarkNode): void;
}

export function BookmarkCard({
  bookmark,
  folderPath,
  note,
  highlighted,
  highlightPulse,
  editRequestId,
  onDragStart,
  onDragEnd,
  onDragOverBookmark,
  onDragLeaveBookmark,
  onDropOnBookmark,
  onOpen,
  onSaveTitle,
  onSaveUrl,
  onSaveNote,
  onContextMenu,
  selectable = false,
  selected = false,
  onToggleSelected
}: BookmarkCardProps) {
  const url = bookmark.url ?? "";
  const hostname = getHostname(url);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingUrl, setEditingUrl] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [titleValue, setTitleValue] = useState(bookmark.title);
  const [urlValue, setUrlValue] = useState(url);
  const [noteValue, setNoteValue] = useState(note ?? "");

  useEffect(() => {
    setTitleValue(bookmark.title);
  }, [bookmark.title]);

  useEffect(() => {
    setUrlValue(url);
  }, [url]);

  useEffect(() => {
    setNoteValue(note ?? "");
  }, [note]);

  useEffect(() => {
    if (editRequestId === undefined) {
      return;
    }

    setEditingTitle(true);
    setEditingUrl(true);
    setEditingNote(true);
  }, [editRequestId]);

  function handleCardActivate() {
    if (selectable) {
      onToggleSelected?.(bookmark);
      return;
    }

    onOpen(bookmark);
  }

  function handleInlineEditClick(event: MouseEvent<HTMLButtonElement>, startEditing: () => void) {
    event.stopPropagation();

    if (selectable) {
      onToggleSelected?.(bookmark);
      return;
    }

    startEditing();
  }

  return (
    <article
      className={`bookmark-card ${highlighted ? "is-highlighted" : ""} ${
        highlightPulse ? "is-highlight-pulse" : ""
      } ${selectable ? "is-selectable" : ""} ${selected ? "is-selected" : ""}`}
      data-bookmark-id={bookmark.id}
      draggable={!selectable}
      tabIndex={0}
      onClick={handleCardActivate}
      onContextMenu={(event) => onContextMenu(bookmark, event)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || (selectable && event.key === " ")) {
          event.preventDefault();
          handleCardActivate();
        }
      }}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", bookmark.id);
        onDragStart(bookmark);
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => onDragOverBookmark(bookmark, event)}
      onDragLeave={(event) => onDragLeaveBookmark(bookmark, event)}
      onDrop={(event) => onDropOnBookmark(bookmark, event)}
      aria-label={`${selectable ? "选择" : "打开"}书签 ${bookmark.title || hostname}`}
      aria-selected={selectable ? selected : undefined}
    >
      <span className="bookmark-card-top">
        {selectable ? (
          <button
            className="bookmark-selection-check"
            type="button"
            draggable={false}
            aria-pressed={selected}
            aria-label={`${selected ? "取消选择" : "选择"} ${bookmark.title || hostname}`}
            onClick={(event) => {
              event.stopPropagation();
              onToggleSelected?.(bookmark);
            }}
          >
            <span aria-hidden="true" />
          </button>
        ) : null}
        <SiteFavicon url={url} title={bookmark.title} size={32} className="favicon" />
        <span className="bookmark-card-actions">
          <button
            className="open-link-button"
            type="button"
            draggable={false}
            aria-label={`打开链接 ${bookmark.title || hostname}`}
            title="打开链接"
            onClick={(event) => {
              event.stopPropagation();
              onOpen(bookmark);
            }}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <ExternalLinkIcon className="open-link-icon" />
          </button>
          <button
            className="more-card-button"
            type="button"
            draggable={false}
            aria-label={`打开书签菜单 ${bookmark.title || hostname}`}
            title="更多操作"
            onClick={(event) => onContextMenu(bookmark, event)}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <MoreIcon />
          </button>
        </span>
      </span>
      <span className="card-content">
        {editingTitle ? (
          <InlineInput
            ariaLabel="编辑书签标题"
            value={titleValue}
            multiline={false}
            onChange={setTitleValue}
            onCancel={() => {
              setTitleValue(bookmark.title);
              setEditingTitle(false);
            }}
            onSave={async () => {
              if (titleValue.trim() === bookmark.title.trim()) {
                setEditingTitle(false);
                return;
              }

              await onSaveTitle(bookmark, titleValue);
              setEditingTitle(false);
            }}
          />
        ) : (
          <button
            className="inline-edit-title"
            type="button"
            onClick={(event) => handleInlineEditClick(event, () => setEditingTitle(true))}
          >
            {bookmark.title || "Untitled bookmark"}
          </button>
        )}
        {editingUrl ? (
          <InlineInput
            ariaLabel="编辑书签 URL"
            value={urlValue}
            multiline={false}
            onChange={setUrlValue}
            onCancel={() => {
              setUrlValue(url);
              setEditingUrl(false);
            }}
            onSave={async () => {
              if (urlValue.trim() === url.trim()) {
                setEditingUrl(false);
                return;
              }

              await onSaveUrl(bookmark, urlValue);
              setEditingUrl(false);
            }}
          />
        ) : (
          <button
            className="inline-edit-url"
            type="button"
            onClick={(event) => handleInlineEditClick(event, () => setEditingUrl(true))}
          >
            {hostname || url}
          </button>
        )}
        {editingNote ? (
          <InlineInput
            ariaLabel="编辑备注"
            value={noteValue}
            multiline
            onChange={setNoteValue}
            onCancel={() => {
              setNoteValue(note ?? "");
              setEditingNote(false);
            }}
            onSave={async () => {
              if (noteValue.trim() === (note ?? "").trim()) {
                setEditingNote(false);
                return;
              }

              await onSaveNote(bookmark, noteValue);
              setEditingNote(false);
            }}
          />
        ) : (
          <button
            className={`inline-edit-note ${note ? "" : "is-empty"}`}
            type="button"
            onClick={(event) => handleInlineEditClick(event, () => setEditingNote(true))}
          >
            {note || "添加备注"}
          </button>
        )}
        {folderPath ? <span className="bookmark-path">{folderPath}</span> : null}
      </span>
      <span className="bookmark-card-footer">
        <span>{formatBookmarkDate(bookmark.dateAdded)}</span>
        <span className="bookmark-card-status">
          {note ? <span className="tag-chip">有备注</span> : null}
          <button
            className="bookmark-star-button"
            type="button"
            disabled
            aria-label="收藏书签功能即将支持"
            title="收藏书签功能即将支持"
          >
            <StarIcon />
          </button>
        </span>
      </span>
    </article>
  );
}

function InlineInput({
  ariaLabel,
  value,
  multiline,
  onChange,
  onCancel,
  onSave
}: {
  ariaLabel: string;
  value: string;
  multiline: boolean;
  onChange(value: string): void;
  onCancel(): void;
  onSave(): Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  async function save(event?: FocusEvent | KeyboardEvent) {
    event?.stopPropagation();

    if (saving) {
      return;
    }

    setSaving(true);
    try {
      await onSave();
    } catch {
      // The parent owns validation messages; keep the inline editor open.
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    event.stopPropagation();

    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
      return;
    }

    if (event.key === "Enter" && (!multiline || event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void save(event);
    }
  }

  const commonProps = {
    value,
    "aria-label": ariaLabel,
    autoFocus: true,
    onClick: (event: MouseEvent) => event.stopPropagation(),
    onBlur: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void save(event),
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
    onKeyDown: handleKeyDown
  };

  return (
    <span className="inline-editor">
      {multiline ? <textarea rows={3} {...commonProps} /> : <input {...commonProps} />}
      <span className="inline-editor-hint">{saving ? "保存中..." : "移出后自动保存，Esc 取消"}</span>
    </span>
  );
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function formatBookmarkDate(timestamp?: number): string {
  if (!timestamp) {
    return "添加时间未知";
  }

  return `添加于：${new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(timestamp))}`;
}
