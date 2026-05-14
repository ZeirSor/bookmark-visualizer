---
type: archive
status: archived
scope: archive
owner: project
last_verified: 2026-05-14
source_of_truth: false
archived_reason: "superseded, historical, or temporary content"
archived_from: "docs/data/phase-2-data-model-import-export.md"
current_source: "docs/README.md"
---

# Bookmark Visualizer 第二阶段改动指南：多维表格数据模型与导入导出基础

> 文档性质：执行指南  
> 阶段目标：在本地架构稳定后，建立面向长期扩展的数据模型，为多维表格视图、Tags、导入导出、Notion 映射和云同步打基础  
> 前置条件：第一阶段 P0 与代码拆分基本完成  
> 禁止事项：本阶段仍不直接做订阅制，不强依赖云端服务

---

## 1. 第二阶段核心目标

第二阶段要完成一次关键抽象：

```text
不要只把书签看成 chrome.bookmarks.BookmarkTreeNode
而要把它抽象成一个可扩展的 BookmarkRecord
```

也就是从浏览器书签树视角，升级到多维表格视角。

```text
浏览器书签树
  ↓ normalize
BookmarkRecord 多维记录
  ↓ render
卡片视图 / 表格视图 / 导出 / Notion 映射 / 云同步
```

本阶段不一定要完成完整多维表格 UI，但必须先完成数据层基础。

---

## 2. 为什么需要 BookmarkRecord

当前书签主要来自 Chrome API：

```text
id
title
url
parentId
index
dateAdded
```

但未来业务会增加：

```text
备注
预览图
摘要
Tags
评分
收藏状态
最近操作时间
最近访问时间
Notion pageId
云端 syncId
导入来源
同步状态
```

这些字段不属于浏览器原生书签模型。

如果继续把所有业务都绑定在 `BookmarkTreeNode` 上，后续会出现：

```text
每加一个属性都要到处补字段
导入导出无法统一
表格视图难以实现
Notion 映射逻辑混乱
云同步时 ID 对不上
```

所以需要建立自己的稳定领域模型。

---

## 3. 推荐领域模型

### 3.1 BookmarkRecord

```ts
export type BookmarkRecord = {
  id: string;

  browserBookmarkId?: string;
  cloudBookmarkId?: string;

  type: 'bookmark';

  title: string;
  url: string;
  folderId?: string;

  note?: string;
  description?: string;
  previewImageUrl?: string;

  tagIds: string[];

  dateAdded?: string;
  createdAt: string;
  updatedAt: string;
  lastOperatedAt?: string;
  lastVisitedAt?: string;

  source: 'browser' | 'import' | 'manual' | 'notion' | 'cloud';

  syncStatus?: 'local-only' | 'synced' | 'pending' | 'conflict';
};
```

说明：

```text
id                本地业务 ID
browserBookmarkId Chrome 原生书签 ID
cloudBookmarkId   未来云端 ID
tagIds            关联标签
source            记录来源
syncStatus         未来同步状态
```

本阶段即使不用云端，也可以预留字段，但不要让业务强依赖云端。

---

### 3.2 FolderRecord

```ts
export type FolderRecord = {
  id: string;
  browserBookmarkId?: string;
  cloudFolderId?: string;

  title: string;
  parentId?: string;
  index?: number;

  createdAt: string;
  updatedAt: string;

  source: 'browser' | 'import' | 'manual' | 'cloud';
};
```

当前 folder 仍主要来自 `chrome.bookmarks`。这层模型的作用是让 UI 不直接依赖 Chrome 类型。

---

### 3.3 TagRecord

```ts
export type TagRecord = {
  id: string;
  name: string;
  color?: string;
  description?: string;

  createdAt: string;
  updatedAt: string;
};
```

标签和文件夹不同：

```text
文件夹是树状结构，一个书签通常在一个文件夹中
Tag 是多对多结构，一个书签可以有多个 Tag
```

因此不要把 Tag 伪装成文件夹。

---

### 3.4 BookmarkActivity

```ts
export type BookmarkActivity = {
  id: string;
  bookmarkId: string;
  type:
    | 'created'
    | 'updated'
    | 'moved'
    | 'tagged'
    | 'untagged'
    | 'exported'
    | 'imported'
    | 'synced';

  createdAt: string;
  payload?: Record<string, unknown>;
};
```

最近操作时间可以由 activity 派生，也可以在 BookmarkRecord 上冗余保存：

```text
activity 表：记录完整操作历史
BookmarkRecord.lastOperatedAt：用于快速排序
```

建议本地先保留 `lastOperatedAt`，完整 activity 可以轻量记录，不要过早复杂化。

---

### 3.5 ExternalMapping

```ts
export type ExternalMapping = {
  id: string;
  localRecordId: string;
  provider: 'browser' | 'cloud' | 'notion';
  externalId: string;
  externalUrl?: string;
  lastSyncedAt?: string;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'deleted';
};
```

这个模型是未来 Notion 和云同步的关键。

不要把 Notion pageId、cloud id、browser id 全部塞进一个字段。

正确关系应该是：

```text
BookmarkRecord.id
  ↔ browser bookmark id
  ↔ cloud bookmark id
  ↔ notion page id
```

由映射表管理。

---

## 4. 推荐目录结构

第二阶段建议增加：

```text
src/domain/
  bookmark-record/
    types.ts
    normalize.ts
    denormalize.ts
    validators.ts
  folder-record/
    types.ts
    normalize.ts
  tag-record/
    types.ts
  activity/
    types.ts
  external-mapping/
    types.ts

src/features/import-export/
  schema.ts
  exportJson.ts
  importJson.ts
  exportCsv.ts
  importCsv.ts
  exportNetscapeHtml.ts
  importNetscapeHtml.ts

src/domain/table-view/
  columns.ts
  filters.ts
  sorting.ts
  types.ts
```

当前项目已经采用目录化 domain 分层：

```text
src/domain/bookmark-record/
  types.ts
  normalize.ts
  tableRow.ts

src/domain/folder-record/
  types.ts

src/domain/tag-record/
  types.ts

src/domain/table-view/
  types.ts
```

后续继续扩展时，应优先在现有 domain 子目录内补充：

```text
validators.ts
denormalize.ts
mappers.ts
```

不再新增旧式 camelCase flat file 或旧 table-view feature 目录。

---

## 5. 数据格式设计：导入导出

### 5.1 推荐同时支持三类格式

| 格式 | 用途 | 是否保留完整元数据 |
|---|---|---|
| Netscape Bookmark HTML | 浏览器兼容导入导出 | 否 |
| Versioned JSON | 完整备份、迁移、云端同步基础 | 是 |
| CSV | 表格交换、人工编辑、低门槛导入 | 部分 |

不要试图只用一种格式解决所有问题。

---

### 5.2 Netscape Bookmark HTML

用途：

```text
兼容 Chrome / Edge / Firefox / Safari 等浏览器传统书签导入导出
```

适合保存：

```text
文件夹层级
标题
URL
创建时间
```

不适合保存：

```text
备注
Tags
预览图
Notion 映射
云端状态
复杂元数据
```

定位：

```text
浏览器兼容格式，不是完整备份格式
```

---

### 5.3 Versioned JSON

这是项目自己的完整备份格式，必须支持版本号。

推荐结构：

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-05-05T00:00:00.000Z",
  "app": "Bookmark Visualizer",
  "folders": [],
  "bookmarks": [],
  "tags": [],
  "metadata": [],
  "activities": [],
  "externalMappings": []
}
```

必须有 `schemaVersion`，原因是未来字段一定会变。

建议建立：

```text
schema v1
schema v2
migration v1_to_v2
```

即使当前只有 v1，也要先放版本号。

---

### 5.4 CSV

CSV 适合用户手动编辑和表格软件处理。

推荐字段：

```text
title
url
folderPath
note
tags
previewImageUrl
description
createdAt
updatedAt
```

其中：

```text
tags 可以用逗号或分号分隔
folderPath 使用 / 分隔层级
```

例如：

```csv
title,url,folderPath,note,tags
Example,https://example.com,Work/Research,Important,AI;Tool
```

CSV 不适合保留完整同步状态和复杂映射关系。

定位：

```text
人工可读、表格可编辑、轻量交换
```

---

## 6. 多维表格视图的数据处理方式

### 6.1 表格视图不应直接读取 Chrome TreeNode

错误方向：

```text
chrome.bookmarks.BookmarkTreeNode[]
  → 直接渲染表格
```

正确方向：

```text
chrome.bookmarks.BookmarkTreeNode[]
  + metadata
  + tags
  + activities
  ↓
BookmarkRecord[]
  ↓
TableRows
  ↓
Table UI
```

### 6.2 建议定义 TableRow

```ts
export type BookmarkTableRow = {
  id: string;
  title: string;
  url: string;
  folderPath: string;
  note?: string;
  tags: string[];
  previewImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  lastOperatedAt?: string;
};
```

TableRow 是 UI 展示模型，不等同于数据库模型。

好处是：

```text
领域模型可以稳定
表格字段可以自由增减
导出逻辑可以复用 TableRow 或 BookmarkRecord
```

---

## 7. 本地存储策略

第二阶段仍建议以本地为主。

推荐结构：

```text
chrome.storage.local
  bookmarkMetadataByBrowserId
  tagsById
  bookmarkTagIdsByBookmarkId
  activitiesById
  externalMappingsById
  settings
```

需要注意：

```text
不要一次性把所有数据塞进一个巨大对象
不要让 key 设计只适配当前 UI
不要用标题或 URL 当唯一 ID
```

ID 优先级：

```text
本地业务 id：系统内部稳定引用
browserBookmarkId：对应浏览器原生书签
url：业务字段，不是唯一主键
```

原因是同一个 URL 可以存在多个文件夹里，标题也可以重复。

---

## 8. Tags 的处理建议

### 8.1 Tag 不要和 folder 混用

Folder 表示位置：

```text
一个书签在哪里？
```

Tag 表示属性：

```text
这个书签属于什么主题？
```

所以数据关系应是：

```text
BookmarkRecord 1 → 1 FolderRecord
BookmarkRecord N ↔ N TagRecord
```

### 8.2 本阶段可先做数据层，不做复杂 UI

最低实现：

```text
TagRecord 类型
bookmarkId ↔ tagId 关系
导入导出支持 tags 字段
表格行可展示 tags
```

不必立刻做：

```text
复杂 tag 管理器
tag 颜色系统
tag 自动推荐
AI 打标
```

---

## 9. 最近操作时间保存在本地还是云端？

建议采用分阶段策略。

### 当前阶段

```text
保存在本地
```

原因：

```text
当前没有账号系统
没有云端冲突解决
最近操作主要服务本机排序
```

### 云端阶段

```text
本地记录，云端同步
```

需要注意，`lastOperatedAt` 可能因多设备产生冲突。

简单策略：

```text
取最新时间
```

更完整策略：

```text
保存 activity log，由云端合并
```

但第二阶段不需要做复杂冲突合并，只要预留字段即可。

---

## 10. 本阶段改动顺序

推荐顺序：

```text
1. 定义 BookmarkRecord / FolderRecord / TagRecord 类型
2. 建立 Chrome TreeNode → BookmarkRecord 的 normalize 函数
3. 建立 metadata 合并逻辑
4. 建立 TableRow 派生逻辑
5. 建立 Versioned JSON export
6. 建立 Versioned JSON import dry-run
7. 建立 CSV export
8. 建立 CSV import dry-run
9. 预留 Netscape HTML import/export 模块
10. 给核心转换函数补测试
```

其中 `dry-run` 很重要。

导入前应先预览：

```text
将新增多少书签
将更新多少书签
有多少重复 URL
有多少无效 URL
有多少文件夹会被创建
```

不要一上来就直接写入浏览器书签。

---

## 11. 导入流程建议

推荐流程：

```text
选择文件
  ↓
解析文件
  ↓
校验 schema
  ↓
生成 ImportPlan
  ↓
展示预览
  ↓
用户确认
  ↓
执行导入
  ↓
写入 chrome.bookmarks + metadata
  ↓
生成导入报告
```

ImportPlan 示例：

```ts
export type ImportPlan = {
  source: 'json' | 'csv' | 'html';
  foldersToCreate: FolderRecord[];
  bookmarksToCreate: BookmarkRecord[];
  bookmarksToUpdate: BookmarkRecord[];
  conflicts: ImportConflict[];
  warnings: string[];
};
```

这样可以避免用户一导入就污染原生书签。

---

## 12. 第二阶段完成标准

完成后应满足：

```text
存在稳定 BookmarkRecord 类型
存在 Chrome TreeNode → BookmarkRecord 的转换函数
存在 BookmarkRecord → TableRow 的转换函数
Tags 有基础数据结构
Versioned JSON 可导出
Versioned JSON 可导入预览
CSV 可导出
CSV 可导入预览
导入逻辑不会直接无提示写入
核心数据转换有单元测试
现有卡片视图功能不受影响
```

完成第二阶段后，项目才适合进入第三阶段：云端化、订阅制、Notion 集成和跨设备同步。
