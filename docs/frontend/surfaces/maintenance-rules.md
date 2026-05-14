---
type: reference
status: active
scope: frontend
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Frontend Surfaces 文档架构与维护规则

## 文档类型划分

本目录采用“页面说明 + 代码导航 + 设计参考 + 回归清单”的组合结构：

Frontend Surfaces 是 UI surface 实现导航，不替代产品、架构、数据或 ADR 文档。产品行为变化先同步 `docs/product/`，模块边界、入口和权限变化先同步 `docs/architecture/`，storage key 和数据模型变化先同步 `docs/data/`，长期技术决策先同步 `docs/adr/`；本目录只补充对应 surface 的组件路径、selector、状态链路和回归清单。

| 文档类型 | 用途 | 文件位置 |
|---|---|---|
| 页面 README | 说明页面定位、入口、职责边界、核心代码链路 | `manager/README.md`、`popup/README.md`、`newtab/README.md`、`quick-save/README.md` |
| UI map | 逐区块列出按钮、图标、输入框、状态、CSS selector | `*/01-*.md` |
| data flow | 解释状态来源、事件流、写入点、Chrome API 路径 | `manager/03-*`、`popup/02-*`、`newtab/02-*` |
| CSS maintenance | 维护 token、布局、响应式和风险 selector | `*/04-*` 或 `*/03-*` |
| shared reference | 管理跨页面组件、数据和级联菜单 | `shared/*` |
| index/checklist | 快速找文件和验收回归 | `reference/*` |

## 更新文档的触发条件

| 代码变化 | 必须更新的文档 |
|---|---|
| 新增页面入口、HTML entry 或 manifest entry | `docs/architecture/` 或 `docs/adr/`、本目录 `README.md`、`code-alignment.md`、对应页面 README |
| 改动 `App.tsx` / `PopupApp.tsx` / `NewTabApp.tsx` 的布局结构 | 对应页面 UI map、component catalog、CSS 文档 |
| 改动按钮、输入框、图标、aria-label、disabled 状态 | 对应 UI map + `reference/ui-element-index.md` |
| 改动 `src/styles/tokens.css` | 所有相关 CSS 文档 + `shared/shared-components.md` |
| 改动 `FolderCascadeMenu` | `shared/folder-cascade-menu.md` + Popup / Quick Save / Manager 级联相关章节 |
| 改动 settings 默认值或 storage key | `docs/data/` + `shared/data-storage-chrome-api.md` + New Tab / Popup 设置文档 |
| 新增 Chrome API 使用 | `docs/architecture/` 或 `docs/adr/` + `shared/data-storage-chrome-api.md` + 相关页面 flow |
| 新增长期架构决策 | `docs/adr/` 新增 ADR，并在 surfaces 中引用 |

## 每个页面文档必须包含的内容

```text
1. 页面定位：它解决什么任务，不解决什么任务。
2. 入口链路：HTML / main.tsx / root component / CSS / feature modules。
3. 组件树：父子组件、props、状态来源。
4. UI 元素表：按钮、图标、输入框、select、textarea、chip、menu、toast。
5. 样式链路：CSS selector、token、响应式、hover/focus/disabled/loading/empty。
6. 数据链路：读什么、写什么、从哪里来、存到哪里。
7. 操作链路：用户点击 → React handler → feature/service → Chrome API / storage → UI feedback。
8. 维护风险：本页面最容易踩坑的地方。
9. 回归清单：改完后必须验收的路径。
```

## 命名规则

- 页面目录使用英文短名：`manager`、`popup`、`newtab`、`quick-save`。
- 文件名使用两位序号 + 主题，例如 `layout-ui-map.md`。
- 代码路径使用 repo 相对路径，例如 `src/app/App.tsx`。
- CSS selector 使用反引号，例如 `.bookmark-card`。
- 状态字段使用反引号，例如 `selection.selectionMode`、`settings.newTabOverrideEnabled`。

## 文档维护原则

1. **代码优先**：当文档和代码冲突，以当前源码为准，然后修正文档或提出代码修复。
2. **不要写假功能**：禁用按钮要明确写“占位 / 未实现”，不能把它描述成已实现能力。
3. **设计 token 先行**：新增颜色、阴影、圆角、字体先进入 token 层，再进入页面 CSS。
4. **按入口验收**：同一 shared 组件改动后，至少验收所有使用它的页面。
5. **记录原因**：架构级取舍不要只写“怎么做”，还要补“为什么这么做”。
6. **避免截图依赖**：截图 / GIF 可以作为视觉参考，但 surfaces 必须能靠代码路径和 selector 独立维护。
