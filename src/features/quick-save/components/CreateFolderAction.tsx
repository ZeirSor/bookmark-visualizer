import { useEffect, useRef, useState, type FormEvent } from "react";
import type { BookmarkNode } from "../../bookmarks";

export function CreateFolderAction({
  parentFolder,
  onCreate,
  inCascade = false
}: {
  parentFolder: BookmarkNode;
  onCreate(parentFolder: BookmarkNode, title: string): Promise<void>;
  inCascade?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    await onCreate(parentFolder, title);
    setSaving(false);
    setTitle("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        className={inCascade ? "create-folder-link in-cascade" : "create-folder-link"}
        type="button"
        onClick={() => setOpen(true)}
      >
        新建文件夹...
      </button>
    );
  }

  return (
    <form className={inCascade ? "create-folder-form in-cascade" : "create-folder-form"} onSubmit={submit}>
      <input
        ref={inputRef}
        value={title}
        placeholder="文件夹名称"
        onChange={(event) => setTitle(event.target.value)}
      />
      <button className="primary-button small" type="submit" disabled={saving}>
        Save
      </button>
      <button className="secondary-button small" type="button" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </form>
  );
}
