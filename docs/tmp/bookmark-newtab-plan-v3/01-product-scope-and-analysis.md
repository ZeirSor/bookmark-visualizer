# 01. 功能介绍与功能分析

## 1. 产品定位

New Tab 不是完整管理页，也不是 popup 保存页。它应该是每天高频打开的浏览器首页，承担三个任务：

```text
搜索 Search
  → 搜索网页、图片、新闻、视频、地图
  → 同时检索本地收藏书签

启动 Launch
  → 打开固定常用网站
  → 打开最近访问的网站

轻整理 Light Organization
  → 浏览收藏文件夹
  → 查看精选书签
  → 跳转完整管理页进行复杂整理
```

由此推导，页面左上角不适合写“我的书签”。它会让用户误以为这是管理界面。建议改成更轻量的：

```text
Bookmark Visualizer    新标签页
```

视觉上只保留品牌识别，不抢搜索框和快捷入口的优先级。

## 2. 核心功能清单

### 2.1 可开关 New Tab 绑定

在 popup 的“设置”Tab 里新增开关：

```text
绑定新标签页
开启后，点击浏览器 + 会打开 Bookmark Visualizer 新标签页。
关闭后，保留浏览器默认新标签页。
```

技术上采用 service worker 条件重定向，不采用 `chrome_url_overrides.newtab` 静态覆盖。

### 2.2 网络搜索

搜索模块包含：

```text
搜索引擎：Google / Bing / DuckDuckGo / Baidu / Perplexity / 自定义
搜索分类：Web / 图片 / 新闻 / 视频 / 地图
输入框：搜索网页、URL 或输入关键词
```

搜索行为：

| 用户输入 | 行为 |
|---|---|
| 普通关键词 | 使用当前搜索引擎 + 当前分类搜索 |
| 合法 URL | 直接跳转 URL |
| 搜索框聚焦输入 | 展开混合建议面板 |
| ↑ / ↓ | 在建议中移动选择 |
| Enter | 打开当前选中项；无选中时执行网络搜索 |
| Tab | 在“本地书签 / 网络搜索”区块之间切换 |
| Esc | 关闭建议面板 |

### 2.3 本地书签搜索

输入时优先展示本地书签，因为这是项目差异化能力：

```text
本地书签
- PromptPort - Navigate the Sea of Creativity    AI Platform > AI 工具    上次访问：2 分钟前
- Coze - Optimize Prompt                         AI Platform > AI 工具    上次访问：昨天
- Prompt Templates                               Academic > Templates     文件夹

网络搜索
- 用 Google 搜索 prompt                          Web
- 搜索 prompt 图片                               Image
- 搜索 prompt 新闻                               News
- 搜索 prompt 视频                               Video
```

本地书签搜索可以复用当前 `src/features/search/searchBookmarks.ts`，但需要扩展搜索结果 ViewModel，增加：

```text
folderPath
favicon / icon fallback
tag / folder category
lastVisitedAt
resultType: bookmark | folder | webSearch
```

### 2.4 固定快捷方式

固定快捷方式是 New Tab 的主视觉区域，类似 Infinity 的常用网站网格，但视觉上保持 Bookmark Visualizer 的轻卡片风格。

第一版建议支持：

```text
固定 / 取消固定
拖拽排序
隐藏
添加自定义网站
从最近访问中固定
从书签中固定
```

默认可以基于以下来源生成：

```text
用户手动固定列表 newTabPinnedShortcuts
最近访问排行 newTabUsageStats
内置推荐空状态 YouTube / ChatGPT / Gmail / GitHub / Notion 等
```

### 2.5 书签分组

书签分组位于固定快捷方式下方，作为第二层组织入口。

推荐展示方式：

```text
AI Platform   28   AI 工具与平台
Academic      56   论文 / 学术资源
Apply         12   申请相关
Research Tools 24  研究工具与数据
Recent        18   最近添加
```

点击分组：

```text
默认：在当前 New Tab 下方打开轻量预览
重度用户布局：左侧动态侧栏展开并定位到该文件夹
复杂管理：点击“查看全部”进入 index.html 管理页并带 folderId 参数
```

### 2.6 精选书签

精选书签是一排横向轻卡片，不要抢固定快捷方式的主视觉。

来源优先级：

```text
当前选中文件夹的最近访问书签
用户固定的精选书签
最近保存的高频打开书签
```

### 2.7 最近活动

可以保留。它适合帮助用户回到刚打开或刚保存的资源。

活动类型建议：

```text
visited     已访问某书签
saved       已保存新书签
pinned      已固定到快捷方式
created     已新建书签或文件夹
imported    已导入 HTML
```

### 2.8 快捷操作

原“保存当前标签页”不适合放在 New Tab，因为当前页本身就是 New Tab，保存它没有价值。

替换为：

```text
打开管理页
新建书签
导入 HTML
自定义布局
```

可选增加：

```text
管理固定快捷方式
管理搜索引擎
```

## 3. 用户友好的信息架构

用户问到固定标签页和分类书签如何协调。建议采用“主次分层 + 可选布局”的设计。

### 推荐主方案：固定快捷方式在前，书签分组在后

适合 80% 用户。

```text
搜索框
固定快捷方式：高频启动
书签分组：按主题进入
精选书签：补充推荐
右侧最近活动：回到刚用过的东西
```

优势：

```text
打开即用，最接近浏览器 New Tab 心智
不会把用户拖进复杂管理操作
实现成本最低，和现有架构冲突最小
```

### 备选方案 A：Tab 区分

```text
常用网站 | 书签文件夹 | 最近收藏
```

优势：结构清晰。缺点：用户每次切 Tab 才能看到另一类内容，启动效率略低。

建议作为布局模式 `newTabLayoutMode = "tabs"` 后续加入。

### 备选方案 B：动态侧栏

左侧侧栏默认收起，鼠标移入后展开，显示全部书签文件夹。

优势：重度书签用户效率高。缺点：新手不一定发现，首版实现复杂度更高。

建议作为布局模式 `newTabLayoutMode = "sidebar"` 后续加入。

### 不推荐方案：完整树常驻左侧

这会把 New Tab 变成管理页，干扰搜索与快速启动。完整树应该继续留在 `index.html` 管理页。

## 4. 当前版本范围

### MVP 必做

```text
newtab.html 独立入口
popup 设置中可开关绑定 New Tab
service worker 条件重定向
搜索引擎 + 分类搜索
固定快捷方式网格
书签分组卡片
最近活动面板
快捷操作面板，不包含“保存当前标签页”
打开管理页跳转
```

### MVP 暂不做

```text
天气、壁纸、待办、小组件市场
云同步、账号、订阅
AI 摘要、自动分类
完整拖拽树管理
复杂多窗口同步冲突处理
```

### 后续增强

```text
动态侧栏布局
Tab 分区布局
快捷方式拖拽排序
自定义搜索引擎
最近访问排行
书签图标缓存
快捷方式导入 / 导出
```
