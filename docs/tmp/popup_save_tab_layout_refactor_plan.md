# Popup 保存 Tab 布局与交互改造方案

> 面向开发实现的修改说明  
> 范围：保存 Tab 的布局、样式、交互状态、动效、代码结构  
> 相关页面：浏览器扩展点击图标后的 Popup 保存页  
> 重点文件：`src/popup/tabs/SaveTab.tsx`、`src/popup/components/SaveLocationPicker.tsx`、`src/popup/styles.css`

---

## 1. 当前问题总览

当前版本相比前一版已经有明显进步：保存位置被提前到了备注之前，搜索文件夹、新建文件夹、最近使用也都已经出现在保存位置区域里。但从最新截图看，页面仍然存在一个核心问题：**布局从“右侧保存表单”变成了“上方网页信息 + 下方大块位置面板 + 下方备注”的纵向堆叠**。

这会让页面显得很高、很散、很像普通设置表单，而不是一个高频使用的快速保存工具。

当前最需要解决的不是单个按钮或单个间距，而是重新整理保存 Tab 的信息架构：

```text
当前状态：
顶部品牌区
Tab
左预览 + 右标题 URL
全宽保存位置
全宽备注
Footer

建议状态：
顶部品牌区
Tab
左侧预览卡片  | 右侧保存表单
              | 标题
              | URL
              | 保存位置
              | 备注
Footer
```

换句话说，左侧预览不应该只服务于标题 / URL 那一小段，而应该作为整个保存表单的左侧视觉锚点。右侧才是完整的保存操作闭环。

---

## 2. 主要问题拆解

### 2.1 布局问题：保存位置和备注横跨全宽，破坏左右结构

当前截图里，保存位置和备注都变成了全宽模块。这样会带来三个问题：

1. 左侧预览卡片只在顶部出现，下面突然空掉，页面视觉重心断裂。
2. 保存位置面板变得过宽，路径、搜索框、最近使用都被拉长，显得空。
3. 备注区域独占一整行，进一步增加页面高度。

从代码结构看，原因在 `SaveTab.tsx`：

```tsx
<section className="page-grid">
  <PagePreviewCard />
  <div className="field-stack">
    标题
    URL
  </div>
</section>

<SaveLocationPicker />

<label className="note-field">备注</label>
```

`SaveLocationPicker` 和 `note-field` 被放在 `page-grid` 外面，所以它们天然会横跨整个表单宽度。

### 修改方向

把 Save Tab 改成一个真正的两列布局：

- 左列：预览卡片，占据保存页主体高度。
- 右列：标题、URL、保存位置、备注。

推荐结构：

```tsx
<form id="popup-save-form" className="save-tab" onSubmit={(event) => void save(event)}>
  <section className={`save-layout ${displayPreview ? "" : "without-preview"}`} aria-label="当前网页">
    {displayPreview ? (
      <aside className="save-preview-column">
        <PagePreviewCard ... />
      </aside>
    ) : null}

    <div className="save-editor-column">
      <div className="field-stack compact">
        <label>标题...</label>
        <label>URL...</label>
      </div>

      <SaveLocationPicker ... />

      <label className="note-field compact">
        <span>备注</span>
        <textarea ... />
      </label>
    </div>
  </section>
</form>
```

---

## 3. 设计目标

本次改造的目标不是把截图“稍微调好看一点”，而是让保存 Tab 具备稳定、可维护、可扩展的交互结构。

### 3.1 信息层级目标

保存页的主流程应该是：

```text
确认网页 → 确认标题 / URL → 选择保存位置 → 可选填写备注 → 保存
```

因此优先级应为：

1. 当前网页信息
2. 标题 / URL
3. 保存位置
4. 保存按钮
5. 备注

备注是辅助信息，不应该占据过强视觉权重。

### 3.2 视觉目标

整体风格应接近：

- 轻量
- 紧凑
- 清晰
- 有产品感
- 少一点“大表单”味道
- 多一点“快捷保存工具”味道

### 3.3 交互目标

必须完整支持 5 个关键状态：

1. 默认保存界面
2. 点击保存位置箭头 → 打开级联目录选择器
3. 点击搜索框 → 搜索文件夹
4. 点击新建文件夹按钮 → 行内创建文件夹
5. 点击最近使用展开按钮 → 展开更多最近位置

---

## 4. 推荐最终布局

### 4.1 默认状态布局

建议最终结构如下：

```text
┌──────────────────────────────────────────────────────────────┐
│ Header：Logo / 我的书签 / 打开完整管理页                       │
├──────────────────────────────────────────────────────────────┤
│ Tabs：保存 / 管理 / 设置                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────┐   标题                                    │
│  │               │   [ Attention Is All You Need           ] │
│  │   预览卡片     │                                           │
│  │               │   URL                                     │
│  │               │   [ https://arxiv.org/abs/1706.03762   ] │
│  │               │                                           │
│  │               │   保存位置                                │
│  │               │   ┌────────────────────────────────────┐  │
│  │               │   │ folder  AI Platform / Papers   >    │  │
│  │               │   └────────────────────────────────────┘  │
│  │               │   [ 搜索文件夹...                 + ]     │
│  │               │   最近使用  管理位置                      │
│  │               │   [AI Papers] [Read Later] [YouTube] [⌄] │
│  │               │                                           │
│  │               │   备注                                    │
│  │               │   [ 添加一点自己的上下文                ] │
│  └───────────────┘                                           │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ 快捷键 Ctrl+Shift+S                         取消   保存到 Papers │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 为什么这样更合理

- 左侧预览卡片形成稳定视觉锚点。
- 右侧形成完整保存流程。
- 保存位置不再横跨全宽，信息密度更合适。
- 备注被压到保存位置之后，符合低频辅助属性。
- 页面高度下降，不再像一个长表单。

---

## 5. 具体修改方案

---

## 5.1 修改 `src/popup/tabs/SaveTab.tsx`

### 当前问题

当前 `SaveLocationPicker` 和 `note-field` 在 `page-grid` 外部，导致它们占据全宽。

### 修改要求

把保存页主体改成一个两列布局：

- `save-layout`：整体两列容器
- `save-preview-column`：左侧预览
- `save-editor-column`：右侧表单流

### 建议代码结构

```tsx
export function SaveTab(...) {
  const displayPreview = showThumbnail;

  return (
    <form id="popup-save-form" className="save-tab" onSubmit={(event) => void save(event)}>
      <section className={`save-layout ${displayPreview ? "" : "without-preview"}`} aria-label="当前网页">
        {displayPreview ? (
          <aside className="save-preview-column">
            <PagePreviewCard
              details={pageDetails}
              previewFailed={previewFailed}
              setPreviewFailed={setPreviewFailed}
              title={title}
            />
          </aside>
        ) : null}

        <div className="save-editor-column">
          <div className="field-stack compact">
            <label>
              <span>标题</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>

            <label>
              <span>URL</span>
              <input
                className="url-input"
                value={pageDetails?.url ?? ""}
                readOnly
                onFocus={(event) => event.currentTarget.select()}
              />
            </label>
          </div>

          <SaveLocationPicker ... />

          <label className="note-field compact">
            <span>备注</span>
            <textarea
              value={note}
              placeholder="添加一点自己的上下文"
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
        </div>
      </section>
    </form>
  );
}
```

### 注意

不要继续使用旧的 `page-grid` 承载整个布局。可以保留 class 做兼容，但新结构建议使用 `save-layout`。

---

## 5.2 修改 `src/popup/styles.css`：整体布局

### 新增 / 替换布局样式

```css
.save-tab {
  min-height: 0;
}

.save-layout {
  display: grid;
  grid-template-columns: 168px minmax(0, 1fr);
  gap: 22px;
  align-items: start;
}

.save-layout.without-preview {
  grid-template-columns: minmax(0, 1fr);
}

.save-preview-column {
  min-width: 0;
}

.save-editor-column {
  display: grid;
  gap: 14px;
  min-width: 0;
}

.field-stack.compact {
  gap: 12px;
}
```

### 替换 preview 尺寸

当前 preview 太像一个孤立缩略图，建议改成更像左侧内容卡片。

```css
.page-preview {
  width: 168px;
  min-height: 360px;
  height: auto;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-muted);
}

.page-preview.has-image {
  height: 168px;
  min-height: 168px;
}

.page-preview.is-fallback {
  min-height: 360px;
}
```

如果当前很多页面只能拿到普通 OG 图，则不要强行把图片拉成论文卡片。图片态可以维持 168×168，fallback 态再做成长卡片。

### 输入框压缩

```css
input,
select {
  height: 42px;
  padding: 0 14px;
  font-size: 15px;
  font-weight: 600;
}

textarea {
  min-height: 76px;
  max-height: 96px;
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.45;
}
```

### Popup 内容区压缩

```css
.popup-content {
  min-height: 0;
  overflow: auto;
  padding: 18px 24px 0;
}
```

---

## 5.3 修改保存位置面板样式

### 当前问题

保存位置面板在全宽状态下显得过大。改成右栏之后仍然需要控制高度和层级。

### 建议样式

```css
.location-panel {
  display: grid;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #ffffff;
}

.location-heading {
  color: var(--body);
  font-size: 13px;
  font-weight: 800;
}
```

---

## 5.4 重做保存路径行：路径展示和箭头触发分离

### 当前问题

当前 `location-path-row` 是一个整体 `<button>`，点击路径任意地方都会打开级联菜单。

目标稿更合理的交互是：

- 路径本体只展示当前保存位置。
- 右侧箭头按钮才打开级联目录。

### 修改 `SaveLocationPicker.tsx`

把当前结构：

```tsx
<button className="location-path-row" ...>
  <FolderIcon />
  <span>{displayPath}</span>
  <span>当前位置</span>
  <ChevronRightIcon />
</button>
```

改成：

```tsx
<div className="location-path-row" title={formatPopupFolderPath(selectedPath, "") || undefined}>
  <span className="location-folder-icon">
    <FolderIcon />
  </span>

  <span className="path-display">{displayPath}</span>

  <span className="current-badge">当前位置</span>

  <button
    type="button"
    className={`location-arrow-button ${locationMenuOpen ? "is-open" : ""}`}
    aria-controls="save-location-picker"
    aria-expanded={locationMenuOpen}
    aria-haspopup="menu"
    aria-label="选择保存位置"
    onClick={() => (locationMenuOpen ? closeLocationMenu() : openLocationMenu())}
  >
    <ChevronRightIcon />
  </button>
</div>
```

### 配套 CSS

```css
.location-path-row {
  position: relative;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto 36px;
  gap: 9px;
  align-items: center;
  width: 100%;
  min-height: 48px;
  padding: 0 6px 0 12px;
  color: var(--body);
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #ffffff;
}

.location-path-row:focus-within {
  border-color: rgb(79 70 229 / 0.28);
  box-shadow: 0 0 0 3px rgb(79 70 229 / 0.1);
}

.location-arrow-button {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  color: var(--body);
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
}

.location-arrow-button:hover,
.location-arrow-button:focus-visible,
.location-arrow-button.is-open {
  color: var(--accent);
  border-color: rgb(79 70 229 / 0.22);
  background: var(--accent-soft);
  outline: none;
}

.location-arrow-button svg {
  width: 18px;
  height: 18px;
  transition: transform 150ms ease;
}

.location-arrow-button.is-open svg {
  transform: rotate(90deg);
}
```

---

## 5.5 级联目录浮层调整

### 当前问题

当前 `location-cascade-menu` 宽度较小，只像一个单列小菜单。目标稿希望有多列级联目录感。

但需要注意：Chrome popup 不适合真的让菜单无限往右飞出窗口。因此建议采用“popup 内浮层 + 内部级联”的适配方案。

### 修改方向

- 仍然复用 `FolderCascadeMenu`
- 菜单容器从箭头附近弹出
- 宽度适当增加
- 多级子菜单如果空间不足，则内部滚动或向左展开

### CSS 建议

```css
.location-cascade-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  left: auto;
  z-index: 60;
  width: 260px;
  max-height: 330px;
  padding: 6px;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  box-shadow: 0 18px 44px rgb(15 23 42 / 0.18);
  overscroll-behavior: contain;
  transform-origin: top right;
  animation: picker-in 140ms ease-out;
}
```

### 验收要求

- 当前路径各级高亮。
- 当前保存文件夹显示“当前位置”。
- 点击任意可保存文件夹后更新保存位置并关闭菜单。
- 鼠标跨层移动时不要闪退。
- 菜单不要撑破 popup 内容区。

---

## 5.6 搜索文件夹状态

### 当前问题

搜索框已经是原位搜索，这是正确方向。但搜索结果还需要更像目标稿：更清晰、更紧凑、更有层级。

### 修改要求

搜索输入后：

- 下方直接展示结果。
- 每条显示文件夹名 + 完整路径。
- 第一条可以标记“最佳匹配”。
- 点击结果后立即设置保存位置，并清空 query。

### 建议结构

```tsx
{query ? (
  <div className="folder-results" aria-label="文件夹搜索结果">
    {searchResults.length === 0 ? <p>没有匹配的文件夹</p> : null}
    {searchResults.map((option, index) => (
      <button
        key={option.id}
        type="button"
        className={option.id === selectedFolderId ? "is-selected" : ""}
        onClick={() => {
          setSelectedFolderId(option.id);
          setQuery("");
          closeLocationMenu();
        }}
      >
        <FolderIcon />
        <span className="folder-result-main">
          <strong>{option.title}</strong>
          <small>{formatPopupFolderPath(option.path, option.path)}</small>
        </span>
        {index === 0 ? <span className="result-badge">最佳匹配</span> : null}
      </button>
    ))}
  </div>
) : null}
```

### CSS 建议

```css
.folder-results {
  display: grid;
  gap: 4px;
  max-height: 154px;
  overflow: auto;
  padding: 2px;
}

.folder-results button {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  min-height: 42px;
  padding: 7px 9px;
  color: var(--body);
  text-align: left;
  border: 1px solid transparent;
  border-radius: 9px;
  background: #ffffff;
}

.folder-results button.is-selected,
.folder-results button:hover,
.folder-results button:focus-visible {
  color: var(--accent);
  border-color: rgb(79 70 229 / 0.2);
  background: var(--accent-soft);
  outline: none;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 7px;
  color: var(--accent);
  border-radius: 999px;
  background: var(--accent-soft);
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}
```

---

## 5.7 新建文件夹行内状态

### 当前问题

当前新建文件夹是：

```text
[输入框] [新建]
```

目标稿更像：

```text
[folder icon] [新建文件夹输入框........] [取消] [确认]
```

### 修改要求

点击搜索框右侧的新建按钮后：

- 在保存位置区域内部出现行内创建行。
- 搜索结果收起。
- 输入框自动聚焦。
- 回车确认。
- Esc 取消。
- 点击确认后创建文件夹，并自动选中新建文件夹。

### 建议 `SaveLocationPicker.tsx` 逻辑

点击新建按钮时：

```tsx
onClick={() => {
  setQuery("");
  setCreateOpen(!createOpen);
}}
```

输入框：

```tsx
<input
  value={folderName}
  placeholder={`新建在 ${selectedTitle || "当前文件夹"}`}
  onChange={(event) => setFolderName(event.target.value)}
  onKeyDown={(event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void createFolder();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setFolderName("");
      setCreateOpen(false);
    }
  }}
/>
```

### CSS 建议

```css
.create-folder-row {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) 36px 36px;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border: 1px solid rgb(79 70 229 / 0.22);
  border-radius: 10px;
  background: var(--accent-softer);
  animation: row-in 140ms ease-out;
}

.create-folder-row input {
  height: 38px;
  font-size: 14px;
}

.create-folder-row .create-action,
.create-folder-row .cancel-action {
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  font-weight: 800;
}

.create-folder-row .create-action {
  color: #ffffff;
  border: 1px solid var(--accent);
  background: var(--accent);
}

.create-folder-row .cancel-action {
  color: var(--muted);
  border: 1px solid var(--border);
  background: #ffffff;
}

@keyframes row-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 5.8 最近使用区域展开 / 收起

### 当前问题

当前最近使用只展示了很少内容，而且没有展开态。截图里只有一个 `Apply` chip，区域显得空。

### 修改要求

新增 `recentExpanded` 状态：

```tsx
const [recentExpanded, setRecentExpanded] = useState(false);
```

展示规则：

```tsx
const visibleRecentFolders = recentExpanded
  ? recentFolders.slice(0, 7)
  : recentFolders.slice(0, 3);
```

### 结构建议

```tsx
<div className="recent-row">
  <div className="recent-heading-row">
    <strong>最近使用</strong>
    <button type="button" onClick={() => void openWorkspace()}>管理位置</button>
  </div>

  {recentFolders.length === 0 ? (
    <p>{loading ? "正在读取文件夹..." : "保存成功后会显示最近位置"}</p>
  ) : (
    <div className={`recent-chips ${recentExpanded ? "is-expanded" : ""}`}>
      {visibleRecentFolders.map((option) => (
        <button key={option.id} type="button" onClick={() => { ... }}>
          <FolderIcon />
          <span>{option.title}</span>
        </button>
      ))}

      {recentFolders.length > 3 ? (
        <button
          type="button"
          className="recent-expand-button"
          aria-expanded={recentExpanded}
          onClick={() => setRecentExpanded(!recentExpanded)}
        >
          <ChevronRightIcon />
        </button>
      ) : null}
    </div>
  )}
</div>
```

### CSS 建议

```css
.recent-row {
  display: grid;
  gap: 8px;
}

.recent-heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.recent-chips {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) 38px;
  gap: 8px;
}

.recent-chips button:not(.recent-expand-button) {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 7px;
  min-width: 0;
  min-height: 40px;
  padding: 0 11px;
  color: var(--body);
  border: 1px solid var(--border);
  border-radius: 9px;
  background: #ffffff;
  font-size: 14px;
  font-weight: 700;
}

.recent-chips button span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-expand-button {
  display: inline-grid;
  place-items: center;
  min-height: 40px;
  color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 9px;
  background: #ffffff;
}

.recent-expand-button svg {
  width: 18px;
  height: 18px;
  transition: transform 150ms ease;
}

.recent-expand-button[aria-expanded="true"] svg {
  transform: rotate(-90deg);
}
```

### 注意

如果右栏宽度较窄，`grid-template-columns: repeat(3, 1fr) 38px` 可能太挤。可以改成 flex wrap：

```css
.recent-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recent-chips button:not(.recent-expand-button) {
  flex: 1 1 118px;
}
```

优先保证 chip 内部图标和文字紧凑，不要再出现图标和文字被拉得很远的问题。

---

## 5.9 修改 recent folders 数据上限

相关文件：`src/features/recent-folders/recentFolders.ts`

当前：

```ts
const MAX_RECENT_FOLDERS = 5;
```

建议改成：

```ts
const MAX_RECENT_FOLDERS = 8;
```

或者：

```ts
const MAX_RECENT_FOLDERS = 10;
```

原因：

- 默认展示 3 个
- 展开展示 7 个左右
- 底层只存 5 个会导致展开状态内容不够

同时修改 `PopupApp.tsx` 中对 recent folders 的裁切逻辑：

当前不应该在 `PopupApp.tsx` 里固定 `.slice(0, 3)`。应该传完整 recent folders 给 `SaveLocationPicker`，由 `SaveLocationPicker` 根据展开状态裁切。

---

## 5.10 Footer 修改建议

### 当前问题

底部现在有一个绿色 check 图标 + 快捷键提示。这个图标容易让人误以为已经保存成功。

### 修改方向

- 默认态使用更中性的快捷键提示。
- 保存成功后再使用绿色成功态。
- 快捷键文案不要散落硬编码。

### 建议

默认态：

```text
快捷键 Ctrl+Shift+S
```

成功态：

```text
已保存到 Apply
```

错误态：

```text
当前页面不支持保存
```

### 样式建议

```css
.popup-footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  min-height: 72px;
  padding: 12px 24px 16px;
  border-top: 1px solid var(--border);
  background: #ffffff;
}

.secondary-action,
.primary-action {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 850;
}

.primary-action {
  min-width: 176px;
}
```

---

## 5.11 Header 和 Tabs 压缩

当前 Header 的品牌感不错，但作为高频 popup，顶部仍可以更紧凑。

### 建议

```css
.popup-header {
  grid-template-columns: 44px minmax(0, 1fr) 38px;
  gap: 14px;
  padding: 16px 24px 12px;
}

.app-logo {
  width: 44px;
  height: 44px;
  border-radius: 11px;
}

.brand-block h1 {
  font-size: 20px;
}

.brand-block p {
  margin-top: 3px;
  font-size: 14px;
}

.popup-tabs button {
  min-height: 48px;
  font-size: 15px;
}
```

---

## 6. 组件拆分建议

当前 `SaveLocationPicker.tsx` 已经开始过重。为了长期维护，建议至少拆出以下子组件。

推荐目录：

```text
src/popup/components/save-location/
  SaveLocationPicker.tsx
  LocationPathRow.tsx
  FolderSearchRow.tsx
  FolderSearchResults.tsx
  InlineCreateFolderRow.tsx
  RecentFolderChips.tsx
```

### 6.1 `LocationPathRow`

职责：

- 展示当前路径
- 展示当前位置 badge
- 提供箭头按钮触发级联菜单

不负责：

- 搜索
- 新建
- 最近使用

### 6.2 `FolderSearchRow`

职责：

- 搜索输入框
- 新建文件夹按钮

不负责：

- 搜索结果渲染
- 创建逻辑本身

### 6.3 `FolderSearchResults`

职责：

- 展示搜索结果
- 点击结果后通知父级选中

### 6.4 `InlineCreateFolderRow`

职责：

- 行内输入
- 确认 / 取消
- Enter / Escape 快捷键

### 6.5 `RecentFolderChips`

职责：

- 默认展示 3 个
- 展开展示更多
- chip 点击切换保存位置

### 6.6 为什么要拆

不要把所有交互继续堆在一个文件里。现在保存位置选择器已经不是一个简单表单项，而是一个小型交互模块。拆分后：

- 更容易维护
- 更容易测试
- 更容易替换视觉
- 更容易复用到 Settings 或 Quick Save Dialog

---

## 7. 五个关键状态的具体要求

---

### 图 1：默认保存界面

#### 当前问题

最新版本已经把保存位置放到了备注前面，但因为保存位置和备注横跨全宽，页面还是偏散。

#### 修改后要求

- 左侧预览卡片贯穿主体高度。
- 右侧依次是标题、URL、保存位置、备注。
- 保存位置默认显示：`Bookmarks bar / Apply` 或实际当前路径。
- 最近使用默认只显示 3 个以内。
- 底部主按钮显示：`保存到 Apply`。

---

### 图 2：点击保存位置箭头 → 打开级联目录选择器

#### 当前问题

当前整行都能触发目录菜单。

#### 修改后要求

- 只有右侧箭头按钮触发。
- 级联菜单靠近箭头打开。
- 当前路径高亮。
- 当前保存文件夹显示 `当前位置`。
- 点击其他文件夹后更新路径并关闭菜单。

---

### 图 3：点击搜索框 → 搜索文件夹

#### 当前问题

搜索已经是原位搜索，但搜索结果视觉还需要精炼。

#### 修改后要求

- 输入 `paper` 后立即显示匹配结果。
- 每条结果显示文件夹名 + 完整路径。
- 不弹出额外对话框。
- 点击结果后选中保存位置并清空搜索。

---

### 图 4：点击新建文件夹按钮 → 行内创建文件夹

#### 当前问题

新建行还偏粗糙，确认 / 取消不够明确。

#### 修改后要求

- 新建行在保存位置面板内部展开。
- 输入框自动聚焦。
- 有取消按钮和确认按钮。
- Enter 确认，Esc 取消。
- 创建成功后自动选中新文件夹。

---

### 图 5：点击最近使用展开按钮 → 展开更多最近位置

#### 当前问题

当前没有展开态。

#### 修改后要求

- 默认显示 3 个最近位置。
- 展开后显示最多 7 个。
- 展开按钮旋转或切换方向。
- 展开后布局仍然整齐，不拉坏页面。

---

## 8. 阶段实施计划

### Phase 1：修正布局结构

优先级最高。

任务：

- 修改 `SaveTab.tsx` 为两列布局。
- `SaveLocationPicker` 和 `note-field` 放入右侧表单列。
- 调整 `.save-layout`、`.save-editor-column`、`.save-preview-column` 样式。
- 压缩 header、tabs、footer 的高度。

验收：

- 保存位置不再横跨全宽。
- 备注不再横跨全宽。
- 页面整体高度明显下降。
- 左右结构稳定。

---

### Phase 2：修正保存位置交互

任务：

- 路径展示和箭头按钮分离。
- 删除路径整行点击打开菜单的行为。
- 去掉 `onFocus={openLocationMenu}` 这种容易误触的逻辑。
- 搜索和新建状态互斥。
- 新建文件夹改为行内确认 / 取消。

验收：

- 只有箭头按钮打开目录菜单。
- 搜索、新建、目录菜单互不干扰。
- 新建文件夹体验接近目标稿。

---

### Phase 3：补最近使用展开态

任务：

- 增加 `recentExpanded` 状态。
- 默认显示 3 个，展开显示 7 个。
- 调整 recent folders 存储上限。
- recent chips 样式改为紧凑型。

验收：

- 图 5 能完整还原。
- chip 图标和文字紧凑。
- 多个 chip 不会造成布局错乱。

---

### Phase 4：视觉与动效统一

任务：

- 补箭头旋转。
- 补菜单淡入。
- 补新建行展开动画。
- 调整 hover / focus / selected 状态。
- Footer 默认态改成中性提示。

验收：

- 页面不再像普通工程表单。
- 交互反馈轻、稳、清晰。
- 样式状态统一。

---

## 9. 验收清单

### 布局验收

- [ ] 左侧预览卡片和右侧表单形成稳定两列。
- [ ] 保存位置不再横跨整个 popup。
- [ ] 备注不再横跨整个 popup。
- [ ] 页面高度不再明显超出，需要大幅滚动。
- [ ] 保存位置区域在默认首屏中清晰可见。

### 交互验收

- [ ] 只有箭头按钮可以打开保存位置级联菜单。
- [ ] 搜索框输入后原位显示搜索结果。
- [ ] 搜索结果点击后立即更新保存位置。
- [ ] 新建文件夹行内展开。
- [ ] 新建支持 Enter 确认、Esc 取消。
- [ ] 最近使用支持展开 / 收起。

### 视觉验收

- [ ] 输入框高度统一。
- [ ] 保存位置面板不显得过空。
- [ ] recent chip 图标和文字间距正常。
- [ ] Footer 不再过重。
- [ ] 默认快捷键提示不再像保存成功状态。

### 代码验收

- [ ] `SaveLocationPicker.tsx` 不继续无限膨胀。
- [ ] recent folders 数量限制不再阻碍展开态。
- [ ] 保存位置相关逻辑有清晰边界。
- [ ] 样式类命名能表达结构，不靠临时 patch。

---

## 10. 最终一句话方向

当前版本的问题不是“保存位置不够靠前”，而是**整个保存页还没有形成稳定的左右信息结构**。

下一步应该把页面改成：

> 左侧预览作为视觉锚点，右侧表单完成保存流程；保存位置选择器作为右侧核心模块，支持目录、搜索、新建、最近使用四种入口。

这样改完后，页面会更接近目标稿，也更符合 Chrome 扩展 popup 的真实使用场景。
