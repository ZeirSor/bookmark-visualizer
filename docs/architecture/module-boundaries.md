# 模块边界

## 第一阶段分层边界

当前代码按现有目录继续演进，但新增或拆分代码时遵守以下职责方向：

- UI entrypoints：`src/app`、`src/popup` 和 content script 入口只负责挂载、布局、组件组合和用户事件绑定。
- Feature / use-case orchestration：`src/features/*` 负责业务动作编排，例如保存当前网页、移动书签、写入 metadata、搜索和拖拽合法性。
- Domain models and pure rules：未来 `src/domain/*` 放稳定领域模型和纯规则；本阶段只规划，不强制创建。
- Infrastructure adapters：当前 `src/lib/chrome/` 保持为 Chrome API 访问边界，UI 和业务模块不得散落直接调用 `chrome.*`。

第一阶段不做云端、账号、订阅、Notion、AI 摘要或完整多维表格视图。相关后续方向见 [Phase 1 local architecture](phase-1-local-architecture.md) 和 [Strategy](../strategy/README.md)。

## bookmarks

负责浏览器原生书签树的读取和修改。

职责：

- 读取完整树。
- 创建书签。
- 更新书签标题和 URL。
- 移动书签。
- 删除书签。
- 判断节点是否可修改。
- 为路径导航生成结构化 breadcrumb 节点链。

当前 adapter 已有 `create`、`move`、`update`、`remove`；书签创建 / 移动 / 重排 / 更新 / 删除，以及文件夹创建 / 移动 / 重命名已通过这些 adapter 路径实现。文件夹删除属于后续扩展。

不负责：

- 保存备注和摘要。
- 搜索排序策略。
- 具体 UI 渲染。

## metadata

负责插件自有数据。

职责：

- 保存备注、摘要和摘要来源。
- 保存 UI 设置。
- 导入和导出元数据。
- 做版本迁移。

当前实现已保存手动备注；摘要、导入导出和 migration 流程尚未实现完整 UI。

不负责：

- 改变浏览器原生书签位置。
- 判断搜索匹配度。

## search

负责全局搜索。

职责：

- 建立内存索引。
- 当前匹配标题和 URL。
- 后续匹配备注和摘要。
- 计算匹配度。
- 当前按匹配度和添加时间排序。
- 后续根据最近使用时间排序并应用过滤器。

不负责：

- 持久化搜索索引。
- 修改书签或元数据。

## drag-drop

负责拖拽状态和合法性校验。

职责：

- 管理拖拽源和目标。
- 判断书签或文件夹是否可拖拽。
- 判断 drop 目标是否合法。
- 判断书签卡片和树内书签条目的同父级重排位置是否合法。
- 调用 bookmarks 模块完成真实移动。

不负责：

- 自行写入 storage。
- 绕过 bookmarks 模块直接调用 `chrome.bookmarks.move()`。

## context-menu

负责右键菜单和“移动到...”菜单。

职责：

- 当前展示书签卡片右键操作入口：编辑、前后新建书签、移动、删除。
- 当前提供悬浮展开的多级文件夹移动菜单。
- 当前提供可搜索文件夹选择器，作为深层移动目标的补充入口。
- 当前提供文件夹右键菜单：新建子文件夹、重命名。
- 将用户选择转交 bookmarks 模块执行。
- 多级文件夹级联选择 UI 应复用共享组件，避免移动、快捷保存等场景各自维护一套分叉逻辑。

不负责：

- 决定 API 底层错误处理。
- 保存业务数据。

## summary

负责备注和未来摘要体验。

当前职责：

- 手动备注编辑。
- 将备注写入 `bookmarkVisualizerMetadata`。
- 预留 `summary` / `summarySource` 类型字段。

当前不负责：

- 当前代码尚未实现网页 `description` 抓取。
- 当前代码尚未实现 AI 摘要。
- 当前代码不后台批量抓取网页正文。

未来如果实现摘要抓取，必须新增明确的权限策略、提取链路和 UI 状态文档，不能把预留字段直接写成已上线能力。

## popup

负责浏览器工具栏 popup 内的当前网页保存体验。

职责：

- 通过 `popup.html` 和 React 入口渲染“保存 / 管理 / 设置”三个 Tab。
- 使用 `chrome.tabs.query` 获取当前标签页，并在普通网页中按需执行页面 metadata 提取。
- 展示标题、只读 URL、备注、预览图和保存位置区域。
- 支持右侧箭头触发的共享文件夹级联菜单、文件夹搜索、最近使用文件夹展开、当前层级行内新建文件夹和打开完整工作台入口。
- 将保存和新建文件夹请求发给 service worker，复用 quick-save 的原生书签创建、metadata 写入和最近文件夹状态。

不负责：

- 常驻网页监听快捷键。
- 替代完整工作台的拖拽整理、批量查看和复杂管理功能。

## quick-save

负责当前网页的快捷保存体验。

职责：

- 通过保留的扩展命令触发当前页保存浮框。
- 在 content script 中读取当前页面 URL、标题和候选预览图片。
- 展示居中的 Shadow DOM 保存浮框，避免网页样式污染。
- 展示可滚动、可定位的多级保存文件夹菜单。
- 展示完整保存路径、文件夹搜索、最近使用文件夹和浏览文件夹面板。
- 将浮框内新建文件夹请求发回 service worker，由 bookmarks 模块创建真实文件夹。
- 将保存请求发回 service worker，由 bookmarks 模块创建真实书签。
- 将备注和预览图片 URL 写入 metadata。
- 将最近使用文件夹 id 写入共享 recent-folders 状态：`src/features/recent-folders/recentFolders.ts` → `bookmarkVisualizerRecentFolders`。
- 旧版 `bookmarkVisualizerQuickSaveUiState` 仅作为兼容读取 / 迁移 fallback，不再作为新的 Quick Save 最近文件夹主写入入口。

不负责：

- 将 Chrome Keyboard Shortcuts 中的 `Ctrl + S` 分配作为稳定入口。
- 默认注入全局 `Ctrl + S` 网页 listener。
- 下载或转存网页图片。
- 维护独立书签结构。

## settings

负责用户偏好。

当前已落地职责：

- `showBookmarksInTree`：管理页是否在树中显示书签条目。
- `theme`：管理页主题。
- `cardSize`：管理页卡片尺寸。
- `sidebarWidth`：管理页侧栏宽度。
- Popup 保存行为：自动关闭、成功提示、记住保存位置、显示缩略图。
- Popup 偏好：默认打开 Tab、Popup 主题模式、默认保存文件夹。
- New Tab 绑定开关、默认搜索引擎、默认搜索类型、布局模式、最近活动显示、存储信息显示、每行快捷方式数量。

当前边界说明：

- `cardDensity` 类型存在，但 normalize 固定为 `comfortable`，当前不是可配置 UI。
- 导入 / 导出基础模块存在于 `src/features/import-export/*`，但 RightRail 相关按钮当前仍是 disabled，占位不能写成已完整接入设置 UI。

不负责：

- 浏览器书签结构修改。
- 云同步、账号、订阅配置。

## newtab

负责可选新标签页入口的搜索、启动和轻量书签浏览体验。

职责：

- 通过 `newtab.html` / `src/newtab` 渲染 New Tab Portal。
- 在 `src/features/newtab` 中维护 New Tab 独有 state、固定快捷方式、最近活动、使用统计、搜索引擎配置、混合搜索建议、ViewModel 和运行时重定向逻辑。
- 复用 settings、bookmarks、search 和 `src/lib/chrome` adapter；UI 组件不得散落直接调用 `chrome.*`。
- 只读派生浏览器原生书签树，不维护插件自有的平行书签结构。
- 复杂管理通过 `index.html?folderId=...` 或 `bookmarkId=...` 深链接进入完整工作台。

不负责：

- 完整文件夹树管理、复杂拖拽整理或 destructive 书签操作。
- 天气、壁纸、待办、账号、云同步、AI 摘要或远程 favicon 必需依赖。
- 使用 manifest 静态 `chrome_url_overrides.newtab`。
