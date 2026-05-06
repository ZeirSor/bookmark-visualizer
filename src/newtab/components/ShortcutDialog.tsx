import { useState, type FormEvent } from "react";
import { CloseIcon } from "../../components/icons/AppIcons";

export function ShortcutDialog({
  onClose,
  onSave
}: {
  onClose(): void;
  onSave(input: { title: string; url: string }): void;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  return (
    <div className="nt-drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="nt-shortcut-dialog" onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()}>
        <div className="nt-drawer-header">
          <div>
            <h2>添加网站</h2>
            <p>添加到新标签页快捷访问。</p>
          </div>
          <button type="button" aria-label="关闭添加网站" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <label className="nt-field-row vertical">
          <span>名称</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="nt-field-row vertical">
          <span>URL</span>
          <input
            value={url}
            placeholder="https://example.com"
            onChange={(event) => setUrl(event.target.value)}
          />
        </label>
        <div className="nt-dialog-actions">
          <button type="button" onClick={onClose}>
            取消
          </button>
          <button type="submit">添加</button>
        </div>
      </form>
    </div>
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave({ title, url });
  }
}
