# Code Navigation Index

## Entry / Build

| File | Notes |
|---|---|
| `index.html` | Manager workspace HTML entry |
| `popup.html` | Toolbar popup HTML entry, referenced by `action.default_popup` |
| `newtab.html` | Optional New Tab Portal entry |
| `public/manifest.json` | MV3 manifest, popup, service worker, commands, permissions |
| `vite.config.ts` | Multi-entry build plus `page-shortcut-content.js` bundle |
| `src/main.tsx` | Manager React mount |
| `src/popup/main.tsx` | Popup React mount |
| `src/newtab/main.tsx` | New Tab React mount |
| `src/service-worker.ts` | Service worker build entry |

## Popup Save

| File | Notes |
|---|---|
| `src/popup/PopupApp.tsx` | Toolbar popup shell and tab composition |
| `src/popup/hooks/usePopupBootstrap.ts` | Initial state, settings, page details, bookmark tree |
| `src/popup/hooks/usePopupSaveActions.ts` | Save, create folder, settings writes, page shortcut setting |
| `src/popup/tabs/SaveTab.tsx` | Save UI |
| `src/popup/tabs/SettingsTab.tsx` | Settings UI, including page Ctrl+S switch |
| `src/popup/components/SaveLocationPicker.tsx` | Save location composition |
| `src/components/folder-picker/InlineFolderPicker.tsx` | Shared inline folder picker |
| `src/features/popup/popupClient.ts` | Tab details and quick-save message client |
| `src/features/popup/tabDetails.ts` | Page kind and saveability normalization |

## Page Shortcut

| File | Notes |
|---|---|
| `src/features/page-shortcut/content.ts` | Optional Ctrl+S listener; no UI |
| `src/features/page-shortcut/message.ts` | Message constants and guards |
| `src/features/page-shortcut/access.ts` | Optional permission request and sync helper |
| `src/background/pageShortcutHandlers.ts` | Dynamic content script registration and popup open handler |

## Quick Save Core

| File | Notes |
|---|---|
| `src/features/quick-save/types.ts` | Save message protocol |
| `src/features/quick-save/createFolder.ts` | Create-folder payload helpers |
| `src/features/quick-save/folders.ts` | Folder default and recent-folder helpers |
| `src/features/quick-save/uiState.ts` | Legacy recent-folder compatibility facade |
| `src/background/quickSaveHandlers.ts` | Bookmark/folder creation, metadata, recent folders |

## Manager / New Tab / Shared

| File | Notes |
|---|---|
| `src/app/App.tsx` | Manager workspace shell |
| `src/app/workspace/WorkspaceContent.tsx` | Manager content rendering |
| `src/app/workspace/WorkspaceComponents.tsx` | Dialogs, menus, toasts, shortcut settings dialog |
| `src/newtab/NewTabApp.tsx` | Optional New Tab shell |
| `src/features/newtab/newTabRedirect.ts` | Runtime New Tab redirect |
| `src/components/BookmarkCard.tsx` | Manager bookmark card |
| `src/components/FolderTree.tsx` | Manager tree |
| `src/components/FolderCascadeMenu.tsx` | Shared cascade menu for manager move flows |
| `src/features/settings/settingsService.ts` | Settings read/write and normalize |
| `src/features/metadata/metadataService.ts` | Bookmark metadata storage |
| `src/features/recent-folders/recentFolders.ts` | Shared recent folders storage |
| `src/lib/chrome/*` | Chrome API adapters |
