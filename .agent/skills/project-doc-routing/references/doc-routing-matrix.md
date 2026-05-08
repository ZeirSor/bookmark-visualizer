# Documentation Routing Matrix

Use this matrix with the `project-doc-routing` skill. It maps task types to docs that should be read before work and docs that may need updates after work.

This matrix routes context only. It does not replace `project-doc-maintenance`.

## Global Documentation Map

| Area | Primary docs |
|---|---|
| Product scope, behavior, roadmap | `docs/product/` |
| Architecture, runtime flow, module boundaries | `docs/architecture/` |
| Storage, metadata, persistence | `docs/data/` |
| Page-level UI and code chains | `docs/frontend/surfaces/` |
| Validation and QA | `docs/guides/` |
| Documentation standards | `docs/standards/` |
| AI development workflow | `docs/workflow/` |
| Reusable task execution manuals | `docs/playbooks/` |
| Durable decisions | `docs/adr/` |
| Public onboarding | `README.md`, `README.zh-CN.md` |

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

### Read before work

- `docs/frontend/surfaces/manager/README.md`
- `docs/frontend/surfaces/manager/01-layout-ui-map.md`
- `docs/frontend/surfaces/manager/02-component-catalog.md`
- `docs/frontend/surfaces/manager/03-interactions-data-flow.md`
- `docs/frontend/surfaces/manager/04-css-design-tokens.md`

### Likely affected after work

- `docs/frontend/surfaces/manager/`
- `docs/frontend/surfaces/shared/`
- `docs/frontend/surfaces/reference/`
- `docs/product/ui-design.md`
- `docs/product/interactions.md`

### README impact

Usually no README update unless the task changes major workspace capabilities, project structure, installation, or public feature descriptions.

## Toolbar Popup

### Code areas

- `popup.html`
- `src/popup/`
- `src/features/popup/`
- `src/features/settings/`
- `src/components/`
- `src/styles/`

### Read before work

- `docs/frontend/surfaces/popup/README.md`
- `docs/frontend/surfaces/popup/01-save-tab-ui-map.md`
- `docs/frontend/surfaces/popup/02-location-picker-flow.md`
- `docs/frontend/surfaces/popup/03-settings-and-manage-tab.md`
- `docs/frontend/surfaces/popup/04-css-maintenance.md`

### Likely affected after work

- `docs/frontend/surfaces/popup/`
- `docs/frontend/surfaces/shared/`
- `docs/frontend/surfaces/reference/`
- `docs/product/interactions.md`
- `docs/product/ui-design.md`

### README impact

Update README files only when popup launch behavior, major save capability, or public project overview changes.

## Popup Save Location Picker / Folder Cascade

### Code areas

- `src/popup/`
- `src/features/popup/`
- `src/components/`
- folder cascade menu components
- `src/styles/`

### Read before work

- `docs/frontend/surfaces/popup/02-location-picker-flow.md`
- `docs/frontend/surfaces/shared/03-folder-cascade-menu.md`
- `docs/frontend/surfaces/reference/02-ui-element-index.md`

### Likely affected after work

- `docs/frontend/surfaces/popup/02-location-picker-flow.md`
- `docs/frontend/surfaces/shared/03-folder-cascade-menu.md`
- `docs/frontend/surfaces/popup/04-css-maintenance.md`
- `docs/frontend/surfaces/reference/02-ui-element-index.md`

## Quick Save

### Code areas

- `src/features/quick-save/`
- `src/background/quickSaveHandlers.ts`
- `src/background/messageRouter.ts`
- content script entry files
- `src/lib/chrome/`
- `src/styles/`

### Read before work

- `docs/frontend/surfaces/quick-save/README.md`
- `docs/frontend/surfaces/quick-save/01-dialog-ui-and-shadow-dom.md`
- `docs/frontend/surfaces/quick-save/02-injection-and-background-flow.md`
- `docs/frontend/surfaces/quick-save/03-css-and-shadow-dom.md`

### Likely affected after work

- `docs/frontend/surfaces/quick-save/`
- `docs/frontend/surfaces/shared/`
- `docs/data/storage.md`
- `docs/architecture/overview.md`
- `docs/architecture/module-boundaries.md`

### README impact

Update README files only if the public quick-save behavior, shortcut behavior, or permissions change.

## Optional New Tab

### Code areas

- `newtab.html`
- `src/newtab/`
- `src/features/newtab/`
- `src/features/settings/`
- `src/background/newTabRedirect.ts`
- `src/lib/chrome/`
- `src/styles/`

### Read before work

- `docs/frontend/surfaces/newtab/README.md`
- `docs/frontend/surfaces/newtab/01-layout-search-shortcuts.md`
- `docs/frontend/surfaces/newtab/02-settings-state-and-redirect-flow.md`
- `docs/frontend/surfaces/newtab/03-css-maintenance.md`

### Likely affected after work

- `docs/frontend/surfaces/newtab/`
- `docs/frontend/surfaces/shared/`
- `docs/data/storage.md`
- `docs/product/requirements.md`
- `docs/product/interactions.md`
- `README.md`
- `README.zh-CN.md`

### README impact

Update README files when New Tab entry behavior, default behavior, settings, or public feature description changes.

## Shared Components / UI Primitives

### Code areas

- `src/components/`
- `src/styles/`
- shared folder picker / cascade menu components
- shared icon / button / input primitives

### Read before work

- `docs/frontend/surfaces/shared/01-shared-components.md`
- `docs/frontend/surfaces/shared/03-folder-cascade-menu.md`
- `docs/frontend/surfaces/shared/04-icons-and-ui-primitives.md`
- `docs/frontend/surfaces/reference/02-ui-element-index.md`

### Likely affected after work

- `docs/frontend/surfaces/shared/`
- any surface docs that consume the changed component
- `docs/frontend/surfaces/reference/`

## Data, Metadata, Storage

### Code areas

- `src/lib/chrome/`
- `src/features/metadata/`
- `src/features/settings/`
- storage key constants or services
- import / export services

### Read before work

- `docs/data/storage.md`
- `docs/architecture/module-boundaries.md`
- `docs/frontend/surfaces/shared/02-data-storage-and-chrome-api.md`

### Likely affected after work

- `docs/data/storage.md`
- `docs/architecture/module-boundaries.md`
- `docs/frontend/surfaces/shared/02-data-storage-and-chrome-api.md`
- surface docs that display or mutate the changed data

### README impact

Update README files only when public features, permissions, or onboarding claims change.

## Background / Runtime Messaging / Chrome API

### Code areas

- `public/manifest.json`
- `src/background/`
- `src/lib/chrome/`
- popup / quick-save / newtab clients using runtime messages

### Read before work

- `docs/architecture/overview.md`
- `docs/architecture/module-boundaries.md`
- `docs/frontend/surfaces/shared/02-data-storage-and-chrome-api.md`

### Likely affected after work

- `docs/architecture/overview.md`
- `docs/architecture/module-boundaries.md`
- `docs/data/storage.md`
- affected PageDocs surface
- `README.md`
- `README.zh-CN.md` if permissions or entry behavior change

## Manifest / Permissions

### Code areas

- `public/manifest.json`
- background / content / newtab / popup entry files

### Read before work

- `docs/architecture/overview.md`
- `docs/product/requirements.md`
- `README.md`
- `README.zh-CN.md`

### Likely affected after work

- `docs/architecture/overview.md`
- `docs/architecture/module-boundaries.md`
- `docs/product/requirements.md`
- `docs/guides/testing-and-acceptance.md`
- `README.md`
- `README.zh-CN.md`

## Product Behavior / Requirements

### Code areas

Depends on feature.

### Read before work

- `docs/product/requirements.md`
- `docs/product/interactions.md`
- `docs/product/ui-design.md`
- affected PageDocs surface

### Likely affected after work

- `docs/product/requirements.md`
- `docs/product/interactions.md`
- `docs/product/roadmap.md` if scope changes
- affected PageDocs surface
- README files if public description changes

## Testing / Validation

### Code areas

- `package.json`
- test setup files
- feature tests

### Read before work

- `docs/guides/testing-and-acceptance.md`

### Likely affected after work

- `docs/guides/testing-and-acceptance.md`
- README files if install / build / test commands change

## Documentation Structure

### Code / doc areas

- `docs/`
- root README files
- `.agent/skills/project-doc-routing/`
- `.agent/skills/project-doc-maintenance/`
- `AGENTS.md`

### Read before work

- `docs/README.md`
- `docs/standards/documentation-maintenance.md`
- `AGENTS.md`
- `.agent/skills/project-doc-routing/SKILL.md`
- `.agent/skills/project-doc-maintenance/SKILL.md`

### Likely affected after work

- `docs/README.md`
- directory README files under moved docs
- root README Documentation links
- routing and maintenance skill references
- `AGENTS.md` if workflow changes


## AI Workflow / Run State / Playbooks

### Areas

- `AGENTS.md`
- `.ai/README.md`
- `.ai/runs/_TEMPLATE/`
- `docs/workflow/`
- `docs/playbooks/`
- `.agent/skills/project-run-orchestration/`
- `.agent/skills/project-playbook-routing/`
- `.agent/skills/project-validation-gate/`

### Read before work

- `AGENTS.md`
- `.ai/README.md`
- `docs/workflow/README.md`
- `docs/workflow/ai-development-lifecycle.md`
- `docs/workflow/run-folder-convention.md`
- `docs/playbooks/README.md`

### Likely affected after work

- `AGENTS.md`
- `.ai/README.md`
- `.ai/runs/_TEMPLATE/`
- `docs/workflow/`
- `docs/playbooks/`
- local skill docs under `.agent/skills/`
- `docs/README.md`
- `docs/standards/documentation-maintenance.md`

### README impact

Update root README files only if public documentation navigation or repository onboarding changes. Internal Agent workflow changes usually do not need public README updates unless the Documentation section links are changed.
