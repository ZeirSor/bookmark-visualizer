import { openWorkspace } from "../../features/popup";

export function SettingsTab({
  autoClose,
  selectedPath,
  setAutoClose
}: {
  autoClose: boolean;
  selectedPath: string;
  setAutoClose(value: boolean): void;
}) {
  return (
    <section className="placeholder-tab settings-list">
      <h2>设置</h2>
      <div>
        <strong>快捷键</strong>
        <span>保存当前网页：点击扩展图标</span>
        <span>命令入口：Ctrl + Shift + S</span>
      </div>
      <div>
        <strong>默认保存位置</strong>
        <span>{selectedPath || "正在读取保存位置"}</span>
      </div>
      <label>
        <input
          type="checkbox"
          checked={autoClose}
          onChange={(event) => setAutoClose(event.target.checked)}
        />
        保存后自动关闭浮窗
      </label>
      <button type="button" className="primary-action wide" onClick={() => void openWorkspace()}>
        打开高级设置
      </button>
    </section>
  );
}

