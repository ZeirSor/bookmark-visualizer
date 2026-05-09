# Frontend Implementation Roadmap

## Phase 1: Token Unification

- 扩展 `src/styles/tokens.css`，建立 `--bv-color-*`、`--bv-radius-*`、`--bv-shadow-*`、`--bv-font-*`。
- 将 `--nt-*`、`--popup-*`、`--app-*` 作为页面别名映射到基础 token。
- Popup 和 New Tab 都必须引入 `src/styles/tokens.css`。
- 新增颜色、阴影、圆角时先进入 token，再进入页面 CSS。

Validation:

- `npm run typecheck`
- 检查 CSS 中新增 hex 色值是否有合理理由。

## Phase 2: New Tab Header Alignment

- 为 `nt-header-top`、`nt-main-nav`、`nt-brand-copy` 补齐 CSS。
- Header 主品牌改为 `Bookmark Visualizer`，`新标签页` 作为 pill。
- Header action 使用轻按钮，搜索仍是页面第一视觉焦点。

Validation:

- New Tab header 不出现大标题 `我的书签`。
- 小屏时 header 不挤压搜索主体。

## Phase 3: Popup State Completion

- `PagePreviewCard` 增加 loading skeleton。
- `LocationPathRow` 增加 disabled/loading 状态。
- `InlineCreateFolderRow` 增加创建中 spinner。
- 保存位置搜索、新建、级联保持互斥。

Validation:

- Popup 默认态、级联态、搜索态、新建态、最近展开态都能手动验收。
- `npm run verify:save-window-entry`

## Phase 4: Management Surface Consistency

- 管理页映射到 `--app-*` alias。
- 卡片、菜单、右键级联、搜索输入和 toast 与共享组件模式对齐。
- 不重写管理页信息架构，不改变书签读写边界。

Validation:

- 大量书签场景下滚动、右键、拖拽、搜索仍可用。
- `npm run test`
- `npm run build`

## Phase 5: Documentation And Release Hygiene

- 前端行为变化同步 `docs/product/`。
- 模块职责或入口变化同步 `docs/architecture/`。
- 验收命令和手动验收变化同步 `docs/guides/`。
- 长期技术决策变化补 ADR。

Validation:

- `docs/README.md` 和目录 README 均已更新。
- 每轮非轻量工作写入 `.ai/logs/`。
