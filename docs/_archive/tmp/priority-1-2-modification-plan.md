---
type: archive
status: archived
scope: archive
owner: project
last_verified: 2026-05-14
source_of_truth: false
archived_reason: "superseded, historical, or temporary content"
archived_from: "docs/tmp/bookmark_priority_1_2_modification_plan.md"
current_source: "docs/README.md"
---

# Bookmark Visualizer 第一、二优先级修改计划

> 基准代码包：`bookmark-visualizer (7).zip`  
> 目标：先收稳 Agent / Docs 工作流路径，再修正 Popup 设置入口的实际体验。  
> 范围：本计划只覆盖上一轮分析中的第一优先级与第二优先级，不包含大文件拆分、云同步、订阅、AI 摘要等后续工作。

---

## 0. 当前判断

当前项目已经具备四个主要 surface：

```txt
Manager Workspace  → index.html / src/app/
Toolbar Popup      → popup.html / src/popup/
Quick Save Overlay → src/features/quick-save/
Optional New Tab   → newtab.html / src/newtab/
```

但仍有两类需要优先收口的问题：

1. **工作流与文档路径不对齐**：`.gitignore`、`.agent/skills/*`、`docs/architecture/*`、`docs/data/*` 中仍有旧路径或旧描述。
2. **Popup 设置体验不够准确**：`SettingsTab` 中“配置快捷键”按钮的文案预期与实际行为不一致；`popupThemeMode` 的状态也需要明确是“已生效”还是“仅已存储”。

---

# 第一优先级：工作流与文档路径对齐

## P0-1. 修正 `.gitignore` 与 Agent 工作流文件的版本管理边界

### 问题

当前 `.gitignore` 中有：

```gitignore
AGENTS.md
AI_HANDOFF.md
.ai/
```

但当前项目已经把以下内容作为长期工作流入口：

```txt
AGENTS.md
AI_HANDOFF.md
.agent/skills/
.ai/README.md
.ai/runs/_TEMPLATE/
docs/workflow/
docs/playbooks/
docs/standards/
```

如果继续忽略 `AGENTS.md`、`AI_HANDOFF.md` 和整个 `.ai/`，后续从 GitHub clone 或切换设备时，Agent 工作流可能不完整。

### 涉及文件

```txt
.gitignore
AGENTS.md
AI_HANDOFF.md
.ai/README.md
.ai/runs/_TEMPLATE/**
```

### 推荐修改

将 `.gitignore` 改成“忽略运行记录，保留共享工作流说明和模板”：

```gitignore
node_modules/
dist/
.vite/
coverage/
*.local
*.log
docs/tmp/

# AI runtime records
.ai/logs/
.ai/dev-changelog/
.ai/runs/*

# Keep shared AI workflow docs/templates
!.ai/
!.ai/README.md
!.ai/runs/
!.ai/runs/_TEMPLATE/
!.ai/runs/_TEMPLATE/**
```

同时移除对以下文件的忽略：

```gitignore
AGENTS.md
AI_HANDOFF.md
.ai/
```

### 如果历史上 `.ai/logs/` 已经被 Git 跟踪

如果仓库里已有部分 `.ai/logs/` 被跟踪，需要决定是否保留历史记录。建议从长期维护角度将运行日志移出版本管理：

```bash
git rm -r --cached .ai/logs .ai/dev-changelog 2>/dev/null || true
git add .gitignore AGENTS.md AI_HANDOFF.md .ai/README.md .ai/runs/_TEMPLATE
```

如果你希望保留历史 AI 日志，则不要执行 `git rm --cached`；但仍建议后续新日志不再进入 Git。

### 验收标准

```bash
git status --short --ignored
```

应满足：

```txt
AGENTS.md 不再显示为 ignored
AI_HANDOFF.md 不再显示为 ignored
.ai/README.md 不再显示为 ignored
.ai/runs/_TEMPLATE/** 不再显示为 ignored
.ai/logs/** 仍然 ignored
.ai/dev-changelog/** 仍然 ignored
.ai/runs/具体任务目录 仍然 ignored
```

---

## P0-2. 修正两个文档 skill 中的 New Tab 路径

### 问题

当前两个 skill 仍然引用旧路径：

```txt
src/background/newTabRedirect.ts
```

真实路径是：

```txt
src/features/newtab/newTabRedirect.ts
```

这会影响 Agent 后续定位 New Tab 代码链路。

### 涉及文件

```txt
.agent/skills/project-doc-routing/references/doc-routing-matrix.md
.agent/skills/project-doc-maintenance/references/surface-doc-sync-map.md
```

### 修改方式

全局替换：

```txt
src/background/newTabRedirect.ts
```

为：

```txt
src/features/newtab/newTabRedirect.ts
```

### 检查命令

```bash
grep -R "src/background/newTabRedirect" -n .agent docs AGENTS.md AI_HANDOFF.md README.md README.zh-CN.md || true
```

期望结果：无输出。

### 验收标准

- `project-doc-routing` 的 New Tab 代码路由指向真实文件。
- `project-doc-maintenance` 的 New Tab 文档同步映射指向真实文件。
- Agent 后续处理 New Tab 时，不会误以为 redirect 逻辑位于 `src/background/`。

---

## P0-3. 修正 `module-boundaries.md` 中 Quick Save 最近文件夹的旧描述

### 问题

当前 `docs/architecture/module-boundaries.md` 的 Quick Save 部分仍写：

```txt
将最近使用文件夹 id 写入 quick-save UI state。
```

但当前主路径已经是共享 recent folders：

```txt
src/features/recent-folders/recentFolders.ts
bookmarkVisualizerRecentFolders
```

`bookmarkVisualizerQuickSaveUiState` 更像旧兼容 / fallback，不应该继续被描述成主存储入口。

### 涉及文件

```txt
docs/architecture/module-boundaries.md
docs/data/storage.md
```

### 推荐修改

将 Quick Save 职责中的旧句子改为：

```md
- 将最近使用文件夹 id 写入共享 recent-folders 状态：`src/features/recent-folders/recentFolders.ts` → `bookmarkVisualizerRecentFolders`。
- 旧版 `bookmarkVisualizerQuickSaveUiState` 仅作为兼容读取 / 迁移 fallback，不再作为新的 Quick Save 最近文件夹主写入入口。
```

### 同步检查

确认 `docs/data/storage.md` 对这两个 key 的描述一致：

```txt
bookmarkVisualizerRecentFolders          → 当前主 key
bookmarkVisualizerQuickSaveUiState       → 旧兼容 / fallback key
```

### 验收标准

- `docs/architecture/module-boundaries.md` 与 `docs/data/storage.md` 不再互相冲突。
- Quick Save 文档链路能清楚表达：保存行为复用 background handlers，最近文件夹复用 shared recent-folders 状态。

---

## P0-4. 修正 `domain-model.md` 中旧的 domain 路径推荐

### 问题

当前 `docs/data/domain-model.md` 仍然推荐旧路径：

```txt
src/features/table-view/
src/domain/bookmarkRecord.ts
src/domain/folderRecord.ts
src/domain/tagRecord.ts
```

但当前项目已经采用目录化 domain 结构：

```txt
src/domain/bookmark-record/
src/domain/folder-record/
src/domain/tag-record/
src/domain/table-view/
```

### 涉及文件

```txt
docs/data/domain-model.md
```

### 推荐修改

将“如果不想一次性新增太多目录，可以先最小化”这一段从旧 flat file 推荐改为当前结构说明：

```md
当前项目已经采用目录化 domain 分层：

```text
src/domain/bookmark-record/
  types.ts
  normalize.ts

src/domain/folder-record/
  types.ts
  normalize.ts

src/domain/tag-record/
  types.ts

src/domain/table-view/
  types.ts
  columns.ts
  filters.ts
  sorting.ts
```

后续继续扩展时，应优先在现有 domain 子目录内补充：

```text
validators.ts
denormalize.ts
mappers.ts
```

不再新增旧式 flat file：

```text
src/domain/bookmarkRecord.ts
src/domain/folderRecord.ts
src/domain/tagRecord.ts
src/features/table-view/
```
```

### 检查命令

```bash
grep -R "src/features/table-view\|src/domain/bookmarkRecord\|src/domain/folderRecord\|src/domain/tagRecord" -n docs .agent AGENTS.md README.md README.zh-CN.md || true
```

期望结果：无旧路径，除非文档明确写成“历史路径 / 不再使用”。

### 验收标准

- phase-2 数据模型文档与当前 `src/domain/*` 结构一致。
- 不再建议新增已过时的 flat file。
- 后续 Agent 做 import/export 或 table-view 任务时，会沿现有 domain 结构继续扩展。

---

## P0-5. 第一优先级整体验证

### 命令

```bash
npm run typecheck
npm run verify:popup-entry
npm run verify:quick-save-shortcut
```

如果当前环境来自跨平台 zip，`node_modules` 可能不可用，建议先重装依赖：

```bash
rm -rf node_modules package-lock.json
npm install
npm run typecheck
npm run test
npm run build
npm run verify:popup-entry
npm run verify:quick-save-shortcut
```

> 如果不想删除 `package-lock.json`，可以只删除 `node_modules` 后执行 `npm install`。

### 文档路径检查

```bash
grep -R "src/background/newTabRedirect" -n .agent docs AGENTS.md AI_HANDOFF.md README.md README.zh-CN.md || true

grep -R "src/features/table-view\|src/domain/bookmarkRecord\|src/domain/folderRecord\|src/domain/tagRecord" -n docs .agent AGENTS.md README.md README.zh-CN.md || true
```

### 验收标准

```txt
- 工作流入口文件不再被 .gitignore 错误忽略
- .agent skill 路径全部指向当前真实代码
- Quick Save 最近文件夹主 key 描述一致
- phase-2 数据模型文档不再推荐旧路径
- typecheck / verify 命令通过
```

---

# 第二优先级：Popup 设置体验修正

## P1-1. 修正 Popup “配置快捷键”按钮行为

### 问题

当前文件：

```txt
src/popup/tabs/SettingsTab.tsx
```

当前按钮：

```tsx
<button type="button" className="text-action" onClick={() => void openWorkspace()}>
  配置快捷键
</button>
```

用户点击“配置快捷键”时，预期更像是打开浏览器扩展快捷键设置页：

```txt
chrome://extensions/shortcuts
```

而不是打开完整管理页。

### 涉及文件

```txt
src/popup/tabs/SettingsTab.tsx
src/features/popup/popupClient.ts
src/app/workspace/WorkspaceComponents.tsx
```

### 推荐方案

复用管理页中 `ShortcutSettingsDialog` 的行为，在 popup client 增加一个专门方法：

```ts
export async function openExtensionShortcutSettings(): Promise<void> {
  const shortcutsUrl = "chrome://extensions/shortcuts";

  if (typeof chrome !== "undefined" && chrome.tabs?.create) {
    await chrome.tabs.create({ url: shortcutsUrl });
    window.close();
    return;
  }

  window.open(shortcutsUrl, "_blank", "noopener,noreferrer");
}
```

然后在 `SettingsTab.tsx` 中改为：

```tsx
import { openExtensionShortcutSettings } from "../../features/popup";

<button
  type="button"
  className="text-action"
  onClick={() => void openExtensionShortcutSettings()}
>
  配置快捷键
</button>
```

### 备选方案

如果当前阶段不希望 popup 直接打开 `chrome://extensions/shortcuts`，则改文案：

```txt
配置快捷键 → 打开管理页查看快捷键设置
```

但不推荐这个方案。因为“配置快捷键”本身更明确指向浏览器快捷键设置。

### 文档同步

需要检查并同步：

```txt
docs/frontend/surfaces/popup/settings-manage-tab.md
docs/frontend/surfaces/popup/css-maintenance.md
docs/frontend/surfaces/reference/ui-element-index.md
docs/product/interactions.md
```

文档中应说明：

```txt
Popup Settings → 快捷键 → 配置快捷键
行为：打开 chrome://extensions/shortcuts
不是打开完整管理页
```

### 验收标准

- 点击 Popup 设置页“配置快捷键”后，新开浏览器扩展快捷键设置页。
- Popup 自动关闭，行为与打开 workspace 的体验一致。
- 不影响 Manage Tab、Advanced Settings、默认保存位置的“打开管理页”行为。
- TypeScript 无报错。

---

## P1-2. 明确 `popupThemeMode` 的当前状态：文档化或接入 CSS

### 问题

当前设置里已经有类似 Popup 主题的设置项，但需要明确它是否真正影响 UI：

```txt
popupThemeMode
```

如果代码只是持久化设置，而 Popup CSS 没有完整消费它，就不能在 docs 里描述成“已完整支持 Popup 暗色模式”。

### 涉及文件

```txt
src/features/settings/
src/popup/PopupApp.tsx
src/popup/styles.css
docs/frontend/surfaces/popup/css-maintenance.md
docs/frontend/surfaces/popup/settings-manage-tab.md
docs/data/storage.md
```

### 推荐执行方式

分两步：

#### 第一步：先文档对齐

如果暂时不实现暗色主题，则文档应写成：

```md
`popupThemeMode` 当前作为设置状态持久化，用于后续 Popup 主题适配。当前 Popup 视觉仍主要使用默认浅色 token；不要把它描述成已完整生效的暗色主题能力。
```

#### 第二步：如果决定接入 CSS

在 `PopupApp.tsx` 的根节点加 mode class，例如：

```tsx
<div className={`popup-shell is-popup-theme-${settings.popupThemeMode}`}>
```

或使用更稳定的 attribute：

```tsx
<div className="popup-shell" data-popup-theme={settings.popupThemeMode}>
```

然后在 `src/popup/styles.css` 中补充：

```css
.popup-shell[data-popup-theme="dark"] {
  --popup-bg: #0f172a;
  --popup-surface: rgba(15, 23, 42, 0.92);
  --popup-text: #e5e7eb;
  --popup-muted: #94a3b8;
  --popup-border: rgba(148, 163, 184, 0.22);
}
```

最终以项目现有 token 命名为准，不要临时硬塞过多局部变量。

### 推荐选择

当前第二优先级建议先做：

```txt
1. 文档明确 popupThemeMode 当前状态
2. 不急着完整实现暗色主题
```

原因：这次第二优先级的主要目标是修正体验误导，不是新增一套主题系统。

### 验收标准

- docs 中不再把 `popupThemeMode` 误写成完整已生效能力。
- 如果实现 CSS 接入，则 Popup Settings 中切换主题后，Popup 根节点 class / data attribute 会变化，关键背景、文字、边框 token 生效。
- README 不需要因此修改，除非你决定把 Popup 多主题能力作为公开功能点。

---

## P1-3. 第二优先级整体验证

### 命令

```bash
npm run typecheck
npm run test -- --runInBand 2>/dev/null || npm run test
npm run build
npm run verify:popup-entry
npm run verify:quick-save-shortcut
```

如果 `npm run test -- --runInBand` 不适用于 Vitest，可直接使用：

```bash
npm run test
```

### 手动 QA

#### Popup 快捷键设置

```txt
1. npm run build
2. 在 Chrome / Edge 加载 dist/
3. 打开任意普通网页
4. 点击扩展图标
5. 进入 Settings Tab
6. 点击“配置快捷键”
7. 期望：打开 chrome://extensions/shortcuts
8. 期望：popup 关闭
```

#### Popup 其他入口回归

```txt
- Save Tab 仍可保存当前页面
- Save Location Picker 仍可搜索 / 最近位置 / 新建文件夹 / 级联选择
- Manage Tab 仍能打开完整工作台
- Advanced Settings 仍能打开完整工作台
- New Tab 开关仍能保存设置
```

#### 文档回归

```txt
- popup settings 文档中的“配置快捷键”行为与代码一致
- popupThemeMode 的状态描述与代码一致
- README.md / README.zh-CN.md 不需要因小改动同步，除非实际新增了公开能力
```

---

# 建议提交拆分

建议拆成两个 commit，避免工作流修复和 UI 行为修复混在一起：

```bash
git add .gitignore .agent docs AGENTS.md AI_HANDOFF.md .ai/README.md .ai/runs/_TEMPLATE
git commit -m "chore: align agent docs workflow paths"
```

然后：

```bash
git add src/popup src/features/popup docs/frontend docs/product docs/data
git commit -m "fix: open extension shortcut settings from popup"
```

如果第二个 commit 只改文档、不改代码，则提交信息改为：

```bash
git commit -m "docs: clarify popup settings behavior"
```

---

# 最小完成定义

这两个优先级完成后，项目应达到以下状态：

```txt
1. Agent 工作流入口能被 Git 稳定追踪
2. 运行型 AI 日志不会继续污染仓库
3. doc skills 中的 New Tab 路径完全对齐真实代码
4. Quick Save 最近文件夹文档与当前 storage 主 key 一致
5. phase-2 数据模型文档不再推荐旧 domain 路径
6. Popup “配置快捷键”按钮行为与用户预期一致
7. popupThemeMode 的文档描述不夸大当前实现
8. typecheck / test / build / verify 命令在本地干净通过
```
