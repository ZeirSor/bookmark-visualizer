# Bookmark Visualizer 架构分层、数据模型与云端化演进指南

> 目标：在不改变当前功能的前提下，为 Bookmark Visualizer 做一次面向长期维护、订阅制、云同步、多维表格视图与第三方集成的架构梳理。本文优先讨论架构与代码设计，不安排新功能开发。

---

## 0. 核心判断

当前项目结构 **不算特别混乱**。它已经具备一个合格 MVP 的基本分层：

- `src/lib/chrome/` 封装 Chrome API；
- `src/features/` 按业务能力拆模块；
- `src/components/` 放可复用 UI；
- `src/app/` 承载完整管理工作台；
- `src/popup/` 承载工具栏浮窗入口；
- `src/service-worker.ts` 作为 Manifest V3 后台入口。

但它已经出现了典型的 MVP 后期压力：

1. 页面入口、业务逻辑、Chrome API 调用、状态管理混在大文件里；
2. 本地数据模型仍停留在“浏览器书签 ID → metadata map”，还没有演进成长期可扩展的领域模型；
3. 未来云同步、订阅制、Notion 集成、多维表格视图都需要稳定的数据边界，现在还没有提前留好接口；
4. `App.tsx`、`popup/main.tsx`、`quick-save/content.tsx` 和 `service-worker.ts` 正在变成架构压力点。

因此，当前阶段最重要的不是增加功能，而是做一次 **架构收口**：

```text
当前目标：保持功能不变 → 明确分层 → 拆大文件 → 抽数据模型 → 为云端化预留接口
```

---

## 1. 必须先修复的 4 个 P0 问题

### P0-1：同步过时文档，统一入口叙述

当前项目文档里存在旧路线与新路线并存的问题。最新实际实现是：

```text
点击扩展图标 → 打开 popup.html
popup 默认进入保存页 → 可保存当前网页
popup 管理页 → 可打开 index.html 完整管理工作台
Ctrl + Shift + S / Command + Shift + S → 保留快捷保存入口
Ctrl + S → 暂停，不作为当前验收路径
```

需要优先同步：

- `AI_HANDOFF.md`
- `docs/product/requirements.md`
- `docs/architecture/overview.md`
- `docs/adr/0006*`
- `docs/adr/0008*`

完成标准：任何新接手的程序员只看文档，也不会误以为扩展 action 会绕过 popup 直接进入完整工作台。

---

### P0-2：收敛测试脚本，避免测试扫描范围失控

当前 `package.json`：

```json
"test": "vitest run"
```

建议改成：

```json
"test": "vitest run --dir src --exclude '**/node_modules/**' --exclude '**/.git/**'"
```

原因：当前压缩包中包含 `.git`、`dist`、历史日志等目录。直接 `vitest run` 在某些环境下可能扫描范围过大，导致测试耗时异常或不退出。

完成标准：

```bash
npm run typecheck
npm test
npm run build
```

三者均可稳定通过。

---

### P0-3：真实浏览器手动验收 popup 保存主流程

目前构建和类型检查通过，不等于扩展在真实 Chrome / Edge 里主流程稳定。Manifest V3 的 service worker 生命周期、popup 关闭行为、权限弹窗、activeTab 权限都需要实机验证。

必须验收：

1. 点击扩展图标后打开 popup；
2. 自动读取当前标签页标题、URL、预览图候选；
3. 搜索保存文件夹；
4. 最近文件夹可用；
5. 当前文件夹下新建子文件夹；
6. 保存后原生浏览器书签里可见；
7. metadata 中备注与预览图写入正常；
8. 保存后自动关闭逻辑符合设置；
9. 不支持页面，例如 `chrome://`，能够降级提示；
10. service worker 被浏览器回收后再次唤醒仍能处理消息。

完成标准：至少在 Chrome 和 Edge 各用一个干净 profile 测试通过。

---

### P0-4：修复 metadata 备注清空语义

当前 `saveBookmarkMetadata()` 逻辑大致是：

```ts
note: trimmedNote ?? existing?.note
```

问题：如果用户明确把备注清空，空字符串可能无法覆盖旧备注。

建议语义：

```text
undefined → 不修改该字段
""        → 明确清空该字段
"abc"     → 写入新值
```

建议改造：

```ts
type BookmarkMetadataPatch = {
  note?: string;
  previewImageUrl?: string;
};

function applyMetadataPatch(
  existing: BookmarkMetadata | undefined,
  patch: BookmarkMetadataPatch
): BookmarkMetadata {
  const next: BookmarkMetadata = {
    ...existing,
    updatedAt: Date.now()
  };

  if ("note" in patch) {
    next.note = patch.note?.trim() ?? "";
  }

  if ("previewImageUrl" in patch) {
    next.previewImageUrl = patch.previewImageUrl?.trim() || undefined;
  }

  return next;
}
```

同时补测试：

- 旧备注存在时，传入 `note: ""` 后应清空；
- 未传 `note` 时应保留旧备注；
- 传入新备注时应覆盖旧备注。

---

## 2. 参考成熟浏览器扩展后的架构结论

结合 Chrome 官方 MV3 文档、Plasmo 扩展框架约定、Bitwarden MV3 迁移经验，以及 Notion 数据库模型，可以得出几个关键结论。

### 2.1 浏览器扩展天然是多入口应用，不是单页 Web App

一个扩展至少有这些运行上下文：

```text
popup 页面
options / workspace 页面
background service worker
content script
injected page script，可选
外部 Web App，可选
```

因此，项目结构不能只按“React 页面组件”组织，也不能只按“业务功能”组织。更稳的方式是同时区分：

```text
运行入口 entrypoints
领域模型 domain
应用用例 application/use-cases
平台适配 infrastructure/adapters
UI 展示 ui/views/components
```

当前项目已经有 `features` 和 `lib/chrome`，方向是对的；但还缺少更清晰的 **entrypoint 层** 和 **domain 层**。

---

### 2.2 Manifest V3 service worker 不能当常驻后端

MV3 的 background 是 service worker，它会被浏览器挂起和唤醒。因此不能把它设计成一个长期驻留的“内存后端”。

不建议：

```text
service worker 内维护长期状态
service worker 内放复杂业务流程
service worker 内保存未持久化的操作队列
```

建议：

```text
service worker = 事件路由器 + 权限能力代理 + 命令处理入口
持久状态 = chrome.storage / IndexedDB / 远程 API
复杂业务 = application service / use case
```

---

### 2.3 成熟扩展会把浏览器 API 与业务模型隔离

你们现在的 `src/lib/chrome/bookmarksAdapter.ts` 是一个好起点。长期应继续扩大这个模式：

```text
Chrome bookmarks API       → BrowserBookmarkProvider
Chrome storage API         → LocalStorageProvider
Chrome runtime messaging   → ExtensionMessageBus
Chrome identity API        → ExtensionAuthProvider
Remote HTTP API            → CloudApiClient
Notion API                 → NotionIntegrationClient
```

业务层不应该直接知道 `chrome.bookmarks.create()`、`chrome.storage.local.get()` 这些细节。

---

### 2.4 未来订阅制意味着：扩展只是一部分客户端

如果要做订阅制，Chrome 插件不能再被理解为完整产品本体，而应该是：

```text
Bookmark Visualizer Product
  ├─ Browser Extension Client
  ├─ Web Dashboard Client，可选
  ├─ Cloud API Backend
  ├─ Sync Service
  ├─ Billing / Entitlement Service
  ├─ Integration Service，例如 Notion
  └─ Data Store
```

浏览器扩展是最重要的入口，但不是唯一系统边界。

---

## 3. 当前项目结构：哪些地方挺好，哪些地方要改

### 3.1 值得保留的设计

#### 1. 使用浏览器原生书签作为基础数据源

这是正确选择。浏览器原生书签已经有：

- 浏览器内置同步；
- 原生导入导出；
- 用户信任基础；
- 跨扩展可见性；
- 低迁移成本。

当前不要急着替换成自建书签数据库。

建议继续坚持：

```text
免费 / 本地模式：chrome.bookmarks 是书签结构事实来源
高级 / 云端模式：云端补充 metadata、tags、activity、backup、integrations
```

---

#### 2. `src/lib/chrome/` 作为 Chrome API 适配层

这是当前架构里最值得保留的部分。

后续应把它升级为：

```text
src/infrastructure/browser/chrome/
  bookmarksProvider.ts
  storageProvider.ts
  tabsProvider.ts
  scriptingProvider.ts
  identityProvider.ts
  runtimeMessageBus.ts
```

这样未来支持 Edge / Firefox，或做 Web Dashboard 时，不会让 Chrome API 侵入全部业务代码。

---

#### 3. `src/features/` 按业务能力拆模块

当前 `bookmarks`、`drag-drop`、`metadata`、`settings`、`search` 等模块是合理的。

但建议后续进一步区分：

```text
纯领域逻辑       → src/domain/*
业务用例         → src/application/*
React hooks      → src/features/*/hooks 或 src/ui/hooks
页面入口状态     → src/entrypoints/*
```

---

#### 4. 当前权限边界较干净

manifest 里没有全局 `host_permissions` 和全局 `content_scripts`，这对长期上架、用户信任和安全审核都更友好。

建议继续坚持最小权限原则：

```text
默认不申请所有网站权限
需要读取当前页时使用 activeTab
需要深度抓取时再做用户明确授权
```

---

### 3.2 需要改进的结构问题

#### 问题 1：`App.tsx` 是最大架构压力点

当前 `src/app/App.tsx` 超过 2000 行，承担了：

- 页面布局；
- 文件夹树状态；
- 搜索状态；
- 拖拽状态；
- 右键菜单；
- 新建书签；
- 新建文件夹；
- 移动书签；
- toast；
- 操作日志；
- 设置弹窗；
- 撤销逻辑。

这已经不是一个页面组件，而是一个“前端业务中枢”。

建议拆成：

```text
src/entrypoints/workspace/
  main.tsx
  WorkspaceApp.tsx
  WorkspaceLayout.tsx

src/features/workspace/
  hooks/
    useWorkspaceState.ts
    useWorkspaceSelection.ts
    useWorkspaceSearch.ts
    useWorkspaceDragDrop.ts
    useWorkspaceContextMenu.ts
    useWorkspaceToasts.ts
    useWorkspaceUndoLog.ts
  components/
    WorkspaceToolbar.tsx
    WorkspaceMainPanel.tsx
    WorkspaceSidePanel.tsx
    OperationLogDrawer.tsx
```

拆分原则：

```text
App.tsx 只负责组合，不负责具体业务细节
```

---

#### 问题 2：`popup/main.tsx` 需要拆成稳定的 popup 模块

当前 popup 已经承担保存、管理、设置三个 Tab。继续堆下去会变成第二个 `App.tsx`。

建议拆成：

```text
src/entrypoints/popup/
  main.tsx
  PopupApp.tsx
  PopupShell.tsx
  PopupTabs.tsx

src/features/popup-save/
  SaveTab.tsx
  usePopupSaveState.ts
  useFolderSearch.ts
  useRecentFolders.ts

src/features/popup-manage/
  ManageTab.tsx

src/features/popup-settings/
  SettingsTab.tsx
```

注意：popup 是短生命周期 UI，关闭即销毁。因此它不应该承担复杂状态。复杂操作应该交给 service worker 或 application use case。

---

#### 问题 3：`quick-save/content.tsx` 混合了 content script、UI 和业务逻辑

content script 的职责应当尽量薄：

```text
接收消息 → 挂载 UI → 采集页面可见信息 → 调用扩展消息 → 卸载 UI
```

不建议在 content script 中长期堆复杂业务逻辑，因为它运行在网页上下文附近，受页面环境、CSP、iframe、权限等影响更大。

建议拆成：

```text
src/entrypoints/content-scripts/quick-save-content.tsx

src/features/quick-save-dialog/
  QuickSaveDialog.tsx
  QuickSaveFolderPicker.tsx
  QuickSaveNoteField.tsx
  useQuickSaveDialog.ts

src/application/quick-save/
  createQuickSaveBookmark.ts
  createQuickSaveFolder.ts
  loadQuickSaveInitialState.ts
```

---

#### 问题 4：`service-worker.ts` 需要从“业务处理文件”降级为“路由入口”

当前 service worker 已经在处理：

- 快捷键命令；
- 当前标签页判断；
- 注入 quick-save；
- 读取书签树；
- 创建书签；
- 保存 metadata；
- 创建文件夹；
- 最近文件夹处理。

建议改为：

```text
src/entrypoints/background/serviceWorker.ts
  registerCommandHandlers()
  registerMessageHandlers()

src/background/handlers/
  quickSaveMessageHandler.ts
  commandHandler.ts

src/application/quick-save/
  getInitialQuickSaveState.ts
  createBookmarkFromQuickSave.ts
  createFolderFromQuickSave.ts
```

service worker 本身只做三件事：

```text
监听事件 → 校验消息 → 调用 use case
```

---

## 4. 建议目标目录结构

当前不需要一次性大迁移，可以分两步。

### 4.1 第一阶段：温和重构版

适合现在立即执行：

```text
src/
  entrypoints/
    workspace/
      main.tsx
      WorkspaceApp.tsx
    popup/
      main.tsx
      PopupApp.tsx
    background/
      serviceWorker.ts
    content-scripts/
      quickSaveContent.tsx

  features/
    bookmarks/
    folders/
    metadata/
    search/
    settings/
    drag-drop/
    quick-save/
    popup-save/
    popup-manage/
    popup-settings/
    workspace/

  components/
    common/
    bookmark/
    folder/

  lib/
    chrome/
    url/
    time/
```

这个阶段的重点是：把入口文件和业务模块分开，不急着引入完整 DDD。

---

### 4.2 第二阶段：云端化准备版

当准备做账号、同步、订阅、Notion 集成时，建议演进为：

```text
src/
  entrypoints/
    workspace/
    popup/
    background/
    content-scripts/

  domain/
    bookmarks/
      Bookmark.ts
      Folder.ts
      Tag.ts
      BookmarkMetadata.ts
      BookmarkActivity.ts
    sync/
      SyncState.ts
      SyncEvent.ts
    billing/
      Plan.ts
      Entitlement.ts
    integrations/
      IntegrationAccount.ts
      ExternalMapping.ts

  application/
    bookmarks/
      createBookmark.ts
      updateBookmarkMetadata.ts
      moveBookmark.ts
      deleteBookmark.ts
    tags/
      assignTags.ts
      removeTags.ts
    sync/
      enqueueSyncEvent.ts
      resolveSyncConflict.ts
    integrations/
      exportToNotion.ts
      importFromNotion.ts

  infrastructure/
    browser/
      chrome/
    storage/
      localMetadataRepository.ts
      localSettingsRepository.ts
      localOutboxRepository.ts
    api/
      cloudApiClient.ts
      authClient.ts
    integrations/
      notionClient.ts

  ui/
    components/
    views/
      workspace/
      popup/
      table/
      settings/
```

这个结构的关键不是“看起来高级”，而是让未来替换存储、增加后端、增加 Notion 集成时，不必重写 UI。

---

## 5. 多维表格视角下的数据模型设计

你提出的“多维表格”判断非常重要。这个产品长期看不只是“书签树”，而是一个带属性、关系、视图和外部同步的数据表。

### 5.1 应把书签理解为一行数据

每个书签可以被理解为一条 `BookmarkRecord`：

```ts
type BookmarkRecord = {
  id: string;                       // 产品内部稳定 ID
  source: "browser" | "import" | "notion" | "cloud";
  browserBookmarkId?: string;        // chrome.bookmarks 的 ID
  cloudBookmarkId?: string;          // 云端 ID
  notionPageId?: string;             // Notion 映射 ID

  url: string;
  normalizedUrl: string;
  title: string;
  description?: string;
  note?: string;
  previewImageUrl?: string;
  faviconUrl?: string;

  folderId?: string;
  folderPath?: string[];
  tags: string[];

  createdAt: number;
  updatedAt: number;
  savedAt: number;
  lastOpenedAt?: number;
  lastModifiedAt?: number;
  lastSyncedAt?: number;

  archivedAt?: number;
  deletedAt?: number;

  syncStatus?: "local" | "pending" | "synced" | "conflict";
  version: number;
};
```

注意：这个 `id` 不应该直接等于 `chrome.bookmarks` 的 ID。Chrome 书签 ID 是某个浏览器 profile 下的本地 ID，长期跨设备、云端同步、Notion 映射都不应该依赖它。

建议新增一个内部 ID：

```text
Bookmark Visualizer Stable ID
```

并维护映射：

```ts
type BookmarkSourceMapping = {
  localId: string;
  source: "chrome" | "edge" | "notion" | "import";
  externalId: string;
  profileId?: string;
  createdAt: number;
  updatedAt: number;
};
```

---

### 5.2 书签表不应该单表硬塞所有关系

建议长期数据模型：

```text
bookmarks
folders
tags
bookmark_tags
bookmark_metadata
bookmark_activity
external_mappings
sync_events
```

对应关系：

```text
Folder 1 ── * Bookmark
Bookmark * ── * Tag
Bookmark 1 ── 1 Metadata
Bookmark 1 ── * Activity
Bookmark 1 ── * ExternalMapping
```

多维表格视图只是这些数据的展示方式，不应该反过来决定底层存储必须是一张超大表。

---

### 5.3 多维表格视图建议采用 ViewModel

管理页面里的多维表格不要直接读底层 storage。应该通过查询层生成：

```ts
type BookmarkTableRow = {
  id: string;
  title: string;
  url: string;
  folderPath: string;
  tags: string[];
  note: string;
  previewImageUrl?: string;
  savedAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
  source: string;
  syncStatus?: string;
};
```

数据流：

```text
chrome.bookmarks tree
+ local metadata
+ local activity
+ cloud metadata，可选
+ integration mapping，可选
      ↓
buildBookmarkTableRows()
      ↓
Table View / Kanban View / Gallery View / Folder View
```

这样未来增加视图不会污染底层数据模型。

---

## 6. 本地、云端、浏览器原生数据应该怎么分工

### 6.1 免费本地模式

```text
书签结构：chrome.bookmarks
备注：chrome.storage.local
预览图 URL：chrome.storage.local
UI 设置：chrome.storage.local 或 chrome.storage.sync
最近文件夹：chrome.storage.local
操作日志：chrome.storage.local，短期保留
```

适合当前阶段。

---

### 6.2 登录同步模式

```text
书签结构：仍优先 chrome.bookmarks
备注 / tags / 摘要 / 预览图：云端同步
多设备最近操作：可选云端同步
导入导出历史：云端可选
Notion 映射：云端保存
```

这里要注意：浏览器原生书签已经可能由 Chrome 自己同步。Bookmark Visualizer 不应轻易再同步一份“完整书签树”，否则会出现双同步冲突。

建议策略：

```text
阶段 1：云端只同步增强 metadata，不接管浏览器书签结构
阶段 2：提供云端备份，不自动覆盖浏览器书签
阶段 3：用户明确选择后，才支持跨浏览器恢复 / 合并
```

---

### 6.3 订阅制模式

订阅制不要写死在 UI 判断里，应该抽象成能力表：

```ts
type PlanCapability = {
  cloudSync: boolean;
  notionIntegration: boolean;
  aiSummary: boolean;
  unlimitedTags: boolean;
  advancedImportExport: boolean;
  historyRetentionDays: number;
};
```

客户端只问：

```ts
if (capabilities.notionIntegration) {
  // show feature
}
```

不要在各处写：

```ts
if (user.plan === "pro")
```

这样未来改套餐不会大面积改代码。

---

## 7. 最近操作时间应该放本地还是云端？

建议按隐私敏感度分级。

### 7.1 只放本地的数据

这些数据偏设备状态，不一定有跨设备价值：

```text
侧栏宽度
当前展开的文件夹
当前选中的 Tab
popup 是否自动关闭
最近一次本地打开的页面
临时 toast / session 状态
```

---

### 7.2 默认本地，可选择同步的数据

这些数据有价值，但也涉及用户行为习惯：

```text
最近保存文件夹
最近操作时间
最近打开时间
常用文件夹
排序偏好
```

建议做成设置项：

```text
同步我的最近操作记录：关闭 / 开启
```

默认可以先关闭，保护隐私，也降低云端复杂度。

---

### 7.3 适合云端同步的数据

这些是用户明确创建的知识资产：

```text
备注 note
tags
摘要 summary
自定义封面 / 预览图
Notion 映射
导入导出任务记录
```

这些数据很适合订阅制，因为它们是跨设备价值的来源。

---

## 8. 导入导出应该用什么数据格式？

建议分三层格式，而不是只选一个。

### 8.1 浏览器兼容格式：Netscape Bookmark HTML

用途：与 Chrome / Edge / Firefox 原生书签导入导出兼容。

优点：

- 浏览器支持广；
- 用户熟悉；
- 迁移成本低。

缺点：

- 不适合保存复杂 metadata；
- tags、备注、预览图、Notion 映射容易丢；
- 不适合作为产品内部完整备份格式。

建议定位：

```text
用于基础书签导入导出，不作为完整备份格式
```

---

### 8.2 产品完整备份格式：Versioned JSON

建议主格式使用 JSON：

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-05-05T00:00:00.000Z",
  "app": "Bookmark Visualizer",
  "folders": [],
  "bookmarks": [],
  "tags": [],
  "bookmarkTags": [],
  "metadata": [],
  "activity": [],
  "externalMappings": []
}
```

优点：

- 可表达层级；
- 可表达多对多关系；
- 可做 schema version migration；
- 适合云端备份；
- 适合 Notion / CSV / HTML 之间转换。

建议作为主备份格式。

---

### 8.3 表格交换格式：CSV

用途：用户想用 Excel / Google Sheets / Airtable / Notion 手工处理。

建议字段：

```csv
id,title,url,folderPath,tags,note,previewImageUrl,savedAt,updatedAt,lastOpenedAt,source
```

缺点：

- 不适合保存树结构；
- 不适合多对多关系；
- 不适合复杂 metadata；
- 不适合作为完整恢复格式。

建议定位：

```text
用于表格视图导出，不用于完整恢复
```

---

### 8.4 大数据量格式：NDJSON，可选

如果未来用户有几万条书签，可以考虑 NDJSON：

```jsonl
{"type":"folder","id":"f1","title":"AI"}
{"type":"bookmark","id":"b1","title":"OpenAI","url":"https://openai.com"}
{"type":"tag","id":"t1","name":"research"}
```

优点：适合流式导入导出，不需要一次性把全部 JSON 加载到内存。

当前阶段不必实现，但 schema 设计时可以预留。

---

## 9. Notion 集成应该怎么设计

Notion 数据库天然就是多维表格，因此 Bookmark Visualizer 的多维表格模型与 Notion 很容易映射。

### 9.1 Notion 数据库字段建议

```text
Name              → title
URL               → url
Folder            → rich_text 或 select
Tags              → multi_select
Note              → rich_text
Preview Image     → files 或 url
Saved At          → date
Updated At        → date
Source            → select
Bookmark ID       → rich_text
Sync Status       → select
```

### 9.2 必须保存外部映射

不能每次同步都靠 URL 匹配。URL 会变化，标题会变化，用户也可能有重复书签。

必须保存：

```ts
type ExternalMapping = {
  localBookmarkId: string;
  provider: "notion";
  externalDatabaseId: string;
  externalPageId: string;
  lastSyncedAt: number;
  lastExternalEditedAt?: number;
  syncDirection: "push" | "pull" | "two-way";
};
```

### 9.3 同步策略建议

第一阶段只做：

```text
Bookmark Visualizer → Notion 单向导出
```

第二阶段再做：

```text
Notion → Bookmark Visualizer 单向导入
```

第三阶段才考虑：

```text
双向同步 + 冲突解决
```

不要一开始就做双向同步。双向同步会立刻引入冲突、删除语义、字段映射、权限失效、Notion API 限流等问题。

---

## 10. 未来是否需要后端？

结论：**如果只是本地插件，不需要后端；如果要订阅制、云同步、Notion 连接、AI 摘要或跨设备能力，必须有后端。**

### 10.1 不需要后端的功能

```text
本地书签管理
本地备注
本地 tags
本地导入导出
本地多维表格视图
浏览器原生书签读写
```

这些都可以在扩展内完成。

---

### 10.2 强烈需要后端的功能

```text
账号系统
订阅制和支付状态校验
跨设备同步
Notion OAuth token 管理
AI 摘要生成
云端备份
多设备冲突解决
团队协作
用量限制与套餐能力控制
```

尤其是订阅制，不能只靠浏览器端判断。浏览器端代码可被用户查看、修改和绕过，所以付费权限必须由服务端签发和校验。

---

## 11. 云端服务层建议设计

长期结构建议：

```text
User Device Layer
  ├─ Browser Extension
  │   ├─ popup
  │   ├─ workspace
  │   ├─ content script
  │   └─ service worker
  ├─ Local Storage
  │   ├─ chrome.bookmarks
  │   ├─ chrome.storage.local
  │   └─ IndexedDB，可选
  └─ Local Outbox Queue

Cloud Service Layer
  ├─ Auth Service
  ├─ Billing / Entitlement Service
  ├─ Bookmark Metadata API
  ├─ Sync API
  ├─ Import / Export API
  ├─ Integration API
  │   └─ Notion Connector
  ├─ AI Enrichment API，可选
  ├─ PostgreSQL
  ├─ Object Storage
  └─ Job Queue
```

### 11.1 推荐后端职责

#### Auth Service

负责：

```text
用户登录
session / token
设备绑定
OAuth 回调
```

#### Billing / Entitlement Service

负责：

```text
Stripe customer
subscription 状态
套餐能力表
feature gate
用量限制
```

#### Sync API

负责：

```text
metadata 同步
tags 同步
activity 同步，可选
冲突检测
版本号管理
```

#### Integration API

负责：

```text
Notion OAuth token 保存
Notion database schema 检查
Notion page 创建 / 更新
外部 ID 映射
限流与重试
```

#### AI Enrichment API

负责：

```text
网页摘要
标签推荐
重复书签检测
内容分类
```

注意：AI 和 Notion token 不建议全部放在扩展端处理。扩展端可以触发任务，但长期应由后端执行和管理敏感凭证。

---

## 12. 前后端分离怎么理解

未来应该是前后端分离，但不是传统意义上“一个网站前端 + 一个网站后端”那么简单。

更准确是：

```text
多个客户端 + 一个云端 API
```

客户端包括：

```text
Chrome Extension
Edge Extension
Firefox Extension，可选
Web Dashboard，可选
```

云端 API 提供：

```text
用户身份
订阅状态
云端 metadata
tags
Notion 集成
AI 任务
导入导出任务
```

当前代码应提前做的准备：

1. 不让 UI 直接调用 Chrome API；
2. 不让业务逻辑依赖 `chrome.bookmarks` ID；
3. 不把付费能力写死在页面组件里；
4. 不把 Notion、Stripe、AI 逻辑塞进扩展 UI；
5. 所有数据写入走 repository / use case。

---

## 13. 当前阶段不建议过早做的事情

### 13.1 不建议现在重写成完整 DDD

当前项目还小，不需要一口气做复杂领域驱动设计。建议渐进式重构。

### 13.2 不建议现在自建完整书签数据库替代 chrome.bookmarks

这会让你们过早承担同步、删除、导入、恢复、冲突解决等复杂问题。

### 13.3 不建议现在做双向 Notion 同步

第一版只做单向导出更稳。

### 13.4 不建议现在做微服务

后端如果启动，第一版用模块化单体即可：

```text
一个 API 服务
一个数据库
一个后台任务队列
```

不要一开始拆成很多服务。

---

## 14. 近期可执行的架构任务清单

### 阶段 A：代码结构收口，不改功能

1. 修 P0 文档；
2. 修测试脚本；
3. 修 metadata 清空语义；
4. 手动验收 popup 主流程；
5. 拆 `App.tsx`；
6. 拆 `popup/main.tsx`；
7. 拆 `quick-save/content.tsx`；
8. 拆 `service-worker.ts` handler；
9. 建立 `entrypoints/` 目录；
10. 建立初步 `application/` use case 层。

完成后，功能不变，但代码可维护性明显提高。

---

### 阶段 B：数据模型收口

1. 新增内部稳定 ID；
2. 定义 `BookmarkRecord`；
3. 定义 `FolderRecord`；
4. 定义 `TagRecord`；
5. 定义 `ExternalMapping`；
6. 定义 `BookmarkActivity`；
7. 定义 versioned export schema；
8. metadata storage 增加 migration 机制。

完成后，多维表格、导入导出、Notion 映射才有稳定基础。

---

### 阶段 C：云端化预留接口

1. 增加 `CloudApiClient` 空实现；
2. 增加 `AuthState` 类型；
3. 增加 `PlanCapability` 类型；
4. 增加 `SyncStatus` 类型；
5. 增加 local outbox 数据结构；
6. 所有写操作先可记录为 operation event。

当前不需要真的接后端，但接口要先稳定。

---

## 15. 推荐的长期技术策略

### 15.1 Local-first，Cloud-enhanced

产品定位建议是：

```text
本地优先，云端增强
```

即：

- 没有账号也能管理书签；
- 登录后增强跨设备 metadata 同步；
- 订阅后解锁 Notion、AI、云备份、高级导入导出；
- 用户始终可以导出自己的数据。

这比“强制登录才能用”更适合浏览器书签工具。

---

### 15.2 浏览器书签结构与产品 metadata 分离

长期坚持：

```text
浏览器负责书签树
Bookmark Visualizer 负责增强属性
```

增强属性包括：

```text
note
tags
summary
previewImageUrl
lastUsedAt
customStatus
notionPageId
syncStatus
```

---

### 15.3 付费能力围绕增强属性设计

更自然的订阅制边界：

免费：

```text
本地书签管理
本地备注
基础搜索
基础导入导出
```

付费：

```text
云端同步
多设备 tags / notes
Notion 集成
AI 摘要
高级多维表格视图
批量整理
重复检测
云端备份与恢复
```

这样不会破坏用户对“我的浏览器书签应该属于我”的信任。

---

## 16. 结论

当前项目不是特别混乱，但已经到了必须做结构治理的时间点。

最重要的架构方向是：

```text
1. 保留 chrome.bookmarks 作为本地书签事实来源
2. 把增强数据抽象为 BookmarkRecord / Metadata / Tags / Activity
3. 把 popup、workspace、content script、service worker 分成独立入口
4. 把业务写操作沉到 application use case
5. 把 Chrome API、云端 API、Notion API 都放进 infrastructure adapter
6. 用 versioned JSON 作为完整导入导出格式
7. 用 PlanCapability 为订阅制预留能力边界
8. 未来采用 local-first + cloud-enhanced，而不是一开始强制云端化
```

执行优先级：

```text
先修 P0 → 拆大文件 → 抽 entrypoints/application/domain → 定数据模型 → 再考虑云端与订阅制
```

这条路线可以最大限度保护当前已有功能，同时为未来商业化、云同步、多维表格和 Notion 集成留下足够空间。

---

## 17. 参考资料

- Chrome Extensions Manifest V3 文档：https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3
- Chrome Extension Service Worker 生命周期：https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle
- Chrome Extensions Message Passing：https://developer.chrome.com/docs/extensions/develop/concepts/messaging
- Chrome Storage API：https://developer.chrome.com/docs/extensions/reference/api/storage
- Chrome Extension Security Best Practices：https://developer.chrome.com/docs/extensions/develop/security-privacy/stay-secure
- Chrome Remote Hosted Code 说明：https://developer.chrome.com/docs/extensions/develop/migrate/remote-hosted-code
- Plasmo Browser Extension Framework：https://github.com/PlasmoHQ/plasmo
- Bitwarden Manifest V3 迁移说明：https://bitwarden.com/blog/bitwarden-manifest-v3/
- Notion Database API：https://developers.notion.com/reference/database
- Notion Data Source Properties：https://developers.notion.com/reference/property-object
- Stripe Subscriptions API：https://docs.stripe.com/api/subscriptions
- Chrome Web Store Payments Deprecation：https://github.com/GoogleChrome/developer.chrome.com/blob/main/site/en/docs/webstore/cws-payments-deprecation/index.md
