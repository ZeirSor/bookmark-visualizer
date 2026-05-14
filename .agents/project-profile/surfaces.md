# Project Surface Map

This profile file maps Bookmark Visualizer surfaces, runtime helpers, code areas, and formal docs. Portable skills should use this file for project-specific routing.

## Active User-Facing Surfaces

| Surface | Entry | Primary docs |
|---|---|---|
| Manager Workspace | `index.html` | `docs/frontend/surfaces/manager/` |
| Toolbar Popup | `popup.html` | `docs/frontend/surfaces/popup/` |
| Optional New Tab | `newtab.html` | `docs/frontend/surfaces/newtab/` |

## Runtime Helpers, Not UI Surfaces

| Helper | Code | Current role |
|---|---|---|
| Page Shortcut Bridge | `src/features/page-shortcut/content.ts`, `src/background/pageShortcutHandlers.ts` | Optional page listener that asks the background to open the toolbar popup. |
| Save Protocol / Quick Save Helpers | `src/features/quick-save/`, `src/background/quickSaveHandlers.ts`, `src/background/messageRouter.ts` | Shared save/folder helper logic used by popup/background flows; no content-script overlay UI. |

Historical `save.html`, Save Overlay, and Shadow DOM Quick Save dialog docs are archived under `docs/_archive/` and must not be routed as current implementation docs.

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
- `docs/frontend/surfaces/manager/layout-ui-map.md`
- `docs/frontend/surfaces/manager/component-catalog.md`
- `docs/frontend/surfaces/manager/interactions-data-flow.md`
- `docs/frontend/surfaces/manager/css-design-tokens.md`

Likely affected after work:

- `docs/frontend/surfaces/manager/`
- `docs/frontend/surfaces/shared/`
- `docs/frontend/surfaces/reference/`
- `docs/product/ui-design.md`
- `docs/product/interactions.md`

README impact: only when major workspace capabilities, project structure, installation, or public feature descriptions change.

## Toolbar Popup

Code areas:

- `popup.html`
- `src/popup/`
- `src/features/popup/`
- `src/features/settings/`
- `src/components/`
- `src/styles/`

Read before work:

- `docs/frontend/surfaces/popup/README.md`
- `docs/frontend/surfaces/popup/save-tab-ui-map.md`
- `docs/frontend/surfaces/popup/location-picker-flow.md`
- `docs/frontend/surfaces/popup/settings-manage-tab.md`
- `docs/frontend/surfaces/popup/css-maintenance.md`

Likely affected after work:

- `docs/frontend/surfaces/popup/`
- `docs/frontend/surfaces/shared/`
- `docs/frontend/surfaces/reference/`
- `docs/product/interactions.md`
- `docs/product/ui-design.md`
- `docs/architecture/runtime-flows.md` if entry or message flow changes

README impact: when popup launch behavior, page shortcut behavior, optional host permissions, major save capability, or public project overview changes.

## Popup Save Location Picker / Folder Selection

Code areas:

- `src/popup/components/SaveLocationPicker.tsx`
- `src/popup/components/save-location/`
- `src/popup/tabs/settings/DefaultFolderMenu.tsx`
- `src/components/folder-picker/`
- `src/features/popup/`
- `src/styles/`

Read before work:

- `docs/frontend/surfaces/popup/location-picker-flow.md`
- `docs/frontend/surfaces/shared/folder-cascade-menu.md`
- `docs/frontend/surfaces/reference/ui-element-index.md`

Likely affected after work:

- `docs/frontend/surfaces/popup/location-picker-flow.md`
- `docs/frontend/surfaces/shared/folder-cascade-menu.md`
- `docs/frontend/surfaces/popup/css-maintenance.md`
- `docs/frontend/surfaces/reference/ui-element-index.md`

## Page Shortcut Bridge

Code areas:

- `src/features/page-shortcut/`
- `src/background/pageShortcutHandlers.ts`
- `src/background/serviceWorker.ts`
- `public/manifest.json`
- `src/lib/chrome/`

Read before work:

- `docs/architecture/runtime-flows.md`
- `docs/architecture/module-boundaries.md`
- `docs/frontend/surfaces/popup/README.md`
- `docs/product/interactions.md`

Likely affected after work:

- `docs/architecture/runtime-flows.md`
- `docs/architecture/module-boundaries.md`
- `docs/product/requirements.md`
- `docs/product/interactions.md`
- `docs/quality/popup-entry-health-check.md`

## Save Protocol / Quick Save Helpers

Code areas:

- `src/features/quick-save/`
- `src/background/quickSaveHandlers.ts`
- `src/background/messageRouter.ts`
- `src/features/popup/popupClient.ts`
- `src/features/popup/saveSource.ts`
- `src/lib/chrome/`

Read before work:

- `docs/architecture/runtime-flows.md`
- `docs/architecture/module-boundaries.md`
- `docs/data/storage.md`
- `docs/frontend/surfaces/popup/README.md`
- `docs/frontend/surfaces/popup/location-picker-flow.md`

Likely affected after work:

- `docs/architecture/runtime-flows.md`
- `docs/architecture/module-boundaries.md`
- `docs/data/storage.md`
- `docs/frontend/surfaces/popup/`
- `docs/product/interactions.md`

README impact: only if public save behavior, shortcut behavior, host permissions, or entrypoint behavior changes.

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
- `docs/frontend/surfaces/newtab/layout-search-shortcuts.md`
- `docs/frontend/surfaces/newtab/settings-state-redirect-flow.md`
- `docs/frontend/surfaces/newtab/css-maintenance.md`

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
- `src/components/folder-picker/`
- `src/components/folder-cascade/`
- shared button, input, icon, toast, modal, menu, and card primitives

Read before work:

- `docs/frontend/surfaces/shared/shared-components.md`
- `docs/frontend/surfaces/shared/folder-cascade-menu.md`
- `docs/frontend/surfaces/shared/icons-ui-primitives.md`
- `docs/frontend/surfaces/reference/ui-element-index.md`

Likely affected after work:

- `docs/frontend/surfaces/shared/`
- every surface that consumes the changed component
- `docs/frontend/surfaces/reference/`

## Data, Metadata, Storage

Code areas:

- `src/lib/chrome/`
- `src/features/metadata/`
- `src/features/settings/`
- `src/domain/`
- storage key constants or services
- import / export services

Read before work:

- `docs/data/storage.md`
- `docs/data/domain-model.md`
- `docs/data/import-export.md`
- `docs/frontend/surfaces/shared/data-storage-chrome-api.md`

Likely affected after work:

- `docs/data/storage.md`
- `docs/data/domain-model.md`
- `docs/data/import-export.md`
- `docs/architecture/module-boundaries.md`
- `docs/frontend/surfaces/shared/data-storage-chrome-api.md`
- affected surface docs if the data is displayed, edited, searched, saved, imported, or exported through UI.

## Manifest, Permissions, Background

Code areas:

- `public/manifest.json`
- `src/background/`
- `src/lib/chrome/`
- popup runtime clients
- page shortcut message clients
- New Tab redirect clients

Read before work:

- `docs/architecture/overview.md`
- `docs/architecture/module-boundaries.md`
- `docs/architecture/runtime-flows.md`
- `docs/product/requirements.md`
- `docs/quality/validation-gate.md`

Likely affected after work:

- `docs/architecture/overview.md`
- `docs/architecture/module-boundaries.md`
- `docs/architecture/runtime-flows.md`
- `docs/data/storage.md`
- affected surface docs
- `docs/product/requirements.md`
- `README.md`
- `README.zh-CN.md`
