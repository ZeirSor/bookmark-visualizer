---
type: reference
status: active
scope: frontend
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Current Code Alignment

This page records the current implementation shape for active UI surfaces.

## Active Entrypoints

```text
index.html
  → src/main.tsx
  → src/app/App.tsx
  → src/app/styles.css

popup.html
  → src/popup/main.tsx
  → src/popup/PopupApp.tsx
  → src/popup/styles.css

newtab.html
  → src/newtab/main.tsx
  → src/newtab/NewTabApp.tsx
  → src/newtab/styles.css

page-shortcut-content.js
  → src/features/page-shortcut/content.ts
  → src/background/pageShortcutHandlers.ts
  → chrome.action.openPopup()
```

## Current Save Path

- Toolbar click and `_execute_action` open `popup.html`.
- Popup Save Tab owns current-page save UI, folder picker, note input, create-folder action, and save status.
- `src/features/quick-save/types.ts`, `createFolder.ts`, `folders.ts`, and `uiState.ts` remain as the save message / folder helper layer used by popup and background.
- `src/background/messageRouter.ts` routes popup save messages to `src/background/quickSaveHandlers.ts`.
- Optional page Ctrl+S is default-off and only registers `page-shortcut-content.js` after optional host access is granted.

## Removed Legacy Surfaces

The independent save page, Save Overlay, and old Quick Save Shadow DOM dialog are no longer current implementation. Do not document them as active source paths.

## Maintenance Focus

- Popup PageDocs should track `src/popup/`, `src/features/popup/`, `src/features/page-shortcut/`, and shared folder picker components.
- Quick Save docs should describe the remaining save protocol / helper layer, not a content-script UI.
- Reference indexes should list only existing code paths unless a path is explicitly marked as planned or not current implementation.
