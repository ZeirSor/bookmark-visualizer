# Toolbar Popup 保存 Tab UI 细节

## SaveTab 布局

| 区块 | selector | 代码文件 | 说明 |
|---|---|---|---|
| 表单根 | `.save-tab` | `src/popup/tabs/SaveTab.tsx` | `id="popup-save-form"`，Footer submit 绑定这个 form |
| 保存布局 | `.save-layout` | `SaveTab.tsx` | 两列结构；隐藏预览时追加 `.without-preview` |
| 预览列 | `.save-preview-column` | `SaveTab.tsx` | 只在 `settings.popupShowThumbnail` 开启时显示 |
| 编辑列 | `.save-editor-column` | `SaveTab.tsx` | 标题 / URL / 备注 / 保存位置 |
| 字段组 | `.field-stack.compact` | `SaveTab.tsx` | 标题和 URL |
| 备注字段 | `.note-field.compact` | `SaveTab.tsx` | textarea |
| 字数提示 | `.note-label-row small` | `SaveTab.tsx` | 显示当前备注长度，例如 `0/200` |
| 内部页面说明 | `.save-info-banner` | `SaveTab.tsx` | `pageKind === "browser-internal"` 时说明浏览器内部页面可保存 |

## PagePreviewCard

| UI 元素 | selector | 代码文件 | 状态 |
|---|---|---|---|
| 卡片根 | `.page-preview` | `PagePreviewCard.tsx` | 页面预览卡容器 |
| loading skeleton | `.page-preview-skeleton` | `PagePreviewCard.tsx` | `loading` 时显示 |
| 图片 | `.page-preview img` | `PagePreviewCard.tsx` | `details.previewImageUrl` 可用且未失败 |
| fallback | `.page-preview-fallback` | `PagePreviewCard.tsx` | 无图或加载失败 |
| fallback 文章态 | `.is-article` | `PagePreviewCard.tsx` | 强化文本预览感 |
| 浏览器内部页面态 | `.page-preview.is-browser-internal` / `.browser-preview-window` | `PagePreviewCard.tsx` | `chrome://` / `edge://` 等页面显示内部页面 preview，不显示不可保存 |
| domain/date | `.preview-domain` / `.preview-date` | `PagePreviewCard.tsx` | 展示来源信息 |
| 文本骨架 | `.preview-copy-lines` | `PagePreviewCard.tsx` | fallback 视觉填充 |

维护重点：

- 不要让预览图失败导致整个保存表单高度跳动。
- `setPreviewFailed(true)` 后应回落到 fallback，不阻塞保存。
- 预览列关闭时 `.save-layout.without-preview` 要让编辑列填满宽度。

## 标题输入框

| 项 | 说明 |
|---|---|
| 代码 | `SaveTab.tsx` lines around title input |
| 数据 | `title` state，初始化自当前标签页标题 |
| 交互 | 用户可编辑，保存时传给 `createQuickSaveBookmark()` |
| selector | `.field-stack input` |
| 维护 | 标题为空时当前仍允许后续逻辑兜底；如要强制标题，需在 `PopupApp.save()` 校验 |

## URL 输入框

| 项 | 说明 |
|---|---|
| 代码 | `SaveTab.tsx` `.url-input` |
| 数据 | `pageDetails?.url` |
| 交互 | `readOnly`，focus 时 select 全部文本，便于复制 |
| selector | `.url-input` |
| 维护 | readonly 不要做 disabled 样式，否则可读性和选择行为会变差 |

## 备注 textarea

| 项 | 说明 |
|---|---|
| 代码 | `SaveTab.tsx` `.note-field` |
| 数据 | `note` state |
| 交互 | 输入后保存到 extension metadata，不写入 Chrome bookmark 原生字段 |
| selector | `.note-field textarea` |
| placeholder | `添加一点自己的上下文` |

## PopupFooter

| UI 元素 | selector | 代码文件 | 行为 |
|---|---|---|---|
| Footer 根 | `.popup-footer` | `PopupFooter.tsx` | 固定在 Popup 底部 |
| 状态文本 | `.status-line` | `PopupFooter.tsx` | 展示 `status` 和 `statusTone` |
| 取消按钮 | `.secondary-action` | `PopupFooter.tsx` | 关闭 Popup |
| 保存按钮 | `.primary-action` | `PopupFooter.tsx` | submit `popup-save-form` |

保存按钮禁用条件：

```text
canSave = Boolean(pageDetails?.canSave && selectedFolderId)
saving = true 时展示保存中态
```

## 保存链路

```text
用户点击 PopupFooter 保存
  → form submit
  → SaveTab.save(event)
  → PopupApp.save()
  → 校验 pageDetails.canSave / selectedFolderId
  → createQuickSaveBookmark({ parentId, title, url, note, previewImageUrl })
  → 更新 recentFolderIds
  → status success
  → 如 popupAutoCloseAfterSave，650ms 后 window.close()
```

## 保存 Tab 回归清单

- 当前页面不可保存时，Footer 主按钮 disabled，并显示 error 状态。
- 标题修改后保存使用新标题。
- URL readonly 可选中复制。
- 备注写入 metadata，管理页对应卡片显示“有备注”。
- 关闭预览图设置后，表单布局不塌陷。
- 图片加载失败后 fallback 可用，保存不受影响。
- `chrome://extensions/` 等浏览器内部页面显示可保存说明，保存按钮不因 page kind 灰掉。
