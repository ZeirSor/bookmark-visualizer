# 回归验收清单

## 通用构建检查

```bash
npm run typecheck
npm test
npm run build
npm run verify:save-window-entry
```

若本地环境因 esbuild / sandbox 权限导致测试失败，应记录具体错误，不要把失败误写成通过。

## 管理页回归

### 读取与导航

- 打开 `index.html` 能读取书签树。
- 左侧树展开 / 收起全部可用。
- 显示树内书签开关生效并持久化。
- 点击文件夹后中央内容更新。
- 面包屑点击上级后可保留尾路径，再点击其它入口时清除尾路径。
- `index.html?folderId=...` 能选中文件夹。
- `index.html?bookmarkId=...` 能跳转父文件夹并高亮卡片。

### 卡片

- 四种卡片尺寸都不破版。
- 点击卡片打开书签。
- 点击打开 icon 只打开，不触发编辑。
- 点击更多 icon 打开菜单。
- 标题 / URL / 备注行内编辑保存成功。
- Esc 取消行内编辑。
- 备注保存后显示“有备注” chip。
- 星标按钮保持 disabled。
- 书签卡片使用本地 favicon cache；默认不再请求 `https://www.google.com/s2/favicons`。

### 拖拽 / 菜单

- 卡片拖到左侧文件夹可移动。
- 卡片在同文件夹内可重排。
- 搜索结果模式不能重排。
- 右键移动菜单可搜索文件夹。
- 长文件夹名不导致图标错位。
- 多级 cascade 不被裁剪。
- 文件夹拖拽移动合法目标可用，非法目标不可用。

### 批量选择

- 批量操作按钮进入 selection mode。
- 卡片出现 checkbox。
- 点击卡片切换选中，不打开网页。
- 无选中时删除 disabled。
- 有选中时删除弹确认。
- 批量删除后 selection 清空，operation log 说明不可撤回。

### 反馈

- 操作成功出现 toast。
- 可撤回操作能撤回。
- 操作日志抽屉可打开 / 关闭。
- Escape 按优先级关闭浮层，然后退出 selection mode。

## Popup 回归

- Popup 大小为 780×600，无横向滚动。
- 默认 Tab 根据 `popupDefaultOpenTab` 显示。
- 保存 Tab 能读取当前页面标题 / URL。
- 标题可编辑，URL readonly 可选中。
- 备注可输入。
- 预览图关闭设置生效。
- 保存位置路径行 loading / disabled 状态正确。
- 点击路径文本不打开菜单，点击箭头打开菜单。
- 级联菜单不被 popup 裁剪。
- 搜索文件夹原位显示，最多 4 条。
- 新建文件夹显示 spinner，创建成功后选中新文件夹。
- 最近位置默认 3 个，可展开到 7 个。
- 保存成功后按设置自动关闭。
- Manage Tab 最近保存和最近位置空态正常。
- Settings Tab 修改 New Tab 开关 / 搜索引擎 / 搜索类型 / 布局模式后持久化。

## New Tab 回归

- 默认不接管浏览器新标签页。
- Popup 设置开启后，新建标签页跳转 `newtab.html`。
- 关闭设置后恢复浏览器默认新标签页。
- incognito 不 redirect。
- 搜索框 autofocus / focus 按钮可用。
- 输入 URL 显示直接打开建议。
- 输入关键词显示本地书签、文件夹、网络搜索建议。
- 切换搜索引擎和分类后搜索 URL 正确。
- 添加网站后 shortcut 出现。
- 快速访问、精选书签、文件夹预览和有 URL 的最近活动优先显示真实 favicon。
- 刷新 New Tab 后，已缓存 favicon 能先于远程刷新显示；失败或离线时字母 fallback 不引发布局跳动。
- 隐藏 shortcut 后不再出现。
- 点击 shortcut / featured 记录最近活动。
- standard / sidebar / tabs 三种布局可切换。
- 自定义布局抽屉和添加 shortcut 对话框层级正确。

## Quick Save 回归

- 快捷键触发内容脚本浮框。
- 不支持注入的页面给出 fallback 或打开管理页提示。
- 重复触发不会创建多个浮框。
- Shadow DOM 样式不受网页影响。
- 点击遮罩关闭。
- Tab 焦点陷阱正常。
- Ctrl/Cmd+S 保存，Escape 关闭。
- 搜索文件夹、最近文件夹、浏览文件夹均可选择保存位置。
- 新建文件夹后自动选中新文件夹。
- 保存成功 700ms 后关闭。

## Shared 组件回归

改动 `FolderCascadeMenu` 必须同时验收：

1. 管理页右键移动。
2. 保存窗口 / Popup fallback 保存位置级联菜单。
3. Popup Settings 默认保存位置菜单。
4. Quick Save 浏览文件夹。

改动 `src/styles/tokens.css` 必须同时验收：

1. 管理页 light / dark。
2. 保存窗口 / Popup fallback 保存 Tab。
3. New Tab 首屏。
4. Quick Save 不受影响，因为它使用 Shadow DOM 独立 CSS。
