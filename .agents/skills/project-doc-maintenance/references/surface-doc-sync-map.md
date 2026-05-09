# Surface Doc Sync Map

Use this map when running `project-doc-maintenance` to determine which PageDocs should be checked after code changes.

## Manager Workspace

### Code areas

- `index.html`
- `src/app/`
- `src/app/workspace/`
- `src/features/bookmarks/`
- `src/features/search/`
- `src/features/settings/`
- `src/components/`
- `src/styles/`

### Docs to check

- `docs/frontend/surfaces/manager/README.md`
- `docs/frontend/surfaces/manager/01-layout-ui-map.md`
- `docs/frontend/surfaces/manager/02-component-catalog.md`
- `docs/frontend/surfaces/manager/03-interactions-data-flow.md`
- `docs/frontend/surfaces/manager/04-css-design-tokens.md`
- `docs/frontend/surfaces/shared/`
- `docs/frontend/surfaces/reference/`
- `docs/product/ui-design.md`
- `docs/product/interactions.md`

## Toolbar Popup / Page Shortcut

### Code areas

- `popup.html`
- `src/popup/`
- `src/features/popup/`
- `src/features/page-shortcut/`
- `src/background/pageShortcutHandlers.ts`
- `src/features/settings/`
- `src/components/`
- `src/styles/`

### Docs to check

- `docs/frontend/surfaces/popup/README.md`
- `docs/frontend/surfaces/popup/01-save-tab-ui-map.md`
- `docs/frontend/surfaces/popup/02-location-picker-flow.md`
- `docs/frontend/surfaces/popup/03-settings-and-manage-tab.md`
- `docs/frontend/surfaces/popup/04-css-maintenance.md`
- `docs/frontend/surfaces/shared/`
- `docs/frontend/surfaces/reference/`
- `docs/product/interactions.md`
- `docs/product/ui-design.md`

## Quick Save

### Code areas

- `src/features/quick-save/`
- `src/background/quickSaveHandlers.ts`
- `src/background/messageRouter.ts`
- content script entry files
- `src/lib/chrome/`
- `src/styles/`

### Docs to check

- `docs/frontend/surfaces/quick-save/README.md`
- `docs/frontend/surfaces/quick-save/01-dialog-ui-and-shadow-dom.md`
- `docs/frontend/surfaces/quick-save/02-injection-and-background-flow.md`
- `docs/frontend/surfaces/quick-save/03-css-and-shadow-dom.md`
- `docs/frontend/surfaces/shared/`
- `docs/data/storage.md`
- `docs/architecture/overview.md`
- `docs/architecture/module-boundaries.md`

## Optional New Tab

### Code areas

- `newtab.html`
- `src/newtab/`
- `src/features/newtab/`
- `src/features/settings/`
- `src/features/newtab/newTabRedirect.ts`
- `src/lib/chrome/`
- `src/styles/`

### Docs to check

- `docs/frontend/surfaces/newtab/README.md`
- `docs/frontend/surfaces/newtab/01-layout-search-shortcuts.md`
- `docs/frontend/surfaces/newtab/02-settings-state-and-redirect-flow.md`
- `docs/frontend/surfaces/newtab/03-css-maintenance.md`
- `docs/frontend/surfaces/shared/`
- `docs/data/storage.md`
- `docs/product/requirements.md`
- `docs/product/interactions.md`
- `README.md`
- `README.zh-CN.md`

## Shared Components And UI Primitives

### Code areas

- `src/components/`
- `src/styles/`
- shared folder picker / cascade menu components
- shared button, input, icon, toast, modal, menu, and card primitives

### Docs to check

- `docs/frontend/surfaces/shared/01-shared-components.md`
- `docs/frontend/surfaces/shared/03-folder-cascade-menu.md`
- `docs/frontend/surfaces/shared/04-icons-and-ui-primitives.md`
- `docs/frontend/surfaces/reference/01-code-navigation-index.md`
- `docs/frontend/surfaces/reference/02-ui-element-index.md`

Also check every surface that consumes the changed shared component.

## Data, Metadata, Storage

### Code areas

- `src/lib/chrome/`
- `src/features/metadata/`
- `src/features/settings/`
- storage key constants or services
- import / export services

### Docs to check

- `docs/data/storage.md`
- `docs/architecture/module-boundaries.md`
- `docs/frontend/surfaces/shared/02-data-storage-and-chrome-api.md`

Also check affected surface docs if the data is displayed, edited, searched, saved, imported, or exported through a UI.

## Manifest, Permissions, Background

### Code areas

- `public/manifest.json`
- `src/background/`
- `src/lib/chrome/`
- popup / quick-save / newtab runtime message clients

### Docs to check

- `docs/architecture/overview.md`
- `docs/architecture/module-boundaries.md`
- `docs/data/storage.md`
- affected PageDocs surface
- `docs/product/requirements.md`
- `README.md`
- `README.zh-CN.md`

## Documentation Structure

### Doc / workflow areas

- `docs/`
- `README.md`
- `README.zh-CN.md`
- `.agents/skills/project-doc-routing/`
- `.agents/skills/project-doc-maintenance/`
- `.agents/skills/project-run-orchestration/`
- `.agents/skills/project-playbook-routing/`
- `.agents/skills/project-validation-gate/`
- `.ai/README.md`
- `.ai/runs/_TEMPLATE/`
- `docs/workflow/`
- `docs/playbooks/`
- `AGENTS.md`

### Docs to check

- `docs/README.md`
- `docs/standards/documentation-maintenance.md`
- `docs/workflow/README.md`
- `docs/playbooks/README.md`
- relevant directory README files
- root README Documentation links
- skill references
- `AGENTS.md`
