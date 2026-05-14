---
type: reference
status: active
scope: architecture
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Runtime Flows

## Toolbar Popup Save Flow

```text
Toolbar icon / _execute_action
→ popup.html
→ src/popup/main.tsx
→ src/popup/PopupApp.tsx
→ src/popup/tabs/SaveTab.tsx
→ src/features/popup/popupClient.ts
→ QUICK_SAVE_CREATE_BOOKMARK / QUICK_SAVE_CREATE_FOLDER
→ src/background/messageRouter.ts
→ src/background/quickSaveHandlers.ts
→ chrome.bookmarks + chrome.storage.local metadata / recent folders
```

## Page Ctrl+S Bridge Flow

```text
User enables settings.enablePageCtrlSShortcut
→ optional host permission request
→ src/background/pageShortcutHandlers.ts registers page-shortcut-content.js
→ src/features/page-shortcut/content.ts listens for Ctrl/Cmd+S
→ bookmark-visualizer.openPopupFromPageShortcut message
→ background opens toolbar popup through chrome.action.openPopup()
```

The bridge does not render UI, parse page content or create bookmarks.

## Manager Workspace Flow

```text
index.html
→ src/main.tsx
→ src/app/App.tsx
→ src/features/bookmarks/useBookmarks.ts
→ chrome.bookmarks tree
→ manager workspace components and shared components
```

Metadata reads and writes go through `src/features/metadata/metadataService.ts`; favicon resolution goes through `src/features/favicon/`.

## Optional New Tab Flow

```text
User enables newTabOverrideEnabled
→ service worker detects new tab navigation
→ src/features/newtab/newTabRedirect.ts
→ newtab.html
→ src/newtab/NewTabApp.tsx
```

New Tab remains opt-in and does not replace the manager workspace.

## Import / Export Flow

```text
Manager action
→ src/features/import-export/*
→ JSON / CSV / Netscape HTML parser or serializer
→ chrome.bookmarks and metadata compatibility layer
```

## Storage Flow

```text
chrome.bookmarks          native bookmark tree source of truth
chrome.storage.local      extension settings, metadata, recent folders
IndexedDB favicon cache   local favicon blobs and lookup metadata
```
