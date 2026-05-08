import { useEffect, useRef, useState } from "react";
import type { BookmarkNode } from "../../features/bookmarks";

export function FolderRenameInput({
  folder,
  onSave,
  onCancel
}: {
  folder: BookmarkNode;
  onSave(folder: BookmarkNode, title: string): Promise<void>;
  onCancel(): void;
}) {
  const [value, setValue] = useState(folder.title);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  async function save() {
    if (saving) {
      return;
    }

    setSaving(true);
    try {
      await onSave(folder, value);
    } catch {
      // The app shows validation feedback; keep the inline editor active.
    } finally {
      setSaving(false);
    }
  }

  return (
    <span className="folder-rename-editor">
      <input
        ref={inputRef}
        value={value}
        aria-label="重命名文件夹"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        onBlur={() => void save()}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          event.stopPropagation();

          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
            return;
          }

          if (event.key === "Enter") {
            event.preventDefault();
            void save();
          }
        }}
      />
      <span>{saving ? "保存中..." : "Enter 保存，Esc 取消"}</span>
    </span>
  );
}
