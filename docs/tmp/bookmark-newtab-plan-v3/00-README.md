# Bookmark New Tab Plan v3

## 这套文件解决什么问题

这套方案把 Bookmark Visualizer 的 New Tab 从“书签管理页的缩小版”重新定义为：

> 搜索优先的浏览器首页 → 固定常用网站快速启动 → 轻量展示收藏文件夹与精选书签 → 必要时跳转完整管理页。

也就是说，New Tab 不再强调左上角“我的书签”，而是保留轻量品牌 `Bookmark Visualizer · 新标签页`。用户打开新标签页时，第一目标是搜索或进入常用站点；书签文件夹是第二层信息组织能力。

## 当前代码基线

当前仓库是 Manifest V3 扩展，核心入口如下：

```text
index.html                 → src/main.tsx → src/app/App.tsx
popup.html                 → src/popup/main.tsx → src/popup/PopupApp.tsx
src/service-worker.ts      → src/background/serviceWorker.ts
public/manifest.json       → action.default_popup + background.service_worker
```

当前已有可复用模块：

```text
src/features/bookmarks/     原生书签树、文件夹扁平化、路径、可写性判断
src/features/search/        标题 / URL 内存搜索
src/features/settings/      chrome.storage.local 设置读写与 normalize
src/features/popup/         当前标签页保存、打开完整管理页、popup view model
src/features/quick-save/    快捷保存状态、最近保存文件夹、创建书签 / 文件夹
src/features/metadata/      备注、缩略图等扩展元数据
src/lib/chrome/             Chrome API adapters
```

当前 `docs/adr/0002-use-new-tab-as-primary-surface.md` 已标注“主界面使用新标签页”被废弃。因此这次不是恢复“New Tab 作为完整管理页”，而是新增一个独立、可开关的 `New Tab Portal`。

## 推荐落地策略

用户希望在 popup 设置里开关是否绑定 New Tab。这里不能用 `chrome_url_overrides.newtab` 做最终方案，因为它是 manifest 静态声明，不能被运行时开关真正启停。

推荐方案：

```text
manifest 不声明 chrome_url_overrides
service worker 监听 chrome.tabs.onCreated / onUpdated
读取 settings.newTabOverrideEnabled
开启 → 将默认新标签页跳转到 chrome.runtime.getURL("newtab.html")
关闭 → 不处理，浏览器保持默认新标签页
```

这是一种“可开关重定向”方案，不是 Chrome 原生 override。它的优点是符合用户“可开关”的需求；代价是极少数场景可能有轻微跳转感。若未来产品决定必须做到零闪烁，则应改为 manifest 静态 `chrome_url_overrides.newtab`，但就不能实现真正的运行时关闭。

## 文件列表

| 文件 | 用途 |
|---|---|
| `01-product-scope-and-analysis.md` | 功能介绍、功能分析、边界与推荐信息架构 |
| `02-ui-layout-and-components.md` | UI 布局、四种预览图解释、组件拆分、样式规范 |
| `03-technical-architecture.md` | 结合当前代码的技术架构、模块边界、运行链路 |
| `04-data-model-settings-storage.md` | 设置、New Tab 状态、活动记录、搜索引擎配置的数据结构 |
| `05-implementation-guide.md` | 分阶段改造指南，具体到文件路径和任务 |
| `06-code-snippets.md` | 可直接交给程序员参考的关键代码片段 |
| `07-testing-and-acceptance.md` | 单元测试、集成测试、手动验收清单 |
| `08-agent-prompt.md` | 给 coding agent / 程序员执行的完整提示词 |

## 预览图

| 状态 | 文件 | 说明 |
|---|---|---|
| 默认首页 | `assets/01-default-search-shortcuts-folders.png` | 搜索优先 + 固定快捷方式 + 书签分组 |
| 搜索展开 | `assets/02-search-suggestion-overlay.png` | 网络搜索与本地书签混合建议 |
| 动态侧栏 | `assets/03-hover-sidebar-folder-preview.png` | 左侧文件夹侧栏展开，适合重度书签用户 |
| Tab 分区 | `assets/04-tabbed-folder-mode.png` | 常用网站 / 书签文件夹 / 最近收藏分区 |

## 建议采用哪一个设计

MVP 推荐采用：

```text
默认首页布局：搜索模块 + 固定快捷方式 + 书签分组 + 精选书签 + 最近活动
```

并把“动态侧栏”和“Tab 分区”作为后续可选布局模式。这样可以避免第一版过度复杂，也能满足用户的核心诉求：像 Infinity 一样快速启动常用网站，同时保留 Bookmark Visualizer 独有的书签归类能力。

## 官方参考

- Chrome override pages: https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages
- Chrome Tabs API: https://developer.chrome.com/docs/extensions/reference/api/tabs
- Chrome Storage API: https://developer.chrome.com/docs/extensions/reference/api/storage
