# Project Surface Map

This profile file maps Bookmark Visualizer surfaces to code areas and formal docs. Portable skills should use this file for project-specific routing.

## Manager Workspace

Code areas:

- `index.html`
- `src/app/`
- `src/app/workspace/`
- `src/features/bookmarks/`
- `src/features/search/`
- `src/features/settings/`
- `src/components/`
- `src/styles/`

Read before work:

- `docs/frontend/surfaces/manager/README.md`
- `docs/frontend/surfaces/manager/01-layout-ui-map.md`
- `docs/frontend/surfaces/manager/02-component-catalog.md`
- `docs/frontend/surfaces/manager/03-interactions-data-flow.md`
- `docs/frontend/surfaces/manager/04-css-design-tokens.md`

Likely affected after work:

- `docs/frontend/surfaces/manager/`
- `docs/frontend/surfaces/shared/`
- `docs/frontend/surfaces/reference/`
- `docs/product/ui-design.md`
- `docs/product/interactions.md`

README impact: only when major workspace capabilities, project structure, installation, or public feature descriptions change.

## Toolbar Popup / Page Shortcut

Code areas:

- `popup.html`
- `src/popup/`
- `src/features/popup/`
- `src/features/page-shortcut/`
- `src/background/pageShortcutHandlers.ts`
- `src/features/settings/`
- `src/components/`
- `src/styles/`

Read before work:

- `docs/frontend/surfaces/popup/README.md`
- `docs/frontend/surfaces/popup/01-save-tab-ui-map.md`
- `docs/frontend/surfaces/popup/02-location-picker-flow.md`
- `docs/frontend/surfaces/popup/03-settings-and-manage-tab.md`
- `docs/frontend/surfaces/popup/04-css-maintenance.md`

Likely affected after work:

- `docs/frontend/surfaces/popup/`
- `docs/frontend/surfaces/shared/`
- `docs/frontend/surfaces/reference/`
- `docs/product/interactions.md`
- `docs/product/ui-design.md`

README impact: when popup launch behavior, page shortcut behavior, optional host permissions, major save capability, or public project overview changes.

## Popup Save Location Picker / Folder Cascade

Code areas:

- `src/popup/`
- `src/features/popup/`
- `src/components/`
- folder cascade menu components
- `src/styles/`

Read before work:

- `docs/frontend/surfaces/popup/02-location-picker-flow.md`
- `docs/frontend/surfaces/shared/03-folder-cascade-menu.md`
- `docs/frontend/surfaces/reference/02-ui-element-index.md`

Likely affected after work:

- `docs/frontend/surfaces/popup/02-location-picker-flow.md`
- `docs/frontend/surfaces/shared/03-folder-cascade-menu.md`
- `docs/frontend/surfaces/popup/04-css-maintenance.md`
- `docs/frontend/surfaces/reference/02-ui-element-index.md`

## Quick Save

Code areas:

- `src/features/quick-save/`
- `src/background/quickSaveHandlers.ts`
- `src/background/messageRouter.ts`
- content script entry files
- `src/lib/chrome/`
- `src/styles/`

Read before work:

- `docs/frontend/surfaces/quick-save/README.md`
- `docs/frontend/surfaces/quick-save/01-dialog-ui-and-shadow-dom.md`
- `docs/frontend/surfaces/quick-save/02-injection-and-background-flow.md`
- `docs/frontend/surfaces/quick-save/03-css-and-shadow-dom.md`

Likely affected after work:

- `docs/frontend/surfaces/quick-save/`
- `docs/frontend/surfaces/shared/`
- `docs/data/storage.md`
- `docs/architecture/overview.md`
- `docs/architecture/module-boundaries.md`

README impact: only if public quick-save behavior, shortcut behavior, or permissions change.

## Optional New Tab

Code areas:

- `newtab.html`
- `src/newtab/`
- `src/features/newtab/`
- `src/features/settings/`
- `src/features/newtab/newTabRedirect.ts`
- `src/lib/chrome/`
- `src/styles/`

Read before work:

- `docs/frontend/surfaces/newtab/README.md`
- `docs/frontend/surfaces/newtab/01-layout-search-shortcuts.md`
- `docs/frontend/surfaces/newtab/02-settings-state-and-redirect-flow.md`
- `docs/frontend/surfaces/newtab/03-css-maintenance.md`

Likely affected after work:

- `docs/frontend/surfaces/newtab/`
- `docs/frontend/surfaces/shared/`
- `docs/data/storage.md`
- `docs/product/requirements.md`
- `docs/product/interactions.md`
- `README.md`
- `README.zh-CN.md`

README impact: when New Tab entry behavior, default behavior, settings, or public feature description changes.

## Shared Components And UI Primitives

Code areas:

- `src/components/`
- `src/styles/`
- shared folder picker / cascade menu components
- shared button, input, icon, toast, modal, menu, and card primitives

Read before work:

- `docs/frontend/surfaces/shared/01-shared-components.md`
- `docs/frontend/surfaces/shared/03-folder-cascade-menu.md`
- `docs/frontend/surfaces/shared/04-icons-and-ui-primitives.md`
- `docs/frontend/surfaces/reference/02-ui-element-index.md`

Likely affected after work:

- `docs/frontend/surfaces/shared/`
- every surface that consumes the changed component
- `docs/frontend/surfaces/reference/`

## Data, Metadata, Storage

Code areas:

- `src/lib/chrome/`
- `src/features/metadata/`
- `src/features/settings/`
- storage key constants or services
- import / export services

Likely affected after work:

- `docs/data/storage.md`
- `docs/architecture/module-boundaries.md`
- `docs/frontend/surfaces/shared/02-data-storage-and-chrome-api.md`
- affected surface docs if the data is displayed, edited, searched, saved, imported, or exported through UI.

## Manifest, Permissions, Background

Code areas:

- `public/manifest.json`
- `src/background/`
- `src/lib/chrome/`
- popup / quick-save / newtab runtime message clients

Likely affected after work:

- `docs/architecture/overview.md`
- `docs/architecture/module-boundaries.md`
- `docs/data/storage.md`
- affected PageDocs surface
- `docs/product/requirements.md`
- `README.md`
- `README.zh-CN.md`
