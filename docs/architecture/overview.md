---
type: reference
status: active
scope: architecture
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Architecture Overview

Bookmark Visualizer is a Chrome / Edge MV3 extension built with React, TypeScript and Vite. It keeps native browser bookmarks as the source of truth and layers local extension metadata on top.

## Runtime Entries

| Entry | File | Role |
|---|---|---|
| Toolbar popup | `popup.html` → `src/popup/main.tsx` | Primary save / manage / settings entry. |
| Manager workspace | `index.html` → `src/main.tsx` | Full bookmark management workspace. |
| Optional New Tab | `newtab.html` → `src/newtab/main.tsx` | Runtime-toggleable portal. |
| Service worker | `src/service-worker.ts` | Background message routing, bookmark writes, page shortcut lifecycle and New Tab redirect. |
| Page shortcut listener | `src/features/page-shortcut/content.ts` | Optional bridge that opens toolbar popup. |

## Data Ownership

- Browser bookmark tree: `chrome.bookmarks`, native source of truth.
- Extension metadata: `chrome.storage.local`, maintained by `src/features/metadata/`.
- Settings: `chrome.storage.local`, maintained by `src/features/settings/`.
- Recent folders: `bookmarkVisualizerRecentFolders`, maintained by `src/features/recent-folders/`.
- Favicon cache: IndexedDB, maintained by `src/features/favicon/`.

## Current Save Boundary

The only current save UI is the toolbar popup. The quick-save feature directory contains the shared message contract and helper functions used by popup and background handlers. Page shortcut code may open the popup but must not become another save UI.

## Removed Save Surfaces

Independent save page, content-script Save Overlay and legacy Shadow DOM Quick Save dialog are archived. They must not be reintroduced as current paths without a new ADR.
