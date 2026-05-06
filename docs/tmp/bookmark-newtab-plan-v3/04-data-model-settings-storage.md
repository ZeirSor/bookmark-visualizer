# 04. 数据模型、设置与 Storage 设计

## 1. 总体原则

New Tab 的数据分三类：

```text
Settings：用户偏好，放入现有 bookmarkVisualizerSettings
State：New Tab 布局、固定快捷方式、隐藏项，单独 key
Activity：最近活动、访问统计，单独 key
```

这样做的原因：

```text
settingsService 已经存在 normalize 流程，适合放稳定偏好
固定快捷方式和使用统计增长更快，放单独 key 更容易截断和迁移
最近活动有上限，不应该塞进全局 settings
```

## 2. SettingsState 扩展

当前文件：`src/features/settings/index.ts`

新增字段建议：

```ts
export type NewTabLayoutMode = "standard" | "sidebar" | "tabs";
export type NewTabSearchCategory = "web" | "image" | "news" | "video" | "maps";

export interface SettingsState {
  // existing fields...
  newTabOverrideEnabled: boolean;
  newTabDefaultSearchEngineId: string;
  newTabDefaultSearchCategory: NewTabSearchCategory;
  newTabLayoutMode: NewTabLayoutMode;
  newTabShowRecentActivity: boolean;
  newTabShowStorageUsage: boolean;
  newTabShortcutsPerRow: number;
}
```

默认值：

```ts
export const defaultSettings: SettingsState = {
  // existing fields...
  newTabOverrideEnabled: false,
  newTabDefaultSearchEngineId: "google",
  newTabDefaultSearchCategory: "web",
  newTabLayoutMode: "standard",
  newTabShowRecentActivity: true,
  newTabShowStorageUsage: true,
  newTabShortcutsPerRow: 8
};
```

Normalize 规则：

```text
newTabOverrideEnabled：默认 false，避免安装后突然接管用户新标签页
newTabDefaultSearchEngineId：不存在则 google
newTabDefaultSearchCategory：只允许 web / image / news / video / maps
newTabLayoutMode：只允许 standard / sidebar / tabs
newTabShortcutsPerRow：限制在 4–10
```

## 3. NewTabState

新文件：`src/features/newtab/newTabState.ts`

Storage key：

```ts
const NEW_TAB_STATE_KEY = "bookmarkVisualizerNewTabState";
```

数据结构：

```ts
export interface NewTabShortcut {
  id: string;
  title: string;
  url: string;
  source: "bookmark" | "custom" | "generated";
  bookmarkId?: string;
  iconUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface NewTabState {
  version: 1;
  pinnedShortcuts: NewTabShortcut[];
  hiddenShortcutUrls: string[];
  selectedFolderIds: string[];
  featuredBookmarkIds: string[];
  collapsedSections: string[];
}
```

默认值：

```ts
export const defaultNewTabState: NewTabState = {
  version: 1,
  pinnedShortcuts: [],
  hiddenShortcutUrls: [],
  selectedFolderIds: [],
  featuredBookmarkIds: [],
  collapsedSections: []
};
```

字段解释：

| 字段 | 说明 |
|---|---|
| `pinnedShortcuts` | 用户固定快捷方式，支持来自书签或自定义 URL |
| `hiddenShortcutUrls` | 用户从自动推荐中隐藏的网站 |
| `selectedFolderIds` | 首页展示的书签分组，默认为自动推荐前 5 个 |
| `featuredBookmarkIds` | 精选书签，后续支持手动固定 |
| `collapsedSections` | 用户折叠的首页模块 |

## 4. Activity 与 Usage Stats

新文件：`src/features/newtab/activity.ts`

Storage key：

```ts
const NEW_TAB_ACTIVITY_KEY = "bookmarkVisualizerNewTabActivity";
const NEW_TAB_USAGE_KEY = "bookmarkVisualizerNewTabUsageStats";
```

活动记录：

```ts
export type NewTabActivityType =
  | "visited"
  | "saved"
  | "pinned"
  | "created"
  | "imported";

export interface NewTabActivityItem {
  id: string;
  type: NewTabActivityType;
  title: string;
  url?: string;
  bookmarkId?: string;
  folderId?: string;
  createdAt: number;
}
```

访问统计：

```ts
export interface NewTabUsageItem {
  url: string;
  title: string;
  bookmarkId?: string;
  openCount: number;
  lastOpenedAt: number;
}
```

限制：

```text
Activity 最多保留 100 条
UsageStats 最多保留 300 条
同 URL 访问统计合并
最近活动可保留重复事件，但同一 URL 在 30 秒内重复打开可折叠
```

## 5. 搜索引擎配置

新文件：`src/features/newtab/searchEngines.ts`

```ts
export type SearchCategory = "web" | "image" | "news" | "video" | "maps";

export interface SearchEngineDefinition {
  id: string;
  label: string;
  categories: Partial<Record<SearchCategory, string>>;
}
```

示例：

```ts
export const SEARCH_ENGINES: SearchEngineDefinition[] = [
  {
    id: "google",
    label: "Google",
    categories: {
      web: "https://www.google.com/search?q={query}",
      image: "https://www.google.com/search?tbm=isch&q={query}",
      news: "https://news.google.com/search?q={query}",
      video: "https://www.google.com/search?tbm=vid&q={query}",
      maps: "https://www.google.com/maps/search/{query}"
    }
  },
  {
    id: "bing",
    label: "Bing",
    categories: {
      web: "https://www.bing.com/search?q={query}",
      image: "https://www.bing.com/images/search?q={query}",
      news: "https://www.bing.com/news/search?q={query}",
      video: "https://www.bing.com/videos/search?q={query}",
      maps: "https://www.bing.com/maps?q={query}"
    }
  },
  {
    id: "duckduckgo",
    label: "DuckDuckGo",
    categories: {
      web: "https://duckduckgo.com/?q={query}",
      image: "https://duckduckgo.com/?q={query}&iax=images&ia=images",
      news: "https://duckduckgo.com/?q={query}&iar=news&ia=news",
      video: "https://duckduckgo.com/?q={query}&iax=videos&ia=videos",
      maps: "https://duckduckgo.com/?q={query}&ia=maps"
    }
  }
];
```

构建 URL：

```ts
export function buildSearchUrl(engineId: string, category: SearchCategory, query: string): string {
  const engine = findSearchEngine(engineId);
  const template = engine.categories[category] ?? engine.categories.web;
  return template.replace("{query}", encodeURIComponent(query.trim()));
}
```

## 6. 混合搜索结果模型

```ts
export type NewTabSuggestionType = "bookmark" | "folder" | "web-search" | "url";

export interface NewTabSuggestion {
  id: string;
  type: NewTabSuggestionType;
  title: string;
  subtitle?: string;
  url?: string;
  bookmarkId?: string;
  folderId?: string;
  folderPath?: string;
  tag?: string;
  icon?: string;
  category?: SearchCategory;
  score: number;
}
```

排序策略：

```text
合法 URL 直达建议：最高
标题完全匹配书签：高
固定快捷方式匹配：高
最近访问过的书签：中高
普通 URL / 标题包含：中
网络搜索建议：保底
```

## 7. Favicon / Icon 策略

MVP 不建议依赖外部 favicon 服务，避免隐私和网络失败。

建议阶段：

```text
阶段 1：使用域名首字母 + 颜色 hash + 少量内置品牌 icon 映射
阶段 2：允许用户上传或选择图标
阶段 3：可选远程 favicon 获取，但必须有隐私开关
```

类型：

```ts
export interface ShortcutIconViewModel {
  kind: "brand" | "letter" | "image";
  value: string;
  background?: string;
}
```

## 8. Folder ViewModel

```ts
export interface NewTabFolderCardViewModel {
  id: string;
  title: string;
  description: string;
  bookmarkCount: number;
  color: "purple" | "blue" | "green" | "orange" | "gray";
  sampleBookmarks: Array<{
    id: string;
    title: string;
    url: string;
  }>;
}
```

派生逻辑：

```text
优先使用用户 selectedFolderIds
没有 selectedFolderIds 时，从顶层可写文件夹和最近使用文件夹中选 5 个
每个文件夹展示前 3 个直接书签或最近访问书签
```

## 9. Storage migration

现有 `settingsService.normalizeSettings` 已经能做向后兼容。新增字段时必须保持：

```text
旧用户没有 newTab 字段 → 使用默认值
字段类型错误 → 使用默认值
数组过长 → 截断
URL 非法 → 丢弃
bookmarkId 找不到 → UI 回退但不立即删除，避免 Chrome 同步延迟导致误删
```

`NewTabState` 单独做版本迁移：

```ts
export function normalizeNewTabState(input?: Partial<NewTabState>): NewTabState {
  return {
    version: 1,
    pinnedShortcuts: normalizePinnedShortcuts(input?.pinnedShortcuts),
    hiddenShortcutUrls: normalizeStringList(input?.hiddenShortcutUrls, 300),
    selectedFolderIds: normalizeStringList(input?.selectedFolderIds, 20),
    featuredBookmarkIds: normalizeStringList(input?.featuredBookmarkIds, 50),
    collapsedSections: normalizeStringList(input?.collapsedSections, 20)
  };
}
```
