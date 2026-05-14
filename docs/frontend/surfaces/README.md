---
type: reference
status: active
scope: frontend
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Frontend Surfaces

This directory documents active UI surfaces and shared UI contracts.

| Surface | Entry | Main code | Style | Status |
|---|---|---|---|---|
| Manager workspace | `index.html` | `src/app/App.tsx` | `src/app/styles.css` | Full bookmark management workspace |
| Toolbar popup | `popup.html` | `src/popup/PopupApp.tsx` | `src/popup/styles.css` | Current save / manage / settings entry |
| Optional New Tab | `newtab.html` | `src/newtab/NewTabApp.tsx` | `src/newtab/styles.css` | Runtime-toggleable new tab portal |

## Non-rendered Runtime Helpers

| Helper | Main code | Responsibility |
|---|---|---|
| Page Ctrl+S bridge | `src/features/page-shortcut/content.ts`, `src/background/pageShortcutHandlers.ts` | Optional listener that opens toolbar popup. |
| Save protocol helpers | `src/features/quick-save/`, `src/background/quickSaveHandlers.ts` | Message contracts and bookmark creation helpers used by popup. |

## Current Save Surface

The active save UI is the toolbar popup. It uses `src/popup/tabs/SaveTab.tsx`, `src/popup/components/SaveLocationPicker.tsx`, `src/components/folder-picker/`, `src/features/popup/popupClient.ts` and `src/background/quickSaveHandlers.ts`.

Removed save surfaces are archived in `docs/_archive/frontend/`.

## Reference Docs

- [Code navigation index](reference/code-navigation-index.md)
- [UI element index](reference/ui-element-index.md)
- [Regression checklist](reference/regression-checklist.md)
- [Docs/code alignment notes](reference/docs-code-alignment-2026-05-08.md)
- [Component inventory](reference/component-inventory.md)
- [Token audit](reference/token-audit.md)
- [Token ownership](reference/token-ownership.md)
- [CSS hardcode policy](reference/css-hardcode-policy.md)
- [Token exceptions](reference/token-exceptions.md)
- [Component state matrix](reference/component-state-matrix.md)
