---
type: reference
status: active
scope: data
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Domain Model

## Bookmark Records

`src/domain/bookmark-record/` normalizes native bookmark nodes into project-level records for table views, search and UI rendering. Native bookmark id, parent id, title, URL and index come from `chrome.bookmarks`.

## Folder Records

`src/domain/folder-record/` represents folder nodes and tree relationships. Browser-managed root folders are treated as protected where Chrome APIs disallow mutation.

## Metadata

`src/features/metadata/` stores extension-only fields such as notes, summary placeholders, preview image URL and future enrichment values. Metadata must not replace native bookmark fields.

## Tags and Table View

`src/domain/tag-record/` and `src/domain/table-view/` are domain abstractions for future richer organization and table-like projections. They should remain optional layers over native bookmarks.

## Activity

`src/domain/activity/` represents user-facing recent operations and activity entries. Undo-sensitive actions should record enough context to explain or reverse the action where possible.
