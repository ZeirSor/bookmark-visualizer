---
type: reference
status: active
scope: data
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Data

本目录维护当前数据模型、浏览器存储边界、导入导出格式和数据迁移注意事项。

## Reading Order

1. [Storage](storage.md)
2. [Domain model](domain-model.md)
3. [Import and export](import-export.md)

## Source of Truth

- Native bookmarks live in `chrome.bookmarks`.
- Extension-only metadata lives in `chrome.storage.local`.
- Favicon cache lives in IndexedDB.
- Historical phase plans are archived in `docs/_archive/data/`.
