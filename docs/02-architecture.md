# 架构设计

## 总体架构

Bookmark Visualizer 是 Manifest V3 浏览器扩展。主界面由工具栏图标触发并以完整扩展页面承载，React 应用负责渲染和交互，浏览器扩展 API 负责读取和修改书签。

```text
Toolbar Action
  -> MV3 Service Worker
  -> Open Extension Page
  -> React UI
  -> Feature Services
  -> Chrome API Adapters
  -> chrome.bookmarks / chrome.storage / chrome.permissions
```

## Manifest V3

第一版需要的扩展能力：

- `action.default_icon` / `action.default_title`：提供工具栏启动入口。
- `background.service_worker`：监听工具栏点击并打开完整工作台标签页。
- `commands.open-quick-save`：默认 `Ctrl + Shift + S` / macOS `Command + Shift + S`，触发当前页快捷保存。
- `permissions.bookmarks`：读取、创建、编辑、删除和移动书签。
- `permissions.storage`：保存备注、摘要、UI 状态和设置。
- `permissions.activeTab` / `permissions.scripting` / `permissions.tabs`：在用户主动触发快捷保存时读取当前标签页并注入保存浮框。
- `optional_host_permissions`：按需请求网页访问权限，用于抓取 description 摘要。

第一版不默认声明全站 host 权限。

当前 manifest 已落地 `bookmarks`、`storage`、`activeTab`、`scripting`、`tabs`、`action`、`commands.open-quick-save`、`background.service_worker`、扩展 PNG 图标和 `optional_host_permissions`。扩展不声明 `chrome_url_overrides.newtab`，因此不会接管浏览器默认新标签页。摘要抓取流程尚未实现，因此 optional host permissions 只作为未来入口保留。

## 分层

### 页面层

页面层包含布局、组件和用户事件绑定。页面层不得直接散落调用 `chrome.*` API，必须通过服务层或 adapter。

### Feature Services

Feature services 负责业务用例：

- 读取书签树。
- 当前实现书签创建、移动、重排、标题 / URL 更新和删除 adapter。
- 当前 UI 暴露书签移动、重排、行内编辑、前后新建和删除。
- 当前 UI 暴露文件夹新建、重命名和移动；文件夹删除暂未暴露。
- 当前 UI 暴露可点击路径导航；路径节点由书签树派生，不从展示字符串反解析。
- 当前 service worker 支持快捷保存命令：注入 content script 展示浮框，接收保存请求后调用 bookmarks adapter 创建书签。
- 当前搜索为标题和 URL 的内存搜索，尚未建立备注 / 摘要索引。
- 当前合并备注到卡片视图；摘要和导入导出仍是后续能力。

### Chrome API Adapters

Adapter 负责屏蔽 `chrome.*` API 细节，统一 Promise、错误处理和类型转换。

### Storage Layer

Storage layer 封装 `chrome.storage.local`，保证读写 key、版本号和迁移逻辑集中管理。

## 状态流

1. 用户点击工具栏图标后由 service worker 打开扩展页面。
2. 读取 `chrome.bookmarks.getTree()`。
3. 读取 `chrome.storage.local` 中的插件元数据。
4. 合并生成 UI ViewModel。
5. 用户执行移动、编辑、删除等操作。
6. 服务层调用 bookmarks API。
7. 成功后刷新相关节点和搜索索引。
8. 写入必要的 UI 状态或元数据。

快捷保存状态流：

1. 用户按下扩展命令快捷键。
2. service worker 查询当前活动 tab。
3. 若是普通网页，注入快捷保存 content script；若不可注入，打开工作台并提示。
4. content script 在 Shadow DOM 浮框中读取当前页 URL、标题和候选图片，并请求书签文件夹树。
5. 用户选择文件夹并保存后，content script 发送保存请求给 service worker。
6. 若用户在保存浮框内新建文件夹，content script 发送创建文件夹请求给 service worker，service worker 调用 bookmarks adapter 创建原生文件夹并返回刷新后的树。
7. service worker 调用 bookmarks adapter 创建原生书签，并把备注 / 预览图片 URL 写入 metadata。

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
