---
type: reference
status: active
scope: product
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Requirements

## Product Goal

Bookmark Visualizer 是 Chrome / Edge MV3 扩展，用于可视化、搜索、保存和管理浏览器原生书签。浏览器书签树仍是书签数据的单一事实源；扩展只补充备注、设置、最近文件夹、favicon cache 和后续增强元数据。

## Current Entry Requirements

- Toolbar icon opens `popup.html`; this is the primary save entry.
- `_execute_action` uses the browser extension command, normally `Ctrl+Shift+S` / `Command+Shift+S`, and opens the same toolbar popup.
- `index.html` is the full manager workspace and is opened from product links, popup manage tab, new tab actions or direct extension URL.
- `newtab.html` is optional and only becomes active when the user enables New Tab binding.
- Page `Ctrl+S` / `Command+S` is optional, default-off, and only opens the toolbar popup through the page shortcut bridge. It does not render a content-script dialog and does not create bookmarks directly.
- Browser internal pages such as `chrome://`, `edge://`, extension pages and file URLs may be saved as URL references from popup when available, but they are not injected for page metadata.

## Save Requirements

- Popup Save Tab auto-fills the current page title and URL when tab information is available.
- The URL is displayed as read-only context; user-editable content includes title, notes, thumbnail URL visibility and save location.
- Save location uses `InlineFolderPicker` with tree browsing, search, recent folders and create-folder support.
- Save creates a native browser bookmark through the background save handler.
- Notes and preview image URL are stored in extension metadata keyed by bookmark id.
- Recent folders are stored in shared recent-folder state.
- Save success may show feedback and may auto-close popup according to settings.

## Manager Requirements

- Manager shows the browser bookmark folder tree and current folder bookmark cards.
- Users can search bookmarks by title, URL and existing notes.
- Users can create, edit, move, reorder and delete bookmarks where Chrome bookmarks API allows it.
- Users can create, rename and move writable folders. Browser-managed root folders remain protected.
- Drag and drop supports moving bookmarks to folders and reordering bookmarks inside writable folders.
- Destructive actions require confirmation and should write an operation log where undo is supported.

## New Tab Requirements

- New Tab binding is opt-in and stays disabled after first install or migration unless the user enables it.
- New Tab supports mixed web/bookmark search, pinned shortcuts, selected bookmark groups, recent activity and quick actions.
- New Tab is a portal, not a compact version of the full manager workspace.

## Settings Requirements

- Settings include default popup tab, default save folder, popup auto-close behavior, save feedback, thumbnail visibility, page Ctrl+S bridge switch, New Tab binding, search defaults, layout mode and visual preferences.
- Optional host permissions must be requested only after explicit user action.

## Summary and AI Requirements

- Manual notes are current implementation.
- Page summary and AI summary remain future enhancements.
- Future summary collection must be user-triggered and permission-aware; the extension must not read page body content in the background by default.

## Non-functional Requirements

- Native bookmark writes must be real Chrome bookmarks API operations.
- Active docs and code paths must stay aligned; deleted save surfaces must remain archived.
- Large bookmark trees should remain usable through search, lazy rendering decisions and constrained suggestion lists.
- All failure states must show understandable user feedback.
