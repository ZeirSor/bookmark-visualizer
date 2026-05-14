---
type: reference
status: active
scope: frontend
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# 管理页后续维护与 UI 设计方案

## 阶段 1：稳定当前三栏工作台

目标：不新增大功能，先让当前 UI 结构稳定。

任务：

1. 给 `src/app/styles.css` 增加内部注释分区：layout / sidebar / toolbar / workspace / cards / menus / dialogs / responsive。
2. 补充 Playwright 或手动验收脚本前，先在 `reference/regression-checklist.md` 维护人工验收路径。
3. 检查 `.bookmark-card` 在四种 `data-card-size` 下的标题截断、URL 截断、备注编辑、按钮 hover。
4. 回归 deep link：`index.html?folderId=...` 和 `index.html?bookmarkId=...`。
5. 确认 disabled 占位按钮没有误触发真实写操作。

## 阶段 2：拆分 CSS，但不改 DOM

目标：降低 `src/app/styles.css` 维护成本。

建议结构：

```text
src/app/styles/
  base.css
  layout.css
  sidebar.css
  toolbar.css
  workspace-panels.css
  bookmark-card.css
  folder-tree.css
  menus.css
  dialogs.css
  responsive.css
```

迁移方式：

- 先复制拆分，保持 import 顺序，确保视觉不变。
- 每拆一个区域，只做 selector 移动，不做视觉改动。
- 完成后再删除旧 `styles.css` 中对应段落。

## 阶段 3：把命令栏占位转为真实功能

优先级建议：

1. 排序：默认顺序 / 添加时间 / 标题。
2. 有备注筛选：依赖 `metadata.bookmarkMetadata`。
3. 收藏：需要 metadata 中新增 favorite 字段，再让星标按钮变为真实操作。
4. 批量移动：复用 `FolderCascadeMenu`，但要为多选目标加确认。
5. 标签 / 稍后阅读：需要 domain 数据模型，不能只在 UI 上加状态。

## 阶段 4：右侧栏真实化

右侧栏目前只有“新建文件夹”和“最近活动”是真实可用。后续可按以下顺序接入：

1. 导入 HTML：复用 `src/features/import-export/importNetscapeHtml.ts`。
2. 导出当前文件夹：复用 export feature，但要限定 scope。
3. 查重：新增 pure selector，不要直接写进 RightRail。
4. 回收站：Chrome bookmarks 原生删除不可直接恢复完整树，应先设计 metadata / local backup 策略。
5. 云空间升级：必须等 subscription / cloud strategy 明确后再开放。

## 阶段 5：操作日志持久化

当前 `operationLog` 是会话内 state。若要跨会话：

- 新增 storage key，如 `bookmarkVisualizerOperationLog`。
- 限制条数，例如 200。
- 撤回操作不能随便持久化函数，应改成可序列化 command：`{ type, targetId, before, after }`。
- 删除撤回要处理 bookmarkId 变化。

## 不建议做的事

- 不要把管理页改成 New Tab 风格的大搜索页。
- 不要引入 UI 库重写现有组件。
- 不要在 `BookmarkCard` 里直接调用 `chrome.*`。
- 不要为了视觉短期效果写死示例文件夹名或站点。
- 不要让批量删除伪装成可撤回。
