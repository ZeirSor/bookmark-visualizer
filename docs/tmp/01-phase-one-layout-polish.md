# 阶段一：先把保存 Tab 主面板做成图 3 的基础形态

## 阶段目标

不先处理复杂级联菜单，先把当前图 2 的“工程表单感”改成图 3 的“保存面板感”。这一阶段完成后，即使保存位置选择仍是搜索 + 最近使用，整体视觉也应接近目标稿。

## 1. 修改文件

主要修改：

- `src/popup/styles.css`
- `src/popup/main.tsx`
- `public/icons/icon-128.png` 或新增 CSS logo

可选新增：

- `src/popup/components/PagePreviewCard.tsx`
- `src/popup/components/PopupFooter.tsx`

## 2. 布局调整

### 2.1 固定 popup 框架

把当前：

```css
html,
body,
#root {
  width: 760px;
  min-height: 560px;
  overflow: hidden;
}

.popup-shell {
  width: 760px;
  max-height: 600px;
}

.save-tab {
  max-height: 420px;
  overflow: auto;
}
```

调整为更稳定的四段布局：

```css
html,
body,
#root {
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
  background: #ffffff;
}

.save-tab {
  min-height: 0;
  overflow: auto;
  padding: 22px 26px 0;
}
```

关键点：footer 不要再作为 `.save-tab` 内部 sticky，而应作为 popup shell 的第四行，避免主体滚动时底部状态区挤压内容。

### 2.2 Header 缩小并精致化

目标：更接近图 3，不要像图 2 那样过高。

建议：

```css
.popup-header {
  grid-template-columns: 52px 1fr 40px;
  gap: 16px;
  padding: 24px 28px 16px;
}

.app-logo {
  width: 52px;
  height: 52px;
  border-radius: 12px;
}

.brand-block h1 {
  font-size: 22px;
  line-height: 1.15;
  font-weight: 800;
}

.brand-block p {
  margin-top: 5px;
  font-size: 15px;
  font-weight: 600;
}
```

如果当前图片 logo 不好看，可以先不用换图，直接用 CSS 做一个临时 logo：

```tsx
<div className="app-logo-mark" aria-hidden="true"><span /></div>
```

```css
.app-logo-mark {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
}

.app-logo-mark span {
  width: 18px;
  height: 22px;
  border: 3px solid #fff;
  border-bottom: 0;
  border-radius: 2px 2px 0 0;
}
```

## 3. Tab 调整

当前 Tab 过高、字重偏重。建议：

```css
.popup-tabs button {
  min-height: 56px;
  gap: 10px;
  font-size: 16px;
  font-weight: 800;
}

.popup-tabs svg {
  width: 20px;
  height: 20px;
}

.popup-tabs button::after {
  height: 2px;
}
```

## 4. 表单内容调整

### 4.1 页面信息区

目标图 3 的预览图更像内容卡，不是大号 favicon。

建议把 `page-grid` 调整为：

```css
.page-grid {
  grid-template-columns: 172px minmax(0, 1fr);
  gap: 28px;
}

.page-preview {
  width: 172px;
  height: 172px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: #f8fafc;
}
```

同时在 `main.tsx` 里把预览拆成组件：

```tsx
<PagePreviewCard
  title={title}
  domain={pageDetails?.domain}
  previewImageUrl={pageDetails?.previewImageUrl}
/>
```

fallback 逻辑：

- `previewImageUrl` 加载成功且不是 favicon：显示图片。
- 加载失败或 favicon：显示 domain + title 的简洁卡片。

### 4.2 输入框字号

当前 input / textarea 20px 太大。调整为：

```css
input {
  height: 48px;
  padding: 0 16px;
  font-size: 16px;
  font-weight: 600;
}

textarea {
  min-height: 104px;
  padding: 14px 16px;
  font-size: 16px;
  font-weight: 500;
}

label > span {
  font-size: 14px;
  font-weight: 800;
}
```

## 5. 保存位置卡片基础形态

先不接级联菜单，只把外观改成图 3：

```css
.location-panel {
  padding: 14px 16px;
  gap: 12px;
  border-radius: 10px;
  border: 1px solid #dbe3f0;
}

.location-path-row {
  min-height: 54px;
  grid-template-columns: 28px minmax(0, 1fr) auto 40px;
  padding: 0 12px;
  border: 1px solid #dbe3f0;
  border-radius: 10px;
  background: #fff;
}
```

在 `SaveTab` 里给路径行增加 badge：

```tsx
<span className="current-badge">当前位置</span>
```

并新增路径格式化函数：

```ts
function formatPopupPath(path: string): string {
  return path.replace(/^Root\s\/\s/, "").replace(/^书签根目录\s\/\s/, "");
}
```

## 6. 删除或移动 auto-close-row

图 3 保存 Tab 不展示“保存后自动关闭浮窗”。把 `auto-close-row` 从 `SaveTab` 移到 `SettingsTab`，保留设置能力，但不要占用保存主流程空间。

## 7. Footer 重构

建议把 footer 移出 `SaveTab`，作为 `PopupApp` 内部稳定区域：

```text
<main className="popup-shell">
  <header />
  <nav />
  <section className="popup-content">...</section>
  <PopupFooter />
</main>
```

样式：

```css
.popup-footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  padding: 16px 26px 22px;
  border-top: 1px solid #edf1f7;
}

.secondary-action,
.primary-action {
  min-height: 50px;
  border-radius: 10px;
  font-size: 17px;
  font-weight: 900;
}

.primary-action {
  min-width: 190px;
  background: #4f46e5;
  border-color: #4f46e5;
}
```

## 8. 阶段一验收

- 页面视觉接近图 3 主卡片。
- 不再出现图 2 那种明显的整页粗滚动条。
- 保存 Tab 不显示 auto close checkbox。
- logo、header、tab、input、textarea 尺寸明显收敛。
- 路径显示不再出现 `Root /`。
- 保存、取消按钮位置稳定。
- `npm run typecheck` 通过。
