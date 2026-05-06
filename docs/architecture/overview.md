# 架构设计

## 总体架构

Bookmark Visualizer 是 Manifest V3 浏览器扩展。工具栏图标触发标准 popup，popup 承载当前网页保存入口，并可打开完整扩展页面。React 应用负责渲染和交互，浏览器扩展 API 负责读取和修改书签。

```text
Toolbar Action
  -> action.default_popup
  -> Popup React UI
  -> Runtime Message / Chrome API Adapter
  -> Service Worker
  -> Feature Services
  -> chrome.bookmarks / chrome.storage

Popup Manage Entry
  -> Open Extension Page
  -> Workspace React UI
  -> Feature Services
  -> Chrome API Adapters
  -> chrome.bookmarks / chrome.storage
```

## Manifest V3

第一版需要的扩展能力：

- `action.default_icon` / `action.default_title` / `action.default_popup`：提供工具栏 popup 启动入口。
- `background.service_worker`：处理 popup 和 content script 的保存消息，以及保留的扩展命令入口。
- `commands.open-quick-save`：默认 `Ctrl + Shift + S` / macOS `Command + Shift + S`，触发当前页快捷保存。
- `permissions.bookmarks`：读取、创建、编辑、删除和移动书签。
- `permissions.storage`：保存备注、摘要、UI 状态、快捷保存最近使用文件夹和设置。
- `permissions.activeTab` / `permissions.scripting` / `permissions.tabs`：在用户主动打开 popup 或扩展命令时读取当前标签页详情，必要时执行一次页面 metadata 提取。

当前 manifest 已落地 `bookmarks`、`storage`、`activeTab`、`scripting`、`tabs`、`action.default_popup`、`commands.open-quick-save`、`background.service_worker` 和扩展 PNG 图标。扩展不声明 `chrome_url_overrides.newtab`、全局 `host_permissions` 或默认 `content_scripts`，因此不会接管浏览器默认新标签页，也不会在所有网页常驻脚本。

## 分层

第一阶段架构收口采用以下目标边界：

```text
UI entrypoints
  -> feature / use-case orchestration
  -> domain models and pure rules
  -> infrastructure adapters
```

当前实现不要求一次性迁移目录，但新增代码必须先判断职责落点。页面入口只组合 UI 和事件，业务用例放入 `src/features/*`，纯业务规则未来进入 `src/domain/*`，Chrome API 访问继续集中在 `src/lib/chrome/` 这一 infrastructure adapter 边界。

### 页面层

页面层包含布局、组件和用户事件绑定。页面层不得直接散落调用 `chrome.*` API，必须通过服务层或 adapter。

### Feature Services

Feature services 负责业务用例：

- 读取书签树。
- 当前实现书签创建、移动、重排、标题 / URL 更新和删除 adapter。
- 当前 UI 暴露书签移动、重排、行内编辑、前后新建和删除。
- 当前 UI 暴露文件夹新建、重命名和移动；文件夹删除暂未暴露。
- 当前 UI 暴露可点击路径导航；路径节点由书签树派生，不从展示字符串反解析。
- 当前 popup 支持保存当前网页、编辑标题、复制只读 URL、填写备注、右侧箭头打开全局文件夹级联菜单、搜索文件夹、展开最近文件夹和行内创建文件夹。
- 当前 service worker 支持快捷保存命令：注入 content script 展示浮框，接收保存请求后调用 bookmarks adapter 创建书签。
- 当前搜索为标题和 URL 的内存搜索，尚未建立备注 / 摘要索引。
- 当前合并备注到卡片视图；摘要和导入导出仍是后续能力。

### Chrome API Adapters

Adapter 负责屏蔽 `chrome.*` API 细节，统一 Promise、错误处理和类型转换。当前目录名仍为 `src/lib/chrome/`，第一阶段不为命名迁移而增加风险；长期语义上它属于 infrastructure adapter。

### Storage Layer

Storage layer 封装 `chrome.storage.local`，保证读写 key、版本号和迁移逻辑集中管理。

## 状态流

1. 用户从 popup 或完整工作台入口打开扩展页面。
2. 读取 `chrome.bookmarks.getTree()`。
3. 读取 `chrome.storage.local` 中的插件元数据。
4. 合并生成 UI ViewModel。
5. 用户执行移动、编辑、删除等操作。
6. 服务层调用 bookmarks API。
7. 成功后刷新相关节点和搜索索引。
8. 写入必要的 UI 状态或元数据。

popup 保存状态流：

1. 用户在普通网页点击工具栏图标，Chrome 根据 `action.default_popup` 打开 `popup.html`。
2. popup 通过 `chrome.tabs.query({ active: true, currentWindow: true })` 获取当前标签页基础信息。
3. 对普通网页，popup 通过用户手势带来的 `activeTab` 和 `chrome.scripting.executeScript` 提取页面标题、description、canonical 和候选预览图片；失败时回退到 tab 标题、URL、favicon 或占位图。
4. popup 请求快捷保存初始状态，包括浏览器原生书签树、默认保存文件夹和最近使用文件夹。
5. 用户选择文件夹并保存后，popup 发送保存请求给 service worker。
6. 若用户在 popup 内新建文件夹，popup 发送创建文件夹请求给 service worker，service worker 调用 bookmarks adapter 创建原生文件夹并返回刷新后的树。
7. service worker 调用 bookmarks adapter 创建原生书签，把备注 / 预览图片 URL 写入 metadata，并更新快捷保存最近使用文件夹。

保留的扩展命令状态流：

1. 用户按下 `Ctrl + Shift + S`，或在浏览器扩展快捷键页自定义 `commands.open-quick-save`。
2. service worker 使用 `chrome.commands.onCommand` 事件传入的 `tab` 注入 `quick-save-content.js`。
3. content script 展示 React + Shadow DOM 浮框，并复用同一套保存消息和 metadata 写入逻辑。

当前操作日志保存在 React 状态中，用于本次页面会话撤回。它不写入 `chrome.storage.local`。

## 错误处理

- API 调用失败时显示 toast。
- 权限不足时引导用户授权。
- 不可修改节点需要在 UI 中禁用相关操作。
- 移动到非法目标时必须在 drop 前阻止。

## 性能原则

- 搜索索引在内存中由书签树和 metadata 派生，不持久化。
- 大量树节点渲染时预留虚拟列表或分段渲染空间。
- 备注和摘要存储按 bookmarkId 查询，避免每次搜索做深层遍历。

## 第一阶段架构收口

第一阶段只做本地架构治理，不新增产品功能。正式说明见 [Phase 1 local architecture](phase-1-local-architecture.md)。

本阶段不接云端、不做账号系统、不做订阅制、不做 Notion 集成、不做 AI 摘要、不改变当前数据存储策略。
