# 数据与存储

## 数据源原则

浏览器原生书签树是唯一书签结构数据源。插件不得维护一份可以独立决定文件夹结构的副本。

## 原生书签数据

来自 `chrome.bookmarks` API：

- `id`
- `parentId`
- `index`
- `title`
- `url`
- `children`
- `dateAdded`
- `dateGroupModified`
- `dateLastUsed`
- `unmodifiable`

有 `url` 的节点视为书签；没有 `url` 且有 children 的节点视为文件夹。

## 插件元数据

保存在 `chrome.storage.local`：

```json
{
  "metadataVersion": 1,
  "bookmarkMetadata": {
    "<bookmarkId>": {
      "note": "用户手动备注",
      "summary": "网页 description 或未来 AI 摘要",
      "summarySource": "manual | meta-description | ai",
      "updatedAt": 1760000000000
    }
  },
  "folderUiState": {
    "<folderId>": {
      "expanded": true
    }
  },
  "settings": {
    "showBookmarksInTree": false,
    "theme": "light",
    "cardDensity": "comfortable",
    "cardSize": "medium",
    "sidebarWidth": 280
  }
}
```

当前实现已经落地 `bookmarkVisualizerMetadata` 和 `bookmarkVisualizerSettings` 两个 storage key：

- `bookmarkVisualizerMetadata`：保存 `metadataVersion` 和 `bookmarkMetadata`，当前只写入手动备注。
- `bookmarkVisualizerSettings`：保存 `showBookmarksInTree`、`theme`、`cardDensity`、`cardSize`、`sidebarWidth`。

当前操作日志只保存在页面运行时内存中，用于本次会话撤回移动、编辑、删除等操作；它不是持久化审计日志，刷新新标签页后会清空。

## 导出和导入

导出内容只包含插件元数据和设置，不导出原生书签树。

导入时：

- 只应用仍然存在的 bookmarkId 和 folderId。
- 不存在的节点记录为跳过项。
- 导入前应提示用户这会覆盖本地备注、摘要和 UI 设置。

## 数据迁移

所有持久化数据必须带版本号。未来修改结构时通过 migration 逐步升级，不允许在运行时散落兼容逻辑。

## 隐私

- 备注和摘要默认只保存在本地。
- 摘要抓取只有用户主动触发时才访问网页。
- 不上传书签树和备注到远程服务。
