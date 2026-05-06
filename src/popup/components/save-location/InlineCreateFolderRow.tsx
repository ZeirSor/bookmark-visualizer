import { useEffect, useRef } from "react";
import { CheckIcon, CloseIcon, FolderIcon } from "../PopupIcons";

export function InlineCreateFolderRow({
  creating,
  folderName,
  selectedTitle,
  onCancel,
  onCreate,
  onFolderNameChange
}: {
  creating: boolean;
  folderName: string;
  selectedTitle: string;
  onCancel(): void;
  onCreate(): Promise<void>;
  onFolderNameChange(value: string): void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="create-folder-row">
      <span className="create-folder-icon" aria-hidden="true">
        <FolderIcon />
      </span>
      <input
        ref={inputRef}
        value={folderName}
        disabled={creating}
        placeholder={`新建在 ${selectedTitle || "当前文件夹"}`}
        onChange={(event) => onFolderNameChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            void onCreate();
            return;
          }

          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onCancel();
          }
        }}
      />
      <button
        type="button"
        className="cancel-action"
        aria-label="取消新建文件夹"
        title="取消"
        disabled={creating}
        onClick={onCancel}
      >
        <CloseIcon />
      </button>
      <button
        type="button"
        className="create-action"
        aria-label="确认新建文件夹"
        title={creating ? "正在新建" : "确认"}
        disabled={!folderName.trim() || creating}
        onClick={() => void onCreate()}
      >
        <CheckIcon />
      </button>
    </div>
  );
}
