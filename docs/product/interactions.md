---
type: reference
status: active
scope: product
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Interactions

## Entry Interactions

- Clicking the toolbar icon opens `popup.html`.
- The browser extension command `_execute_action` opens the same popup.
- Optional page `Ctrl+S` bridge only calls `chrome.action.openPopup()` through background logic; it has no visible UI of its own.
- The full manager opens in `index.html`.
- New Tab opens in `newtab.html` only when the user enables the runtime setting.

## Save Interaction

- Popup opens on the configured default tab, normally Save.
- Save Tab shows current page title, read-only URL, optional preview image, notes and save location.
- Location selection uses inline folder tree search rather than a floating cascade menu.
- Esc inside folder search clears search first; outside search it follows popup/browser focus behavior.
- Creating a folder inside the picker selects the new folder after background creation succeeds.
- Save success shows feedback and may close the popup if `popupAutoCloseAfterSave` is enabled.
- Restricted browser pages are not injected; popup uses available tab title and URL context.

## Manager Interaction

- Folder tree selection updates the bookmark card grid.
- Breadcrumb items navigate to parent folders.
- Search shows matching bookmarks with path context.
- Bookmark cards open URLs by default unless selection or edit mode is active.
- Context menus support edit, create nearby, move and delete where valid.
- Drag operations must keep clear hover feedback and avoid moving protected root folders.

## New Tab Interaction

- Search treats URL-like input as direct navigation.
- Keyword input shows local bookmark suggestions and web search suggestions.
- Shortcuts and featured bookmarks open target URLs and record recent activity.
- Layout customization changes only New Tab presentation state.

## Undo Interaction

- Move, reorder, edit and delete actions should emit feedback.
- Undo restores the previous parent/index or previous editable values where possible.
- Delete undo recreates bookmarks and may receive a new native bookmark id; metadata continuity is best-effort.
