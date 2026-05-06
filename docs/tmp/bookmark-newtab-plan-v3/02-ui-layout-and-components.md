# 02. UI 布局、组件与样式设计

## 1. 最终推荐布局

采用“搜索优先 + 固定快捷方式主区 + 书签分组次区”的结构。

```text
┌──────────────────────────────────────────────────────────────┐
│ Header: Bookmark Visualizer · 新标签页       搜索 / 主题 / 设置 │
├──────────────────────────────────────────────────────────────┤
│ Search Card                                                   │
│ [Google ▼] [搜索网页、URL 或输入关键词                  ↵]      │
│          [Web] [图片] [新闻] [视频] [地图]                    │
├───────────────────────────────────────┬──────────────────────┤
│ 快捷访问                              │ 最近活动              │
│ YouTube ChatGPT Gmail ...             │ PromptPort 2分钟前    │
│ Bilibili 抖音 GitHub ...              │ DeepSeek 8分钟前      │
│                                       ├──────────────────────┤
│ 书签分组                              │ 快捷操作              │
│ AI Platform Academic Apply ...        │ 打开管理页 / 新建书签 │
│                                       ├──────────────────────┤
│ 精选书签                              │ 存储使用              │
│ Google Scholar / Zotero / ArXiv ...   │ 312MB / 1GB           │
└───────────────────────────────────────┴──────────────────────┘
```

## 2. 四个预览状态说明

### 2.1 默认首页

文件：`assets/01-default-search-shortcuts-folders.png`

作用：展示最推荐的 MVP 首页。固定快捷方式是主内容，书签分组与精选书签在下方，右侧保留最近活动。

关键点：

```text
不再写“我的书签”大标题
搜索框在视觉优先级第一
固定常用网站比分类书签更靠前
快捷操作移除“保存当前标签页”
```

### 2.2 搜索展开

文件：`assets/02-search-suggestion-overlay.png`

作用：展示用户输入关键词后的混合搜索体验。

建议结构：

```text
搜索框聚焦
└─ SuggestionPanel
   ├─ 本地书签
   │  ├─ 书签结果
   │  ├─ 文件夹结果
   │  └─ 最近访问提示
   ├─ 网络搜索
   │  ├─ Web
   │  ├─ 图片
   │  ├─ 新闻
   │  └─ 视频
   └─ 键盘提示 ↑↓ Enter Tab Esc
```

### 2.3 动态侧栏

文件：`assets/03-hover-sidebar-folder-preview.png`

作用：展示重度书签用户布局。左侧侧栏在 hover 或点击后展开，主区仍保留固定快捷方式。

建议不要作为 MVP 默认，因为它比普通 New Tab 更“管理化”。可以在 `自定义布局` 中作为高级模式。

### 2.4 Tab 分区

文件：`assets/04-tabbed-folder-mode.png`

作用：展示用 Tab 协调“常用网站”和“书签文件夹”。

适合逻辑清晰的用户，但会增加一次切换成本。建议作为第二阶段布局模式。

## 3. 组件拆分

新增 New Tab 入口组件建议放在 `src/newtab/`，业务逻辑放在 `src/features/newtab/`。

```text
src/newtab/
  main.tsx
  NewTabApp.tsx
  styles.css
  components/
    NewTabShell.tsx
    NewTabHeader.tsx
    SearchPanel.tsx
    SearchEngineSelect.tsx
    SearchCategoryChips.tsx
    SearchSuggestionPanel.tsx
    PinnedShortcutGrid.tsx
    ShortcutTile.tsx
    BookmarkGroupStrip.tsx
    BookmarkGroupCard.tsx
    FeaturedBookmarkRow.tsx
    RecentActivityPanel.tsx
    NewTabQuickActions.tsx
    StorageUsageMiniCard.tsx
    HoverFolderSidebar.tsx
    LayoutTabs.tsx
    CustomizeLayoutPanel.tsx
```

可复用现有组件：

```text
src/components/icons/AppIcons.tsx
src/components/SearchBar.tsx            可参考，但 New Tab 搜索交互更复杂，建议新建 SearchPanel
src/components/BookmarkCard.tsx         可抽取 BookmarkIcon / domain fallback，不建议直接复用完整卡片
src/components/FolderCascadeMenu.tsx    不放在首页主界面，仅管理页或设置中使用
```

## 4. 组件职责

### NewTabApp

负责加载数据并组装页面。

```text
读取 settings
读取原生书签树
读取 newTabState
读取 activity
派生 ViewModel
绑定搜索、打开书签、固定快捷方式等事件
```

不得直接散落 `chrome.*` 调用，应通过 `features` 或 `lib/chrome` adapter。

### SearchPanel

负责搜索 UI 状态。

```text
query
selectedEngineId
selectedCategory
suggestionOpen
activeSuggestionIndex
```

实际搜索逻辑由 `src/features/newtab/search` 提供。

### PinnedShortcutGrid

负责固定快捷方式展示。

```text
显示 16–24 个常用网站
支持空状态推荐
支持添加网站入口
后续支持拖拽排序
```

### BookmarkGroupStrip

负责展示分类文件夹入口。

```text
AI Platform / Academic / Apply / Research Tools / Recent
展示数量、描述、颜色、代表书签
点击后切换 FeaturedBookmarkRow 或打开预览
```

### RecentActivityPanel

读取 `bookmarkVisualizerActivity`，展示最近打开、保存、固定、导入等记录。

### NewTabQuickActions

动作只保留：

```text
打开管理页
新建书签
导入 HTML
自定义布局
```

不要出现 `保存当前标签页`。

## 5. 样式规范

New Tab 视觉应比管理页更轻、更像首页。

### 色彩变量

建议在 `src/newtab/styles.css` 中先定义局部变量，后续再抽到共享 design tokens。

```css
:root {
  --nt-bg: #f7f8fc;
  --nt-panel: #ffffff;
  --nt-panel-soft: #f8f7ff;
  --nt-line: #e7e9f2;
  --nt-text: #202436;
  --nt-muted: #697086;
  --nt-faint: #9aa1b5;
  --nt-accent: #6d4aff;
  --nt-accent-soft: #f0edff;
  --nt-accent-line: #d9d2ff;
  --nt-success-soft: #ecfdf4;
  --nt-warning-soft: #fff7ed;
  --nt-radius-lg: 24px;
  --nt-radius-md: 16px;
  --nt-shadow-card: 0 14px 40px rgba(31, 35, 55, 0.06);
}
```

### 尺寸建议

```text
页面最大宽度：1500–1560px
搜索卡片宽度：960–1080px
搜索输入高度：56px
固定快捷图标：52–60px
固定快捷网格：8 列 × 3 行，宽屏最多 24 个
右侧栏宽度：320–360px
圆角：16–24px
```

### 动效原则

```text
搜索建议展开：opacity + translateY，120–160ms
卡片 hover：translateY(-2px)，阴影略增强
侧栏展开：width 160ms ease-out
不要使用大幅缩放和弹跳动画
```

### 响应式

```text
≥ 1280px：主内容 + 右侧栏
960–1279px：右侧栏下移，主内容全宽
≤ 720px：固定快捷方式 4 列，文件夹卡片横向滚动，搜索分类可横向滚动
```

## 6. 交互细节

### 搜索框不要强制抢默认焦点

Chrome New Tab 默认焦点通常在地址栏。不要依赖页面搜索框自动 focus。可以提供：

```text
点击搜索框 → 输入页面内搜索
按 / → 聚焦页面搜索框
直接输入地址栏 → 保持浏览器默认体验
```

### 打开行为

```text
点击固定快捷方式 → 当前 Tab 打开 URL
Ctrl / Cmd + 点击 → 新 Tab 打开 URL
点击文件夹卡 → 展开轻量预览
点击“查看全部” → 打开 index.html?folderId=xxx
```

### 自定义布局入口

`自定义布局` 打开右侧 Drawer，不要直接进入编辑模式，避免误触。

Drawer 包含：

```text
默认布局：标准 / 侧栏 / Tab 分区
每行快捷方式数量
显示最近活动
显示精选书签
默认搜索引擎
默认搜索分类
```
