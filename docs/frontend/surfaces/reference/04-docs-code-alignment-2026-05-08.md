# Docs 与当前代码对齐记录（2026-05-08）

## 对齐基准

本次文档以 `bookmark-visualizer (6).zip` 为代码基准。

重点校验对象：

- `public/manifest.json`
- `src/app/*`
- `src/popup/*`
- `src/newtab/*`
- `src/features/*`
- `src/background/*`
- `src/lib/chrome/*`

## 已修正内容

| 原问题 | 已修正位置 |
|---|---|
| 文档把工具栏图标描述成“直接打开完整管理页” | `product/overview.md`、`product/requirements.md` |
| 管理页仍描述成旧的左右两栏布局 | `product/ui-design.md` |
| storage key 只写了旧的三个 key，且把 `bookmarkVisualizerQuickSaveUiState` 写成主 key | `data/storage.md`、`frontend/surfaces/shared/02-data-storage-and-chrome-api.md` |
| Popup 页面信息提取写成 description / canonical | `architecture/overview.md` |
| Quick Save 保存链路写成不存在的 `metadataService.updateNote` | `frontend/surfaces/quick-save/01-dialog-ui-and-shadow-dom.md` |
| New Tab 建议项 selector 写成 `.nt-search-row` | `frontend/surfaces/newtab/01-layout-search-shortcuts.md`、`reference/01-code-navigation-index.md` |
| New Tab 三种布局模式被写成完整对称 CSS 体系 | `frontend/surfaces/newtab/03-css-maintenance.md` |
| `src/popup/components/SettingsRows.tsx` 被误读为现有文件 | `frontend/surfaces/popup/03-settings-and-manage-tab.md` |
| background 文件导航过粗，New Tab redirect 位置不清晰 | `architecture/overview.md`、`frontend/surfaces/reference/01-code-navigation-index.md` |

## 当前仍需维护者注意

- 文档中出现“未来能力”“占位”“预留”时，不应被下游执行者理解成当前已实现功能。
- RightRail 中的导入、导出、查重、回收站、升级空间仍是 disabled 占位。
- `summary` / `summarySource` 是 metadata 类型预留，当前没有网页摘要抓取功能。
- `cardDensity` 是设置类型字段，但当前 normalize 固定为 `comfortable`。
- New Tab 使用 runtime redirect，不使用 `chrome_url_overrides.newtab`。
