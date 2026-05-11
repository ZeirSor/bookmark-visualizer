# Popup 管理 Tab 与设置 Tab

## ManageTab

文件：`src/popup/tabs/ManageTab.tsx`

### UI 元素

| 元素 | selector | 行为 |
|---|---|---|
| 管理入口卡 | `.manager-hero-card` | 完整管理页入口，右侧 icon button 打开工作台 |
| 搜索命令行 | `.manager-search-row` / `.manager-search-command` / `.manager-filter-button` | 轻量搜索 / 筛选入口，点击进入完整管理页 |
| 快捷操作卡 | `.manager-action-grid` / `.manager-action-card` | 左图标 + 主文案 + 辅助文案 + 右箭头，点击执行对应动作 |
| 入口图标 | `.manager-hero-icon` / `.manager-entry-icon` | 统一入口图标容器 |
| 入口文案 | `.manager-entry-copy` | 主标题 + 描述 |
| 入口箭头 | `.manager-entry-chevron` | 右侧跳转提示 |
| 最近保存 section | `.popup-section` | 展示 `recentBookmarks` |
| 最近保存列表 | `.recent-bookmark-list` | 每项点击 `window.open(bookmark.url)` |
| favicon / fallback | `.recent-bookmark-favicon` / `.site-favicon-fallback` | 优先本地 favicon，失败时使用 domain 首字母 |
| 最近保存主文案 | `.recent-bookmark-main` | 标题 + domain / folder path |
| 最近使用文件夹 | `.folder-card-grid` | 点击打开完整管理页并 deep link 到对应文件夹 |
| 底部操作区 | `.popup-footer.popup-footer-utility` | Manage 显示完整管理页主动作，Settings 显示完成动作 |
| 空态 | `.empty-copy` | 无数据时说明保存或选择位置后会出现内容 |

数据链路：

```text
PopupApp
  → recentBookmarks = deriveRecentSavedBookmarks(tree, 3)
  → recentFolders = recentFolderIds.map(folderOptionMap.get)
  → <ManageTab recentBookmarks recentFolders />
```

维护建议：最近使用文件夹 chip 已通过 `index.html?folderId=...` deep link 到完整管理页对应文件夹。Manage Tab 不应扩展成完整管理器，只保留轻入口、最近信息和跳转动作。

## SettingsTab 总览

文件：`src/popup/tabs/SettingsTab.tsx`

SettingsTab 是 Popup 的常用配置入口，包含：

1. 新标签页设置。
2. 快捷键说明。
3. 默认保存位置。
4. 保存行为。
5. 界面偏好。
6. 打开高级设置。

## 新标签页设置

| UI | 代码 | 写入字段 |
|---|---|---|
| 绑定新标签页 SwitchRow | `SwitchRow` | `settings.newTabOverrideEnabled` |
| 默认搜索引擎 SelectRow / CustomSelect | `SEARCH_ENGINES` | `settings.newTabDefaultSearchEngineId` |
| 默认搜索类型 SelectRow / CustomSelect | `SEARCH_CATEGORIES` | `settings.newTabDefaultSearchCategory` |
| 布局模式 SelectRow / CustomSelect | hardcoded options | `settings.newTabLayoutMode` |

维护重点：

- `newTabOverrideEnabled` 默认必须是 `false`。
- 搜索引擎列表来自 `src/features/newtab/searchEngines.ts`，不要在 SettingsTab 里复制另一份。
- 新增搜索类型时要同时改 `SettingsState`、`SEARCH_CATEGORIES`、`buildSearchUrl()`、New Tab UI。

## 快捷键 section

| UI | 当前状态 |
|---|---|
| 保存当前网页 | 展示 `Ctrl+Shift+S` |
| 打开完整管理页 | 展示“未设置” |
| 配置快捷键 | 点击 `openExtensionShortcutSettings()`，打开 `chrome://extensions/shortcuts` 并关闭 Popup |

真实 command 在 `public/manifest.json`：

```json
"_execute_action": {
  "suggested_key": {
    "default": "Ctrl+Shift+S",
    "mac": "Command+Shift+S"
  }
}
```

当前主入口快捷键实际由 Manifest V3 特殊命令 `_execute_action` 打开 action popup；上方 legacy command 如存在，不应保留 suggested key。

## 默认保存位置

### UI 元素

| 元素 | selector | 行为 |
|---|---|---|
| 控件根 | `.default-folder-control` | 默认保存位置选择器、展开 picker、最近位置 chips |
| 路径选择按钮 | `.folder-path-selector` | 展示当前默认路径，点击展开 / 收起内联 picker |
| 文件夹图标 | `.location-folder-icon` | 共享图标视觉 |
| 路径文本 | `.folder-path-selector-copy small[title]` | hover title 展示完整路径 |
| 更改状态 | `.folder-path-selector-action` | 显示“更改”或“收起” |
| 内联 picker 展开块 | `.default-folder-picker-expanded` | section 内全宽块，不与按钮重叠 |
| 内联 picker | `.default-folder-picker-expanded .inline-folder-picker` | 内部渲染共享 `InlineFolderPicker` |
| 最近位置 chips | `.settings-mini-chips` | 点击直接设为默认保存位置 |

### 数据链路

```text
SettingsTab 更改默认位置
  → updateDefaultFolder(folder.id)
  → usePopupSaveActions.updateDefaultFolder(folderId)
  → setSelectedFolderId(folderId)
  → updateSettings({ popupDefaultFolderId: folderId })
  → saveSettings()
  → storageAdapter.set(bookmarkVisualizerSettings)
```

## 保存行为 section

| UI | 字段 | 说明 |
|---|---|---|
| 保存后自动关闭浮窗 | `popupAutoCloseAfterSave` | 成功保存后 650ms close |
| 保存后显示成功提示 | `popupShowSuccessToast` | 控制 status success 文案 |
| 记住上次保存位置 | `popupRememberLastFolder` | 影响初始保存位置选择 |
| 显示网页缩略图 | `popupShowThumbnail` | 控制 SaveTab 预览列 |

## 界面偏好 section

| UI | 字段 |
|---|---|
| 默认打开页 | `popupDefaultOpenTab` |
| 主题 | `popupThemeMode` |

维护重点：`popupThemeMode` 当前只作为设置状态持久化，用于后续 Popup 主题适配。当前 Popup 视觉仍主要使用默认浅色 token；不要把它描述成已完整生效的暗色主题能力。若要真正影响 Popup，需要在 `src/popup/main.tsx` 或 `PopupApp` 中增加 theme class / data attribute，并在 `popup/styles.css` 提供暗色变量映射。

## 内部小组件

| 组件 | 文件 | 说明 |
|---|---|---|
| `SwitchRow` | `src/popup/tabs/settings/SettingsRows.tsx` | label + `role="switch"` 控件；写入布尔 settings |
| `SettingsSection` | `src/popup/tabs/settings/SettingsRows.tsx` | 设置卡片 section 结构，支持 section icon，标题和 rows 在同一卡片内 |
| `SettingRow` | `src/popup/tabs/settings/SettingsRows.tsx` | label / helper text / control 行结构；使用统一高度、间距和分割线 |
| `Keycap` | `src/popup/tabs/settings/SettingsRows.tsx` | 快捷键 pill |
| `Switch` | `src/popup/tabs/settings/SettingsRows.tsx` | 44×26 track + 20×20 thumb；支持鼠标、Space、Enter 和 focus-visible |
| `SelectRow` / `CustomSelect` | `src/popup/tabs/settings/SettingsRows.tsx` | 非原生下拉外观；使用 down chevron、checkmark、click、Esc、外部点击、ArrowUp / ArrowDown、Enter / Space |
| `DefaultFolderMenu` | `src/popup/tabs/settings/DefaultFolderMenu.tsx` | 默认保存位置内联 picker、最近位置 chips |
