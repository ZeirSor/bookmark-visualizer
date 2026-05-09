# Bookmark Visualizer 架构分层分析说明（not current implementation）

> 文档性质：分析说明  
> 适用对象：产品负责人、前端工程师、后端工程师、架构负责人  
> 当前阶段：Chrome / Edge 扩展本地 MVP 后期  
> 核心结论：当前项目不是“特别混乱”，但已经从功能验证期进入架构治理期；继续叠功能前，应先稳定分层边界。

---

## 1. 项目当前定位

Bookmark Visualizer 当前本质上是一个 **浏览器书签增强型客户端**，不是一个完整的云端书签 SaaS。

当前系统的事实来源主要分成两类：

```text
浏览器原生书签 chrome.bookmarks
  → 文件夹层级
  → 书签标题
  → 书签 URL
  → 基础排序

扩展本地存储 chrome.storage.local
  → 备注
  → 预览图
  → UI 偏好
  → 最近使用文件夹
  → 操作辅助状态
```

这说明当前架构采用的是：

```text
Browser-native first
Local metadata enhanced
```

也就是：

```text
原生书签系统为主 → 扩展补充更强的管理体验
```

这个方向是健康的。它避免了早期就自建完整书签数据库，也避免了用户数据被插件锁死。

---

## 2. 当前整体架构分层

从代码结构看，当前项目可以抽象成 5 层。

```text
┌──────────────────────────────┐
│ UI Entry Layer               │
│ index.html / save.html / popup.html fallback │
│ React App / Popup App        │
└───────────────┬──────────────┘
                ↓
┌──────────────────────────────┐
│ Feature Layer                │
│ bookmarks / popup / metadata │
│ drag-drop / settings / search│
└───────────────┬──────────────┘
                ↓
┌──────────────────────────────┐
│ Domain Logic Layer           │
│ tree utils / validation      │
│ move rules / metadata rules  │
└───────────────┬──────────────┘
                ↓
┌──────────────────────────────┐
│ Platform Adapter Layer       │
│ lib/chrome                   │
│ bookmarksAdapter / storage   │
└───────────────┬──────────────┘
                ↓
┌──────────────────────────────┐
│ Browser Platform Layer       │
│ chrome.bookmarks             │
│ chrome.storage               │
│ chrome.runtime               │
└──────────────────────────────┘
```

其中比较值得保留的是：

1. `src/lib/chrome/` 作为 Chrome API 适配层。
2. `src/features/` 按功能模块拆分。
3. 使用浏览器原生书签作为基础数据源。
4. popup、管理页、service worker 分别作为不同入口。
5. 当前没有过度申请 host permissions，权限边界较克制。

这些设计都符合长期扩展的方向。

---

## 3. 当前结构是否混乱？

结论：**不是特别混乱，但已经出现明显的复杂度集中。**

更准确地说，项目不是“目录乱”，而是“职责集中”。

当前问题不是：

```text
文件夹命名混乱
模块完全没有边界
代码无法理解
```

而是：

```text
入口组件承担了过多业务状态
UI 与业务动作耦合偏重
未来云端化所需的数据模型边界尚未独立
popup / quick-save / workspace 三套入口有重复趋势
```

这属于 MVP 后期常见问题：功能逐渐完成，但早期为了快速验证，把状态、UI、操作逻辑集中在少数大文件中。

---

## 4. 当前最明显的架构压力点

### 4.1 `src/app/App.tsx` 过重

`App.tsx` 当前承担了完整工作台的大量职责：

```text
布局
文件夹选择
书签搜索
拖拽状态
右键菜单
移动逻辑
新建书签
新建文件夹
删除与撤销
toast
设置弹窗
操作日志
```

这会带来三个长期问题：

1. 新功能很容易继续塞进 `App.tsx`。
2. 单个交互修改会影响大量无关逻辑。
3. 组件测试和业务逻辑测试都变困难。

因此它是当前第一优先级的拆分对象。

### 4.2 `src/popup/main.tsx` 有膨胀趋势

popup 目前已经包含：

```text
Tab 切换
当前页面读取
标题 / URL 展示
预览图候选
备注
文件夹搜索
最近文件夹
新建文件夹
保存动作
管理 Tab
设置 Tab
```

保存页已经具备完整业务复杂度。随着“管理 / 设置”两个 Tab 完善，`main.tsx` 很快会变成第二个大组件。

popup 应被视为一个独立小应用，而不是简单入口文件。

### 4.3 `src/features/quick-save/content.tsx` 与 popup 存在能力重叠

quick-save 曾经是快捷键保存路线的一部分，现在主路径已经转向独立 `save.html` 保存小窗口。

当前需要判断：

```text
quick-save 是长期保留的独立能力？
还是历史路线残留，只保留最小入口？
```

如果保留，就要明确它和 popup 的关系：

```text
popup：主保存入口
quick-save：键盘快速入口 / 轻量模式
shared save domain：共用保存业务逻辑
```

否则后续会出现两套保存逻辑分别演化的问题。

### 4.4 service worker 不应承载复杂业务

Manifest V3 的 background service worker 不是常驻后端。它更适合做：

```text
事件监听
命令响应
runtime message 路由
打开页面
调用受限 Chrome API
```

不适合做：

```text
长期业务状态管理
复杂数据同步
大规模缓存
订阅判断
云端同步队列核心逻辑
```

未来如果做云端同步和订阅制，service worker 只能作为客户端事件代理，而不能当成后端。

---

## 5. 推荐的长期目标分层

建议把项目逐步演进为以下结构：

```text
src/
  app/
    workspace/
      WorkspaceApp.tsx
      WorkspaceLayout.tsx
      WorkspaceToolbar.tsx
      WorkspaceProviders.tsx

  popup/
    PopupApp.tsx
    components/
    tabs/
      SaveTab.tsx
      ManageTab.tsx
      SettingsTab.tsx

  background/
    serviceWorker.ts
    messageRouter.ts
    commandHandlers.ts
    contextMenuHandlers.ts

  features/
    bookmarks/
    folders/
    metadata/
    tags/
    import-export/
    notion/
    billing/
    sync/
    settings/

  domain/
    bookmark-record/
    folder-tree/
    metadata-schema/
    tag-schema/
    sync-schema/

  infrastructure/
    chrome/
    local-storage/
    remote-api/
    notion-api/

  shared/
    types/
    utils/
    constants/
```

这里的重点不是马上创建所有目录，而是形成清晰边界：

```text
UI 只管展示和交互
Feature 负责编排业务动作
Domain 负责纯业务规则
Infrastructure 负责外部系统访问
```

---

## 6. 从多维表格视角重新理解业务

用户提到“书签可以理解为多维表格的一行”，这是非常重要的产品抽象。

未来每个书签可以视为一个 `BookmarkRecord`：

```text
BookmarkRecord
  id
  browserBookmarkId
  title
  url
  folderId
  note
  previewImageUrl
  description
  tags
  createdAt
  updatedAt
  lastVisitedAt
  lastOperatedAt
  source
  syncStatus
  notionPageId
```

这相当于一张多维表：

| 字段 | 含义 | 当前来源 | 未来来源 |
|---|---|---|---|
| title | 标题 | chrome.bookmarks | 浏览器 / 云端 |
| url | 链接 | chrome.bookmarks | 浏览器 / 云端 |
| folderId | 文件夹 | chrome.bookmarks | 浏览器 / 云端 |
| note | 备注 | chrome.storage.local | 本地 / 云端 |
| previewImageUrl | 预览图 | chrome.storage.local | 本地 / 云端 |
| tags | 标签 | 暂无 | 本地 / 云端 |
| lastOperatedAt | 最近操作时间 | 暂无 | 本地优先，云端同步 |
| notionPageId | Notion 映射 | 暂无 | 云端 / 本地映射 |

因此，长期架构中不应该只围绕 `chrome.bookmarks.BookmarkTreeNode` 设计所有业务。应该增加一层自己的领域模型：

```text
Browser BookmarkTreeNode
  ↓ normalize
BookmarkRecord
  ↓ render
Card View / Table View / Notion Export / JSON Export
```

这个模型是未来支持多维表格视图、导入导出、Notion 连接、云同步的基础。

---

## 7. 哪些维持现状即可

### 7.1 继续使用浏览器原生书签作为基础数据源

在当前阶段，不建议立刻自建完整书签数据库替代 `chrome.bookmarks`。

原因：

1. 用户已有书签天然在浏览器里。
2. 浏览器自带同步能力。
3. 插件删除或停用后，用户仍能保留书签。
4. 早期自建数据库会极大增加同步、冲突、迁移复杂度。

推荐策略：

```text
短期：chrome.bookmarks 是基础事实源
中期：BookmarkRecord 是业务展示源
长期：云端保存增强元数据与跨端能力
```

### 7.2 继续保持低权限策略

当前没有过度申请站点权限，这是好事。

长期也应遵循：

```text
默认低权限
需要网页内容时再请求 activeTab 或可选权限
云端功能独立授权
Notion 功能独立授权
```

这样更利于 Chrome Web Store 审核，也更利于用户信任。

### 7.3 `lib/chrome` 适配层值得保留

所有 Chrome API 调用都应继续集中，不建议在 UI 组件中直接散落调用：

```ts
chrome.bookmarks.create(...)
chrome.storage.local.set(...)
chrome.runtime.sendMessage(...)
```

推荐保持：

```text
UI → feature action → adapter → chrome API
```

---

## 8. 哪些必须改进

### 8.1 建立领域模型层

当前代码更多围绕浏览器 API 类型展开，未来要增加自己的稳定模型：

```text
BookmarkRecord
FolderRecord
TagRecord
BookmarkMetadata
BookmarkActivity
ExternalMapping
```

这可以避免所有功能都绑定在 Chrome 的数据结构上。

### 8.2 建立导入导出模块

导入导出不应散落在 UI 页面里。

建议单独模块：

```text
features/import-export/
  exportJson.ts
  importJson.ts
  exportCsv.ts
  exportNetscapeHtml.ts
  importNetscapeHtml.ts
  schema.ts
```

### 8.3 建立同步抽象层

即使短期不做云端，也可以提前定义接口：

```ts
interface SyncProvider {
  pull(): Promise<SyncSnapshot>;
  push(changes: LocalChange[]): Promise<SyncResult>;
}
```

短期可以只有：

```text
LocalOnlySyncProvider
```

未来再扩展：

```text
CloudSyncProvider
NotionSyncProvider
```

### 8.4 建立外部映射表

Notion、云端、浏览器书签之间不应互相污染 ID。

推荐抽象：

```text
ExternalMapping
  localRecordId
  provider: notion | cloud | browser
  externalId
  lastSyncedAt
  syncStatus
```

这样未来可以支持：

```text
一个本地书签 ↔ 一个 Notion page
一个本地书签 ↔ 一个云端 bookmark record
一个浏览器 bookmarkId ↔ 一个本地 recordId
```

---

## 9. 云端化前需要提前考虑的边界

未来如果做订阅制和云同步，Chrome 插件代码只应是客户端之一。

长期系统应是：

```text
Chrome Extension Client
  ↓
Backend API
  ↓
Database / Billing / Notion Integration / AI Services
```

而不是：

```text
Chrome Extension 直接承担全部业务
```

建议提前划分：

| 能力 | 当前阶段 | 未来阶段 |
|---|---|---|
| 书签读取 | 扩展端 | 扩展端 |
| 本地管理 | 扩展端 | 扩展端 |
| 备注 | 本地 | 本地 + 云端同步 |
| Tags | 本地 | 本地 + 云端同步 |
| 订阅判断 | 暂无 | 后端 |
| 支付 | 暂无 | 后端 + 支付平台 |
| Notion token | 暂无 | 后端加密保存，或本地安全保存 |
| AI 摘要 | 暂无 | 后端更合适 |
| 多设备同步 | 暂无 | 后端 |

核心原则：

```text
扩展端负责浏览器上下文
后端负责账号、订阅、同步、第三方密钥、重计算任务
```

---

## 10. 总体判断

当前项目结构的真实状态可以概括为：

```text
目录结构基本健康
模块边界初步存在
入口组件复杂度过高
领域模型尚未独立
未来云端化边界尚未提前铺好
```

因此不建议大重写，也不建议继续无边界加功能。

最合理路线是：

```text
第一阶段：本地架构收口，拆大组件，修 P0
第二阶段：建立 BookmarkRecord 多维表格数据模型与导入导出基础
第三阶段：建立云端 API、账号订阅、同步与 Notion 集成边界
```

这是一条渐进式演进路线，既保留当前 MVP 成果，也为未来 SaaS 化留出空间。
