# Quick Save Core / Page Shortcut PageDoc

## Surface Status

Quick Save no longer owns a rendered content-script dialog. The active save UI is the toolbar popup. This folder now documents the remaining save protocol helpers and the optional page Ctrl+S bridge.

## Active Code Paths

| Responsibility | File |
|---|---|
| Save message protocol | `src/features/quick-save/types.ts` |
| Create-folder payload / normalization | `src/features/quick-save/createFolder.ts` |
| Folder defaults and recent folder filtering | `src/features/quick-save/folders.ts` |
| Legacy recent-folder state compatibility | `src/features/quick-save/uiState.ts` |
| Popup save client | `src/features/popup/popupClient.ts` |
| Background save handler | `src/background/quickSaveHandlers.ts` |
| Page shortcut message constants | `src/features/page-shortcut/message.ts` |
| Page shortcut optional-permission helper | `src/features/page-shortcut/access.ts` |
| Page shortcut content listener | `src/features/page-shortcut/content.ts` |
| Page shortcut background lifecycle | `src/background/pageShortcutHandlers.ts` |

## Runtime Flow

```text
Toolbar popup SaveTab
  → src/features/popup/popupClient.ts
  → QUICK_SAVE_CREATE_BOOKMARK / QUICK_SAVE_CREATE_FOLDER
  → src/background/messageRouter.ts
  → src/background/quickSaveHandlers.ts
  → chrome.bookmarks + chrome.storage.local metadata / recent folders
```

```text
Optional page Ctrl+S
  → settings.enablePageCtrlSShortcut
  → optional host permissions
  → dynamic page-shortcut-content.js
  → bookmark-visualizer.openPopupFromPageShortcut
  → chrome.action.openPopup()
```

## Boundaries

- Page shortcut code does not render UI, read page metadata, or create bookmarks.
- Popup remains the only current save UI.
- Browser internal pages are saved from popup as URL references and are not injected.
