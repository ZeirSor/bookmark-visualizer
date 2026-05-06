# 保存 Tab：当前实现分析与目标设计说明

## 1. 结论

当前代码已经完成了 `popup.html` 入口、保存 Tab 的基本表单、当前页信息读取、最近文件夹、文件夹搜索、新建文件夹、保存书签等核心链路。但距离图 3 仍有两个关键差距：

1. **保存位置选择器还没有达到目标形态**：图 3 的核心体验是“点击保存位置 → 右侧展开多列级联目录 → 直接选中目标文件夹”。当前 `src/popup/main.tsx` 的保存位置区域只支持搜索、最近文件夹和打开完整管理页，没有把 `FolderCascadeMenu` 接入 popup 保存 Tab。
2. **视觉系统仍偏工程化**：当前字号、间距、滚动、边框、图标、预览图 fallback、底部状态区都偏大且分散，所以图 2 看起来像“表单堆叠”，而图 3 是一个更完整的保存面板。

补充约束：如果这个页面继续作为浏览器工具栏的 `popup.html`，CSS 不能把内容真正绘制到浏览器 popup 窗口外部。因此图 3 里“级联菜单跨出主卡片右侧”的效果，需要二选一处理：

- **保留 toolbar popup**：把级联菜单作为 popup 内部 overlay 或右侧临时面板，不能依赖外溢到 popup 外。
- **追求图 3 的完整外溢效果**：改用 content script 注入的页面浮层，或打开独立 extension window / tab，而不是标准 action popup。

## 2. 当前代码状态

### 2.1 入口与数据链路

相关文件：

- `public/manifest.json`
- `popup.html`
- `src/popup/main.tsx`
- `src/features/popup/popupClient.ts`
- `src/features/popup/tabDetails.ts`
- `src/service-worker.ts`

当前 `manifest.action.default_popup = "popup.html"`，点击扩展图标会打开 popup。`src/popup/main.tsx` 的 `PopupApp` 默认进入 `save` Tab，并通过：

- `getCurrentTabDetails()` 读取当前活动标签页标题、URL、favicon、OG 图或页面首图
- `loadQuickSaveInitialState()` 读取书签树、默认文件夹、最近文件夹
- `createQuickSaveBookmark()` 调 service worker 创建书签
- `createQuickSaveFolder()` 调 service worker 创建文件夹

这部分链路是可继续沿用的。

### 2.2 当前保存 Tab 的 UI 结构

`SaveTab` 当前结构为：

```text
header: logo / 标题 / 打开管理页
nav: 保存 / 管理 / 设置
form:
  page preview + title/url
  note textarea
  location panel:
    selected path row
    folder search row
    search results
    create folder inline row
    recent folders
  auto close checkbox
footer: status + cancel + save
```

它的问题不是功能完全缺失，而是信息密度、层级与目标设计不一致。

### 2.3 级联菜单已有基础，但没有接进 popup

相关文件：

- `src/components/FolderCascadeMenu.tsx`
- `src/features/context-menu/index.ts`
- `src/features/quick-save/content.tsx`

`FolderCascadeMenu` 已经具备：

- 多层文件夹 hover 展开
- `portalContainer` 渲染浮层
- 根据 viewport 计算左右 / 上下展开方向
- 当前文件夹、选中文件夹、不可保存状态展示
- 新建文件夹 action 扩展点

但当前 popup 的 `SaveTab` 没有使用它。图 3 需要把这套能力接入 popup，并重新包装为“保存位置选择器”。

## 3. 图 1 / 图 2 与图 3 的差距

### 3.1 保存位置区域

当前效果：

- 保存位置区域像普通卡片，路径行右侧按钮实际打开完整管理页。
- 选择位置主要依赖搜索和最近使用。
- 图 1 中的级联层级被滚动容器或边界限制，出现横向滚动条和裁剪感。

目标效果：

- 保存位置是一条清晰的路径选择控件：`AI Platform / papers` + `当前位置` badge + 右侧 chevron。
- 点击后打开多列级联目录。
- 每一列代表一个层级，横向并列展开，不应该挤在同一个小框里。
- 当前路径的每一层都应高亮，最终保存目标应显示 `当前位置`。
- 底部保留“新建文件夹”。

### 3.2 主面板视觉

当前效果：

- `src/popup/styles.css` 中 `html, body, #root` 固定 `width: 760px; min-height: 560px; overflow: hidden;`，`.save-tab` 又设置 `max-height: 420px; overflow: auto;`，导致主体滚动明显。
- 标题 28px、Tab 20px、input 20px、textarea 20px，整体偏大。
- 外层没有图 3 那种柔和卡片感与阴影层级。

目标效果：

- 主卡片更轻，建议基准宽度 680–720px。
- 视觉重点应落在“保存内容”和“保存位置”，不是每个控件都同等强。
- 滚动条不应成为视觉主体；在 popup 高度受限时，优先压缩间距，把滚动限制在内容区内部，并隐藏浏览器默认风格的粗滚动条。

### 3.3 顶部区域

当前效果：

- 使用 `public/icons/icon-128.png`，图 2 中 logo 更像渐变方块，与图 3 的紫色简洁图标不一致。
- 标题与副标题偏大。

目标效果：

- logo 为 48–52px 的紫色圆角方形，内部使用白色线性书签符号。
- 标题 `我的书签` 约 20–22px，副标题 14–15px。
- 右上角外链按钮需要更轻，不抢占主流程。

### 3.4 网页预览

当前代码逻辑：

- `getCurrentTabDetails()` 尝试读取 `og:image`、`twitter:image`、favicon、页面首图。
- `SaveTab` 直接把 `previewImageUrl` 作为大图渲染。

问题：

- 如果 fallback 到 favicon，会被拉伸成大图，效果会像图 2 的色块，不够像图 3 的内容预览卡。
- 对 arXiv、文档、工具页这类没有合适大图的网站，应该使用“生成式预览卡” fallback，而不是硬拉伸 favicon。

目标：

- 有合适 OG 图：显示图片。
- 只有 favicon 或图片过小：显示内容卡片，包含站点、标题、domain、简单摘要占位。
- 不要让小图标充满整个预览区域。

### 3.5 底部状态与操作

当前效果：

- 保存 Tab 内还有 `auto-close-row`，图 3 没有。
- 状态文案“点击扩展图标保存当前页”在 popup 中语义不准确，因为用户已经打开了扩展。
- 图 1 文案显示 `Ctrl+S`，但 manifest 当前配置是 `Ctrl+Shift+S` / `Command+Shift+S`。

目标：

- `auto-close-row` 移到设置 Tab。
- 底部左侧只保留快捷键 / 状态反馈。
- 快捷键文案必须与 `manifest.commands.open-quick-save` 一致，避免出现 `Ctrl+S` 误导。
- 保存按钮文案根据当前目标文件夹动态显示：`保存到 Papers`。

## 4. 推荐目标信息架构

```text
Popup Shell
├─ Header
│  ├─ Logo
│  ├─ Title: 我的书签
│  ├─ Subtitle: Bookmark Visualizer
│  └─ Open workspace icon
├─ Tabs
│  ├─ 保存
│  ├─ 管理
│  └─ 设置
├─ Save Content
│  ├─ Page Summary
│  │  ├─ Preview Card
│  │  └─ Fields: title / url / note
│  ├─ Save Location
│  │  ├─ Selected path button
│  │  ├─ Search folder input
│  │  ├─ New folder button
│  │  └─ Recent folders
│  └─ Location Picker Overlay
│     ├─ Column 1: root folders
│     ├─ Column 2: children
│     ├─ Column 3: selected branch children
│     └─ Footer: 新建文件夹
└─ Footer
   ├─ Status / shortcut
   ├─ Cancel
   └─ Save
```

## 5. 目标视觉规格

### 5.1 基础 token

```css
--bv-accent: #4f46e5;
--bv-accent-strong: #4338ca;
--bv-accent-soft: #eef2ff;
--bv-text: #111827;
--bv-muted: #667085;
--bv-subtle: #94a3b8;
--bv-border: #dbe3f0;
--bv-border-soft: #edf1f7;
--bv-bg: #ffffff;
--bv-bg-soft: #f8fafc;
--bv-radius-sm: 8px;
--bv-radius-md: 12px;
--bv-shadow-card: 0 18px 48px rgb(15 23 42 / 0.16);
--bv-shadow-popover: 0 16px 40px rgb(15 23 42 / 0.14);
```

当前 `--accent: #002fa7` 太深，图 3 更接近高饱和紫蓝。建议切到 `#4f46e5`，hover / pressed 用 `#4338ca`。

### 5.2 尺寸建议

在 toolbar popup 内：

```css
html, body, #root {
  width: 700px;
  height: 600px;
  margin: 0;
  overflow: hidden;
}

.popup-shell {
  width: 700px;
  height: 600px;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
}
```

如果改成 content script / 独立窗口，可用：

```css
.quick-save-dialog,
.popup-like-dialog {
  width: 700px;
  max-height: min(92vh, 760px);
  border-radius: 16px;
  box-shadow: var(--bv-shadow-card);
}
```

### 5.3 表单规格

- Header padding：24px 28px 16px
- Tab 高度：56px
- Content padding：22px 26px 0
- Preview：172px × 172px，radius 10–12px
- Label：14px / 700，颜色 `--bv-muted`
- Input：48px 高，16px 水平 padding，16px 字号
- Textarea：96–108px 高，16px 字号
- Footer button：52px 高，主按钮 180–210px 宽

## 6. 保存位置选择器设计

### 6.1 默认状态

```text
保存位置
[ folder icon ] AI Platform / papers        [当前位置] [ > ]
[ search icon ] 搜索文件夹...               [new-folder icon]
最近使用: [AI Papers] [Read Later] [YouTube] [更多]
```

注意：路径展示不要显示 `Root /`。当前 `flattenFolders()` 会产生 `Root / Bookmarks bar`，需要在 popup 展示层做格式化。

### 6.2 打开状态

点击路径行或 chevron 后：

```text
主面板右侧 / 内部 overlay：
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ ★ Bookmarks bar │ │ folder AI ...   │ │ folder Papers  │
│ folder Other... │ │ Research      > │ │ Notes          │
│                │ │ Tools         > │ │ Datasets       │
│ + 新建文件夹    │ │ + 新建文件夹     │ │ + 新建文件夹     │
└────────────────┘ └────────────────┘ └────────────────┘
```

每列要求：

- 宽度 210–230px
- 最小高度 220px，最大高度 320px
- 内部可纵向滚动，不出现横向滚动条
- 列与列间距 6–8px
- 选中项背景 `--bv-accent-soft`
- 选中项文字与 icon 使用 `--bv-accent`
- `当前位置` badge 位于 row 右侧

### 6.3 交互规则

- 单击文件夹：设为保存目标。
- Hover / focus 有子文件夹的 row：展开下一列。
- 单击 chevron 或双击 row：进入下一层浏览。
- 点击外部：关闭 picker。
- Escape：关闭 picker；如果 picker 未打开，则关闭 popup。
- 搜索输入时：优先展示搜索结果，选择结果后关闭 picker 并更新路径。
- 新建文件夹：默认创建在当前选中保存目标下；如果 picker 当前 hover 某列，则可在该列对应父文件夹下创建。

## 7. 需要新增或重构的组件

建议新增：

```text
src/popup/components/SaveLocationPicker.tsx
src/popup/components/PagePreviewCard.tsx
src/popup/components/PopupFooter.tsx
src/popup/components/PopupTabs.tsx
src/popup/popupDesignTokens.css 或继续合并到 styles.css
```

### 7.1 SaveLocationPicker

职责：

- 管理 `pickerOpen`
- 管理 `browsingFolderId` 或 `activePath`
- 渲染路径按钮、搜索框、最近文件夹、级联菜单
- 复用 `FolderCascadeMenu`
- 调用 `createQuickSaveFolder()`

输入：

```ts
interface SaveLocationPickerProps {
  tree: BookmarkNode[];
  selectedFolderId: string;
  recentFolders: FolderOption[];
  searchResults: FolderOption[];
  query: string;
  selectedPath: string;
  selectedTitle: string;
  loading: boolean;
  onQueryChange(value: string): void;
  onSelectFolder(folderId: string): void;
  onCreateFolder(parentId: string, title: string): Promise<void>;
}
```

### 7.2 PagePreviewCard

职责：

- 识别 `previewImageUrl` 是否适合作为大图。
- 如果是 favicon 或加载失败，渲染 fallback 内容卡。
- 避免 favicon 被拉伸。

### 7.3 PopupFooter

职责：

- 状态反馈
- 快捷键显示
- 取消 / 保存按钮
- 保存成功状态动画

## 8. 验收标准

1. 打开扩展 popup 后，默认进入保存 Tab。
2. 页面无明显粗滚动条；即使内容需要滚动，也只在内容区内部出现轻量滚动。
3. 标题、URL、备注、保存位置、最近使用、底部操作完整可见。
4. 点击保存位置路径行，会出现文件夹选择器。
5. 文件夹选择器能展示至少三层目录，并且不会被当前保存位置卡片裁剪。
6. 当前保存目标在路径、picker row、保存按钮三处保持一致。
7. 搜索文件夹后，点击结果可更新保存目标。
8. 新建文件夹后，自动选中新文件夹。
9. `Root /` 不出现在最终给用户看的路径里。
10. 快捷键文案与 `manifest.commands` 一致。
11. 保存成功后显示 `已保存到 {folder}`，并按设置决定是否自动关闭。
12. TypeScript 编译通过；本地重新安装依赖后 `npm test` 与 `npm run build` 通过。

## 9. 本次代码验证备注

我在当前 zip 中直接执行了 TypeScript 编译检查，`tsc -b` 可以通过。Vitest / Vite 未能在这个解压环境中跑完，原因是随 zip 打包的 `node_modules` 缺少 Rollup 的 Linux optional dependency，且 `.bin/vitest` 没有执行权限。开发者本地建议先删除 `node_modules` 后重新 `npm install`，再执行：

```bash
npm run typecheck
npm test
npm run build
```
