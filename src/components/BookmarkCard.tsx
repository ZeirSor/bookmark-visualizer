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
  onContextMenu
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

  return (
    <article
      className={`bookmark-card ${highlighted ? "is-highlighted" : ""} ${
        highlightPulse ? "is-highlight-pulse" : ""
      }`}
      data-bookmark-id={bookmark.id}
      draggable
      tabIndex={0}
      onClick={() => onOpen(bookmark)}
      onContextMenu={(event) => onContextMenu(bookmark, event)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onOpen(bookmark);
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
      aria-label={`打开书签 ${bookmark.title || hostname}`}
    >
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
        <OpenInNewIcon />
      </button>
      <span className="favicon" aria-hidden="true">
        <img src={getFaviconUrl(url)} alt="" loading="lazy" />
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
            onClick={(event) => {
              event.stopPropagation();
              setEditingTitle(true);
            }}
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
            onClick={(event) => {
              event.stopPropagation();
              setEditingUrl(true);
            }}
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
            onClick={(event) => {
              event.stopPropagation();
              setEditingNote(true);
            }}
          >
            {note || "添加备注"}
          </button>
        )}
        {folderPath ? <span className="bookmark-path">{folderPath}</span> : null}
      </span>
    </article>
  );
}

function OpenInNewIcon() {
  return (
    <svg
      aria-hidden="true"
      className="open-link-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 5h5v5" />
      <path d="M10 14 19 5" />
      <path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" />
    </svg>
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

function getFaviconUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
  } catch {
    return "";
  }
}
