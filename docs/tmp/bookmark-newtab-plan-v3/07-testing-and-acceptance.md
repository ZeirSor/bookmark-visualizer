# 07. 测试与验收清单

## 1. 单元测试

### settingsService

文件：`src/features/settings/settingsService.test.ts`

覆盖：

```text
旧 settings 缺少 newTab 字段时补默认值
newTabOverrideEnabled 默认 false
非法 newTabDefaultSearchCategory 回退 web
非法 newTabLayoutMode 回退 standard
newTabShortcutsPerRow 限制在 4–10
```

### newTabState

文件：`src/features/newtab/newTabState.test.ts`

覆盖：

```text
loadNewTabState 无数据时返回 defaultNewTabState
pinnedShortcuts 非法 URL 被过滤或降级
数组过长被截断
version 缺失时 normalize 到 version 1
saveNewTabState 会写入 storageAdapter
```

### searchEngines

文件：`src/features/newtab/searchEngines.test.ts`

覆盖：

```text
Google Web / Image / News / Video / Maps URL 正确 encode
未知 engine 回退 Google
未知 category 回退 Web
中文关键词 encode 正确
```

### mixedSearch

文件：`src/features/newtab/mixedSearch.test.ts`

覆盖：

```text
本地书签结果优先于网络搜索建议
合法 URL 生成 URL 直达建议
固定快捷方式匹配加权
最近访问匹配加权
空 query 不返回建议
```

### newTabRedirect

文件：`src/features/newtab/newTabRedirect.test.ts`

用 mock chrome 测试：

```text
开关关闭时不调用 chrome.tabs.update
开关开启且 URL 为 chrome://newtab/ 时跳转 newtab.html
普通 https 页面不跳转
已是 newtab.html 不重复跳转
onCreated 和 onUpdated 不会造成循环
```

## 2. 现有测试需要调整

### manifest.test

当前测试名是：

```text
does not override the browser new tab page
```

建议改成：

```text
does not use static chrome_url_overrides for new tab because binding is runtime-toggleable
```

断言继续保持：

```ts
expect(manifest.chrome_url_overrides).toBeUndefined();
```

新增断言：

```ts
expect(existsSync(resolve(root, "newtab.html"))).toBe(true);
expect(manifest.permissions).toContain("tabs");
```

## 3. 构建验收

```bash
npm run typecheck
npm test
npm run build
```

构建后检查：

```text
dist/newtab.html 存在
dist/assets/newtab-*.js 存在
dist/service-worker.js 存在
dist/manifest.json 不包含 chrome_url_overrides
```

## 4. 手动验收：New Tab 开关

### 默认关闭

```text
1. 安装扩展
2. 打开 popup → 设置
3. 确认“绑定新标签页”默认关闭
4. 点击浏览器 +
5. 应显示浏览器默认 New Tab
```

### 开启绑定

```text
1. 打开 popup → 设置
2. 开启“绑定新标签页”
3. 点击浏览器 +
4. 应跳转到 Bookmark Visualizer newtab.html
5. 页面显示搜索框、固定快捷方式、书签分组、最近活动
```

### 关闭绑定

```text
1. 打开 popup → 设置
2. 关闭“绑定新标签页”
3. 点击浏览器 +
4. 应恢复浏览器默认 New Tab
```

## 5. 手动验收：搜索

```text
1. 打开 New Tab
2. 点击页面搜索框
3. 输入 prompt
4. 应出现“本地书签”和“网络搜索”两组建议
5. ↑↓ 能移动选中项
6. Enter 打开选中项
7. Esc 关闭建议
8. 切换 图片 / 新闻 / 视频 / 地图 后搜索 URL 正确变化
```

## 6. 手动验收：快捷方式

```text
1. 页面显示固定快捷方式
2. 点击快捷方式在当前 tab 打开
3. Ctrl / Cmd + 点击在新 tab 打开
4. 添加网站能新增快捷方式
5. 移除固定后刷新仍不显示
6. 空状态下有添加入口或推荐入口
```

## 7. 手动验收：书签分组

```text
1. 页面展示 4–5 个书签分组
2. 每个分组显示数量与简介
3. 点击分组后显示该分组精选书签或预览
4. 点击“查看全部”打开完整管理页
5. 如果实现 folderId deep link，管理页应定位到对应文件夹
```

## 8. 手动验收：右侧面板

```text
1. 最近活动展示最近打开 / 保存 / 固定的项目
2. 无活动时显示空状态，不报错
3. 快捷操作包含：打开管理页、新建书签、导入 HTML、自定义布局
4. 不出现“保存当前标签页”
```

## 9. 兼容与边界

```text
隐身窗口：默认不要求重定向，除非用户允许扩展在隐身模式运行
Edge：可识别 edge://newtab/
首次安装：不应自动接管 New Tab
storage 异常：页面降级显示默认布局
书签读取失败：显示错误空状态和“打开管理页”
大量书签：搜索建议限制 8–12 条，避免面板过长
```

## 10. 性能验收

```text
New Tab 首屏渲染目标：主 UI 先出现，再补充书签数据
不要在 render 中递归全树
搜索建议 debounce 80–120ms
派生 ViewModel 使用 useMemo
Activity 和 usage stats 有上限
```

## 11. 可访问性验收

```text
搜索框有 aria-label
建议面板使用 role=listbox / option 或可等价访问结构
键盘可完成搜索、打开和关闭
按钮有 aria-label
颜色不能只靠色彩表达选中状态
```
