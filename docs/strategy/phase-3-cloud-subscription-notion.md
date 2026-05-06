# Bookmark Visualizer 第三阶段改动指南：云端化、订阅制与 Notion 集成架构

> 文档性质：执行指南  
> 阶段目标：在本地数据模型稳定后，设计并接入云端服务边界，为订阅制、跨设备同步、Notion 集成和高级能力做准备  
> 前置条件：第一阶段完成架构收口，第二阶段完成 BookmarkRecord 与导入导出基础  
> 关键原则：Chrome 插件只是客户端之一，不能承担后端职责

---

## 1. 第三阶段核心判断

如果未来要做订阅制，当前 Chrome 插件代码不能继续被视为完整产品的全部。

它应该成为：

```text
Bookmark Visualizer Client for Chrome / Edge
```

而完整系统应演进为：

```text
Chrome Extension Client
  ↓
Backend API
  ↓
Database / Auth / Billing / Sync / Notion / AI Services
```

也就是说，后期大概率需要后端。

原因包括：

```text
订阅状态不能只靠前端判断
支付 webhook 需要服务端接收
Notion OAuth token 不适合随意暴露
跨设备同步需要云端数据库
AI 摘要和网页解析更适合后端统一执行
用户账号、配额、风控都需要服务端
```

---

## 2. 推荐总体架构

```text
┌────────────────────────────────────┐
│ User Devices                        │
│ Chrome Extension / Edge Extension   │
│ Future Web App / Desktop App        │
└─────────────────┬──────────────────┘
                  ↓ HTTPS
┌────────────────────────────────────┐
│ Backend API                         │
│ Auth / Billing / Sync / Notion      │
│ Import Export / AI Jobs             │
└─────────────────┬──────────────────┘
                  ↓
┌────────────────────────────────────┐
│ Data Layer                          │
│ Users / Bookmarks / Tags / Metadata │
│ Activities / ExternalMappings       │
└─────────────────┬──────────────────┘
                  ↓
┌────────────────────────────────────┐
│ External Services                   │
│ Stripe / Notion / AI Provider       │
└────────────────────────────────────┘
```

扩展端继续负责：

```text
读取浏览器书签
展示 popup 和管理页
调用 chrome.bookmarks 修改本地浏览器书签
维护离线可用体验
发起同步请求
```

后端负责：

```text
账号
订阅
云端书签增强数据
跨设备同步
Notion token 与 API 调用
AI 摘要任务
导入导出任务
权限与配额
```

---

## 3. 前后端是否需要分离？

结论：**需要，但不一定从第一天就重型分离。**

推荐演进方式：

```text
阶段 3A：先建立 Backend API 最小闭环
阶段 3B：接入账号与云端同步
阶段 3C：接入订阅与权限
阶段 3D：接入 Notion
阶段 3E：接入 AI 摘要等高级功能
```

不要一开始就把后端做成庞大平台。

最小后端闭环可以只有：

```text
用户登录
获取当前用户
上传 bookmark records
拉取 bookmark records
查询订阅状态
```

---

## 4. 推荐后端模块

```text
backend/
  modules/
    auth/
    users/
    bookmarks/
    folders/
    tags/
    metadata/
    sync/
    billing/
    notion/
    import-export/
    ai-summary/
  shared/
    database/
    logger/
    config/
    errors/
    authGuard/
```

如果使用 Node.js，可以考虑：

```text
Fastify / NestJS / Hono / Express
```

如果追求快速上线，也可以考虑：

```text
Supabase / Firebase / Cloudflare Workers + D1 / serverless API
```

技术选型不是本文件重点。重点是：

```text
账号、订阅、同步、Notion、AI 这些职责必须在服务端有明确边界
```

---

## 5. 云端数据库模型建议

### 5.1 users

```text
users
  id
  email
  display_name
  created_at
  updated_at
```

### 5.2 bookmarks

```text
bookmarks
  id
  user_id
  title
  url
  folder_id
  note
  description
  preview_image_url
  source
  created_at
  updated_at
  deleted_at
```

### 5.3 folders

```text
folders
  id
  user_id
  title
  parent_id
  sort_order
  created_at
  updated_at
  deleted_at
```

### 5.4 tags

```text
tags
  id
  user_id
  name
  color
  created_at
  updated_at
```

### 5.5 bookmark_tags

```text
bookmark_tags
  bookmark_id
  tag_id
  created_at
```

### 5.6 activities

```text
activities
  id
  user_id
  bookmark_id
  type
  payload
  created_at
```

### 5.7 external_mappings

```text
external_mappings
  id
  user_id
  local_id
  provider
  external_id
  external_url
  sync_status
  last_synced_at
  created_at
  updated_at
```

### 5.8 subscriptions

```text
subscriptions
  id
  user_id
  provider
  provider_customer_id
  provider_subscription_id
  plan
  status
  current_period_end
  created_at
  updated_at
```

---

## 6. 本地与云端的关系

推荐采用：

```text
Local-first, Cloud-enhanced
```

也就是：

```text
本地没有网络也能管理书签
登录后云端增强同步、备份、Notion、高级能力
```

不要把产品做成：

```text
没有云端就完全不能用
```

否则会破坏浏览器书签扩展的天然优势。

---

## 7. 同步策略设计

### 7.1 同步对象

不要直接同步 Chrome BookmarkTreeNode。

应同步第二阶段建立的：

```text
BookmarkRecord
FolderRecord
TagRecord
BookmarkActivity
ExternalMapping
```

Chrome 书签只是本机映射之一。

### 7.2 同步方向

推荐先做单向或弱双向：

```text
本地 → 云端备份
云端 → 本地恢复
```

暂时避免复杂实时双向同步。

长期再做：

```text
多设备双向同步
冲突检测
冲突解决
```

### 7.3 ChangeLog 模型

本地可以记录变更：

```ts
export type LocalChange = {
  id: string;
  entityType: 'bookmark' | 'folder' | 'tag' | 'metadata';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload: unknown;
  createdAt: string;
  syncStatus: 'pending' | 'synced' | 'failed';
};
```

同步流程：

```text
本地操作
  ↓
写入本地状态
  ↓
记录 LocalChange
  ↓
有网络时 push 到云端
  ↓
云端返回确认
  ↓
本地标记 synced
```

---

## 8. 冲突处理策略

早期不要过度设计 CRDT。

推荐先使用简单规则：

```text
同一字段：updatedAt 较新的优先
不同字段：尽量合并
删除冲突：保留 tombstone，给用户恢复机会
```

例如：

```text
设备 A 修改 note
设备 B 添加 tag
→ 可以合并

设备 A 删除书签
设备 B 修改标题
→ 标记 conflict，用户确认
```

最低要求：

```text
不要静默覆盖用户数据
不要无提示删除云端或本地数据
```

---

## 9. 订阅制架构

### 9.1 订阅不应由扩展端单独判断

扩展端可以缓存订阅状态，但不能作为最终依据。

正确方式：

```text
扩展端请求 /me/subscription
后端返回当前 plan 和权限
扩展端根据权限展示功能入口
```

### 9.2 功能权限建议

可以设计：

```text
Free
  本地书签管理
  本地备注
  基础导入导出

Pro
  云端同步
  多设备备份
  Notion 导出
  高级表格视图
  批量操作

Premium / Team
  AI 摘要
  自动打标
  团队共享
  高级集成
```

实际定价以后再定，但架构上要支持：

```text
feature flags
plan limits
quota usage
```

### 9.3 后端订阅字段

```ts
export type SubscriptionEntitlement = {
  plan: 'free' | 'pro' | 'premium' | 'team';
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';
  features: string[];
  limits: {
    cloudBookmarks: number;
    notionConnections: number;
    aiSummariesPerMonth: number;
  };
};
```

---

## 10. Notion 集成策略

### 10.1 不要一开始做双向同步

Notion 集成建议分三步：

```text
第一步：单向导出到 Notion
第二步：从 Notion 导入
第三步：可选双向同步
```

双向同步最复杂，因为涉及：

```text
字段映射
删除语义
冲突处理
Notion database schema 变化
速率限制
用户手动修改 Notion 内容
```

### 10.2 Notion 数据模型映射

BookmarkRecord 可以映射为 Notion database 中的一行 page：

| Bookmark 字段 | Notion 属性类型 |
|---|---|
| title | Title |
| url | URL |
| note | Rich Text |
| tags | Multi-select |
| folderPath | Select / Rich Text |
| previewImageUrl | URL / Files |
| createdAt | Date |
| updatedAt | Date |

建议用户选择或创建一个 Notion database。

系统保存映射：

```text
local BookmarkRecord.id
  ↔ Notion page id
```

### 10.3 Notion token 保存位置

更稳妥的方式：

```text
后端保存 Notion access token
扩展端不直接长期保存 token
```

如果早期为了快速验证只在本地保存，也要作为临时方案，不应成为长期架构。

原因：

```text
token 泄漏风险
多设备连接困难
订阅权限难控制
撤销授权和刷新逻辑更难统一
```

---

## 11. API 设计建议

### 11.1 Auth

```text
POST /auth/login
POST /auth/logout
GET  /me
GET  /me/subscription
```

### 11.2 Bookmark Sync

```text
GET  /sync/snapshot
POST /sync/push
POST /sync/pull
POST /sync/resolve-conflict
```

### 11.3 Bookmarks

```text
GET    /bookmarks
POST   /bookmarks
PATCH  /bookmarks/:id
DELETE /bookmarks/:id
```

### 11.4 Tags

```text
GET    /tags
POST   /tags
PATCH  /tags/:id
DELETE /tags/:id
```

### 11.5 Import / Export

```text
POST /import/preview
POST /import/execute
GET  /export/json
GET  /export/csv
GET  /export/html
```

### 11.6 Notion

```text
POST /integrations/notion/connect
GET  /integrations/notion/databases
POST /integrations/notion/export
POST /integrations/notion/import-preview
POST /integrations/notion/sync
```

---

## 12. 扩展端需要增加的模块

第三阶段扩展端建议增加：

```text
src/infrastructure/remote-api/
  httpClient.ts
  authApi.ts
  syncApi.ts
  billingApi.ts
  notionApi.ts

src/features/auth/
  useAuthState.ts
  login.ts
  logout.ts

src/features/sync/
  syncProvider.ts
  localChangeLog.ts
  cloudSyncProvider.ts
  conflictDetection.ts

src/features/billing/
  useEntitlements.ts
  featureGate.ts

src/features/notion/
  notionExport.ts
  notionImportPreview.ts
  notionMapping.ts
```

但要注意：

```text
扩展端 notionApi.ts 只调用自己的后端
不要直接在扩展端到处调用 Notion API
```

---

## 13. 安全边界

第三阶段必须注意：

```text
不要把支付密钥放在扩展端
不要把服务端私钥放在扩展端
不要让扩展端自行判断付费权限
不要在前端硬编码 Notion client secret
不要从远程加载可执行代码
```

扩展端可以保存：

```text
短期 access token
用户偏好
本地缓存
待同步变更
```

后端保存：

```text
支付密钥
webhook secret
Notion OAuth secret
用户订阅状态
云端数据库
AI provider key
```

---

## 14. 付费功能的技术执行策略

推荐使用 feature gate：

```ts
function canUseFeature(entitlements: SubscriptionEntitlement, feature: string) {
  return entitlements.features.includes(feature);
}
```

扩展端 UI 根据权限展示：

```text
可用 → 正常入口
不可用 → 显示升级提示
未登录 → 引导登录
订阅过期 → 降级但保留本地数据
```

重要原则：

```text
用户降级后，不应删除用户已有数据
只限制高级功能继续使用
```

例如：

```text
云端同步停用，但本地书签仍可访问
Notion 自动同步停用，但已导出的 Notion 页面不删除
AI 摘要额度用完，但已有摘要保留
```

---

## 15. 第三阶段实施顺序

推荐顺序：

```text
1. 定义远程 API client 接口，但先使用 mock server
2. 建立用户登录状态模型
3. 建立 entitlements 权限模型
4. 建立 local change log
5. 建立 cloud sync provider 接口
6. 后端实现最小用户与同步 API
7. 扩展端接入登录和同步快照
8. 后端接入订阅状态
9. 扩展端接入 feature gate
10. 实现 Notion 单向导出
11. 实现 Notion 导入预览
12. 最后再考虑双向同步
```

不要跳过 mock 阶段。先把扩展端边界跑通，再接真实后端。

---

## 16. 第三阶段不建议做的事情

不建议：

```text
一开始就做复杂实时双向同步
一开始就做团队协作
一开始就做完整 Notion 双向同步
一开始就做 AI 自动分类闭环
一开始就把所有本地数据迁移到云端并强制登录
```

原因：

```text
会破坏当前本地可用优势
同步冲突复杂度会迅速上升
订阅和数据安全风险增大
开发周期不可控
```

---

## 17. 第三阶段完成标准

第三阶段完成后，应满足：

```text
Chrome 扩展仍可离线使用
用户可以登录
扩展端可以获取订阅权限
扩展端存在明确 remote-api 层
后端有最小 bookmarks / sync API
本地 BookmarkRecord 可上传云端
云端数据可恢复到本地
订阅状态由后端返回
Notion 至少支持单向导出
Notion 映射通过 ExternalMapping 管理
支付密钥、Notion secret、AI key 不出现在扩展端
```

完成这些后，Bookmark Visualizer 才真正从“本地扩展工具”进入“可 SaaS 化产品”的基础阶段。
