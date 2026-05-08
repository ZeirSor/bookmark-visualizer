# 共享组件与 UI primitive

## 共享组件列表

| 组件 | 文件 | 使用页面 | 说明 |
|---|---|---|---|
| `BookmarkCard` | `src/components/BookmarkCard.tsx` | 管理页 | 书签卡片、行内编辑、选择态 |
| `FolderTree` | `src/components/FolderTree.tsx` | 管理页 | 左侧文件夹树和拖拽 |
| `FolderCascadeMenu` | `src/components/FolderCascadeMenu.tsx` | 管理页、Popup、Quick Save、Settings | 多级文件夹选择 / 移动菜单 |
| `FolderMoveSubmenuContent` | `src/components/FolderMoveSubmenuContent.tsx` | 管理页右键菜单 | 移动菜单内搜索、最近位置、级联入口 |
| `BreadcrumbNav` | `src/components/BreadcrumbNav.tsx` | 管理页 | 顶部路径导航 |
| `SearchBar` | `src/components/SearchBar.tsx` | 管理页 | 通用搜索框 |
| `MenuActionContent` | `src/components/MenuActionContent.tsx` | 菜单 | 图标 + label + trailing 布局 |
| `AppIcons` | `src/components/icons/AppIcons.tsx` | 多页面 | 基础图标和 New Tab 图标 |
| `ManagerIcons` | `src/components/icons/ManagerIcons.tsx` | 管理页 / New Tab | 管理功能图标 |
| `MenuActionIcons` | `src/components/icons/MenuActionIcons.tsx` | 菜单 | 编辑、移动、删除、文件夹等菜单图标 |

## 设计 token

文件：`src/styles/tokens.css`

三层结构：

```text
--bv-*       全局基础 token
--app-*      管理页 alias
--popup-*    Popup alias
--nt-*       New Tab alias
```

新增 UI 颜色时：

1. 先判断是不是已有语义：accent、success、danger、muted、line、surface。
2. 如果是跨页面需要，加入 `--bv-*`。
3. 如果只是页面适配，加入对应 `--app-*` / `--popup-*` / `--nt-*`。
4. 组件 CSS 只引用语义变量，不直接写随机 hex。

## 图标维护规则

- 纯图标按钮必须有 `aria-label` 和 `title`。
- 图标 SVG 尺寸由页面 CSS 控制，不在每个组件内硬写过多样式。
- 菜单图标优先使用 `MenuActionIcons`，页面区块图标使用 `AppIcons` / `ManagerIcons`。
- 新图标先确认是否跨页面共用；共用放 `AppIcons`，仅管理页用放 `ManagerIcons`。

## 通用交互规范

| 交互 | 规则 |
|---|---|
| hover | 轻微背景 / 边框变化，不大幅位移 |
| focus | 必须可见，优先使用 accent ring |
| disabled | 降低对比、禁用 cursor、不能保留强 hover |
| loading | 需要文本或 spinner / skeleton，不能只禁用按钮 |
| empty | 说明当前状态和下一步 |
| error | 保留用户输入，不强行重置页面 |
| Escape | 优先关闭局部浮层；无局部浮层时才执行页面级行为 |

## 可复用但暂不抽象的部分

| 相似能力 | 当前位置 | 不抽象原因 |
|---|---|---|
| Popup 保存位置 vs Quick Save 保存位置 | `src/popup/components/SaveLocationPicker.tsx`、`QuickSaveDialog.tsx` | 容器、尺寸、交互密度不同 |
| New Tab side panel vs Manager RightRail | `NewTabSections.tsx`、`RightRail.tsx` | 页面定位不同：New Tab 轻入口，Manager 工作台 |
| 搜索框 | `SearchBar.tsx`、`SearchPanel.tsx`、Popup folder search | 搜索语义不同：全局书签 / 混合 web / 文件夹 |

原则：先共享 feature 逻辑和 token，不急着强行合并 UI 组件。
