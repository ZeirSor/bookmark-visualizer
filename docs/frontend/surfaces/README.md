# Frontend Surfaces

This directory documents active UI surfaces and shared UI contracts.

| Surface | Entry | Main code | Style | Status |
|---|---|---|---|---|
| Manager workspace | `index.html` | `src/app/App.tsx` | `src/app/styles.css` | Full bookmark management workspace |
| Toolbar popup | `popup.html` | `src/popup/PopupApp.tsx` | `src/popup/styles.css` | Current save / manage / settings entry |
| Optional New Tab | `newtab.html` | `src/newtab/NewTabApp.tsx` | `src/newtab/styles.css` | Runtime-toggleable new tab portal |
| Page Ctrl+S bridge | `page-shortcut-content.js` | `src/features/page-shortcut/content.ts` + `src/background/pageShortcutHandlers.ts` | none | Optional listener that opens the popup |

## Current Save Surface

The active save UI is the toolbar popup. It uses:

- `src/popup/tabs/SaveTab.tsx`
- `src/popup/components/SaveLocationPicker.tsx`
- `src/components/folder-picker/`
- `src/features/popup/popupClient.ts`
- `src/background/quickSaveHandlers.ts`

The removed independent save page, Save Overlay, and legacy Quick Save dialog are historical, not current implementation.
