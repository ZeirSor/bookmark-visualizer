# 阶段三：视觉细节、动效、复用与最终验收

## 阶段目标

在阶段一、二可用之后，把保存 Tab 从“能用”打磨到“接近图 3”：图标、动效、状态反馈、可访问性、代码复用与测试都要收尾。

## 1. 视觉细节补齐

### 1.1 图标统一

当前图标分散在 `src/popup/main.tsx` 和 `src/features/quick-save/content.tsx` 内部，后期维护会重复。建议抽出：

```text
src/components/icons.tsx
```

至少包含：

- SaveIcon
- FolderIcon
- FolderPlusIcon
- SearchIcon
- SettingsIcon
- ExternalLinkIcon
- ChevronRightIcon
- CheckIcon
- StarIcon

图 3 中第一列的 `Bookmarks bar` 建议用 star icon，普通文件夹用 folder icon。

### 1.2 当前状态 badge

样式：

```css
.current-badge {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  color: #4f46e5;
  background: #eef2ff;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}
```

### 1.3 最近使用 chips

图 3 的最近使用更像快捷按钮，不是列表。建议：

```css
.recent-chips button {
  min-width: 130px;
  height: 44px;
  border-radius: 9px;
  justify-content: center;
  background: #fff;
}
```

超过三个最近文件夹时，最后一个显示下拉按钮：

```text
[AI Papers] [Read Later] [YouTube] [∨]
```

## 2. 动效规范

动效只做轻量过渡，避免 popup 卡顿。

建议：

```css
.location-picker-popover {
  transform-origin: top left;
  animation: picker-in 120ms ease-out;
}

@keyframes picker-in {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

button,
.folder-picker-row,
.move-folder-button {
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    color 120ms ease,
    box-shadow 120ms ease;
}
```

保留当前 `prefers-reduced-motion: reduce` 逻辑。

## 3. 可访问性与键盘操作

最低要求：

- Tab 可以聚焦到标题、URL、备注、搜索、保存位置按钮、取消、保存。
- Escape：先关 picker，再关 popup。
- Enter：在搜索结果上选择文件夹；在表单主流程中提交保存。
- `aria-live="polite"` 用于保存成功 / 失败状态。
- `aria-expanded` 应绑定到保存位置按钮。
- `aria-controls` 指向 picker id。

路径按钮示例：

```tsx
<button
  type="button"
  className="location-path-row"
  aria-expanded={pickerOpen}
  aria-controls="save-location-picker"
  onClick={() => setPickerOpen((value) => !value)}
>
```

## 4. 快捷键文案修正

当前 manifest 是：

```json
"open-quick-save": {
  "suggested_key": {
    "default": "Ctrl+Shift+S",
    "mac": "Command+Shift+S"
  }
}
```

因此底部不要写 `Ctrl+S`，除非同步修改 manifest 与浏览器命令说明。建议在 popup 中显示：

```text
快捷键：Ctrl+Shift+S
```

macOS 显示：

```text
快捷键：⌘⇧S
```

可通过 `navigator.platform` 简单判断，也可以后续接 `chrome.commands.getAll()` 读取实际命令。

## 5. 代码复用

当前存在两套保存界面：

- `src/popup/main.tsx`：toolbar popup 保存 Tab
- `src/features/quick-save/content.tsx`：content script 快捷保存浮层

它们共享了大量逻辑，但 UI 和状态管理正在分叉。建议抽出：

```text
src/features/quick-save/useQuickSaveFolders.ts
src/features/quick-save/useQuickSaveSaveAction.ts
src/components/PagePreviewCard.tsx
src/components/SaveLocationPicker.tsx
src/components/FolderCascadeMenu.tsx
```

短期至少做到：

- `FolderCascadeMenu` 继续单一来源。
- `PagePreviewCard` 不要在 popup/content 两边各写一份。
- 文件夹路径格式化函数只保留一份。

## 6. 需要补充的测试

### 6.1 路径格式化测试

新增：

```text
src/features/bookmarks/pathDisplay.test.ts
```

覆盖：

- `Root / Bookmarks bar / AI` → `Bookmarks bar / AI`
- `Root / 书签栏 / 论文` → `书签栏 / 论文`
- 空路径 → fallback 文案

### 6.2 picker 状态测试

新增：

```text
src/features/quick-save/locationPicker.test.ts
```

覆盖：

- 打开 picker 时能根据 selectedFolderId 生成 active ancestor path
- 选择文件夹后关闭 picker
- 新建文件夹后选中新 folder
- 最近文件夹去重并保留顺序

### 6.3 popup 当前页信息测试

已有：

```text
src/features/popup/tabDetails.test.ts
```

建议补充：

- favicon fallback 不应被当作大预览图
- protected URL 禁止保存时，保存按钮 disabled
- 空标题 fallback 到 hostname

## 7. 构建与依赖处理

当前 zip 里的 `node_modules` 在解压环境中无法完整运行 Vitest / Vite，原因是缺少 Rollup 的平台 optional dependency。开发者本地收尾时建议：

```bash
rm -rf node_modules package-lock.json
npm install
npm run typecheck
npm test
npm run build
```

如果不想删除 lockfile，则至少：

```bash
rm -rf node_modules
npm ci
```

## 8. 最终验收清单

### 视觉

- Header、Tab、表单、footer 与图 3 的比例接近。
- 不再出现图 1 那种菜单被小容器裁剪的问题。
- 不再出现图 2 那种整体滚动条过重的问题。
- logo、主按钮、active tab 使用统一紫色。
- 保存位置路径行清晰显示当前路径和 `当前位置`。

### 功能

- 可以保存当前 HTTP/HTTPS 页面。
- 不支持保存的页面会禁用保存按钮并提示原因。
- 可以修改标题。
- URL 只读但可选中复制。
- 可以填写备注并保存 metadata。
- 可以搜索文件夹。
- 可以用多列 picker 选择文件夹。
- 可以新建文件夹并自动选中。
- 最近使用文件夹会更新。

### 交互

- Escape 行为正确。
- 点击外部关闭 picker。
- 保存成功反馈明确。
- 保存失败错误可见。
- 保存按钮文案与目标文件夹同步。
- 设置 Tab 管理“保存后自动关闭”。

### 工程

- TypeScript 无错误。
- 单元测试通过。
- Vite build 通过。
- 不重复实现两套文件夹选择器逻辑。
