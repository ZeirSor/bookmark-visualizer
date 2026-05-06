import { openWorkspace } from "../../features/popup";

export function ManageTab() {
  return (
    <section className="placeholder-tab">
      <h2>管理</h2>
      <p>完整的书签浏览、搜索和整理仍在管理页中完成。</p>
      <button type="button" className="primary-action wide" onClick={() => void openWorkspace()}>
        打开完整管理页
      </button>
    </section>
  );
}

