# 移动菜单「最近使用文件夹」验收与维护说明

## 1. UI 验收标准

### 1.1 普通状态

右键书签并悬停「移动」后，子菜单应按顺序显示：

```txt
搜索文件夹...

最近使用
  最近文件夹 A
  最近文件夹 B
  最近文件夹 C

所有文件夹
  Bookmarks bar  >
  Other bookmarks >
```

验收点：

- 子菜单宽度应明显大于当前版本，建议约 `292px`。
- `最近使用` 和 `所有文件夹` 必须有弱标题，不要把两组列表混在一起。
- 最近文件夹行应支持长路径省略，不能把菜单撑宽。
- 当前父文件夹不应作为可点击移动目标出现。
- 没有最近文件夹时，可以隐藏 `最近使用` 整段，只保留搜索和所有文件夹。

### 1.2 悬停与层级展开

验收点：

- 鼠标从主菜单移动到右侧子菜单时，菜单不能闪退。
- 鼠标从最近文件夹移动到所有文件夹时，子菜单不能闪烁重排。
- `FolderCascadeMenu` 的多级展开仍可用。
- 深层文件夹展开时，浮层仍通过 portal 脱离父容器裁剪。

相关代码：

- `src/app/workspace/WorkspaceComponents.tsx:161-217` 当前已经有主菜单与移动菜单的延迟关闭逻辑。
- `src/components/FolderCascadeMenu.tsx` 已经有级联层的 portal 与定位逻辑。
- `src/features/context-menu/index.ts:67-104` 负责级联菜单位置计算。

新增 UI 不应破坏这些机制。

### 1.3 边界位置

在以下位置打开右键菜单：

- 页面右边缘。
- 页面底部。
- 浏览器窗口较窄时。

验收点：

- 移动子菜单可以向左或向上打开。
- 子菜单高度超出时可以滚动。
- 最近文件夹区不会挤压到无法操作 `所有文件夹`。

## 2. 功能验收标准

### 2.1 最近文件夹来源

最近文件夹应来自共享存储模块：

```txt
src/features/recent-folders/recentFolders.ts
```

它应该同时服务：

- Popup 保存。
- Quick Save 浮框。
- 右键移动菜单。

不要在 `App.tsx` 或 `WorkspaceComponents.tsx` 里重新实现去重和截断。

### 2.2 最近文件夹写入时机

应写入最近文件夹的动作：

- Popup 保存成功。
- Quick Save 保存成功。
- 右键菜单移动成功。
- 搜索移动弹窗移动成功。
- 拖拽书签到某个文件夹成功。
- 新建文件夹并移动书签成功。

不应写入的动作：

- 同一文件夹内调整书签顺序。
- 移动失败。
- 只是悬停某个文件夹。
- 只是打开文件夹搜索。

### 2.3 撤销行为

撤销移动后，不需要把目标文件夹从最近列表移除。

原因：最近文件夹表达的是用户“近期选择过的目标位置”，不是书签当前最终位置。这样行为更稳定，也避免撤销操作反复改写用户偏好。

## 3. 数据维护标准

### 3.1 只存 folderId

存储中只保存：

```ts
folderIds: string[]
```

不要保存：

- folder title。
- folder path。
- 完整 `BookmarkNode`。

原因：文件夹名称、路径、层级会变化，存完整对象会产生陈旧数据。展示时应通过当前书签树实时解析。

### 3.2 兼容旧数据

旧数据 Key：

```txt
bookmarkVisualizerQuickSaveUiState
```

新数据 Key：

```txt
bookmarkVisualizerRecentFolders
```

迁移要求：

- 第一次加载新 Key 为空时，从旧 Key 的 `recentFolderIds` 迁移。
- 迁移后写入新 Key。
- 不强制删除旧 Key。

### 3.3 无效 ID 自动过滤

当文件夹被删除、变为不可写或无法解析时：

- UI 不展示它。
- 下次保存最近文件夹时自然被规范化结果覆盖。

## 4. 代码维护标准

### 4.1 组件职责

推荐职责边界：

```txt
src/components/FolderMoveSubmenuContent.tsx
  负责移动子菜单内容结构：搜索、最近使用、所有文件夹。

src/components/FolderCascadeMenu.tsx
  负责级联文件夹树，不包含最近使用业务。

src/features/recent-folders/recentFolders.ts
  负责最近文件夹数据读取、写入、迁移、过滤、解析。

src/app/App.tsx
  负责加载最近文件夹状态，并在移动成功后调用 saveRecentFolder。

src/app/workspace/WorkspaceComponents.tsx
  负责右键菜单外壳、打开/关闭、事件传递。
```

### 4.2 不要继续扩大 `WorkspaceComponents.tsx`

`WorkspaceComponents.tsx` 当前已经包含：

- 右键菜单。
- 文件夹右键菜单。
- 搜索移动弹窗。
- 新建书签卡片。
- 新建文件夹弹窗。
- 快捷键设置弹窗。
- Toast。
- 操作日志。

这次只做必要替换。新增 UI 组件不要继续写在这个文件底部，否则后续维护成本会继续上升。

### 4.3 图标维护

当前图标分散在：

- `src/popup/components/PopupIcons.tsx`
- `src/components/BookmarkCard.tsx` 内部 SVG
- CSS 伪元素图标，例如 `.folder-glyph`

本次可以先用 CSS glyph 完成最近文件夹和搜索图标。后续如果继续统一 UI，建议新增：

```txt
src/components/icons/
  index.tsx
```

再逐步把 Popup、Workspace、Quick Save 的基础图标迁入，避免跨目录 import。

## 5. 测试清单

### 5.1 单元测试

新增或更新：

```txt
src/features/recent-folders/recentFolders.test.ts
src/features/quick-save/uiState.test.ts
```

测试内容：

- `normalizeRecentFolderIds()` 去重、过滤空字符串、保留顺序、限制数量。
- `saveRecentFolder()` 新目标置顶。
- `filterRecentFolderIds()` 过滤不可用 folderId。
- `resolveRecentFolderOptions()` 保持 recent ID 的顺序。
- 旧 Key 到新 Key 的迁移。

### 5.2 类型检查

```bash
node node_modules/typescript/bin/tsc -b --pretty false
```

### 5.3 浏览器手动测试

在 Chrome / Edge 中安装未打包扩展后测试：

1. 先用 Popup 保存到几个不同文件夹。
2. 打开主管理页，右键任意书签 → 移动。
3. 确认最近文件夹显示 Popup 刚用过的位置。
4. 点击最近文件夹移动书签。
5. 刷新主页面后再次打开移动菜单，确认移动目标仍在最近列表第一位。
6. 删除某个最近文件夹后，确认它不再显示。
7. 在深层文件夹树中展开子菜单，确认浮层没有被裁剪。

## 6. 当前压缩包环境备注

我对 `bookmark-visualizer (2).zip` 解压后的代码做了静态检查，并执行了 TypeScript 编译检查：

```bash
node node_modules/typescript/bin/tsc -b --pretty false
```

结果：通过。

测试命令在当前解压环境中存在环境问题：

- `npm test` 会遇到 `vitest: Permission denied`。
- 直接用 `node node_modules/vitest/vitest.mjs` 会遇到 Rollup optional dependency 缺失。

这更像是压缩包内 `node_modules` 在跨环境复制后的依赖/权限问题，不是本次业务代码本身的问题。程序员本地应重新执行 `npm install` 后再跑测试。
