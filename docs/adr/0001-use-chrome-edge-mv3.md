# ADR 0001: 第一版使用 Chrome / Edge Manifest V3

## 状态

已接受

## 背景

目标产品需要读取和修改当前浏览器书签树，并以浏览器扩展形式提供可视化管理界面。Chrome 和 Edge 共享 Chromium 扩展基础，Manifest V3 是当前主线扩展模型。

## 决策

第一版只支持 Chrome / Edge，采用 Manifest V3。

## 替代方案

- 同时支持 Firefox：需要额外兼容 `browser.*` API、权限差异和测试矩阵。
- 使用普通 Web 应用：无法直接访问浏览器原生书签。

## 后果

- 第一版工程复杂度较低。
- 可以优先使用 `chrome.bookmarks`、`chrome.storage` 和 `chrome.permissions`。
- Firefox 兼容留到长期路线图。
