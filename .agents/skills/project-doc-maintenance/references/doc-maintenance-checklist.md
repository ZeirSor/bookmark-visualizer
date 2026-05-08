# Documentation Maintenance Checklist

Use this checklist when running `project-doc-maintenance`.

## 1. Code Path Accuracy

For every code path mentioned in docs:

- The file exists.
- The path uses the current directory name.
- Future suggested files are clearly marked as planned, not existing.
- Renamed files are updated in every affected doc.
- Deleted files are removed from docs unless mentioned historically.
- Entry files match current entrypoints:
  - `index.html`
  - `popup.html`
  - `newtab.html`

## 2. UI Surface Accuracy

For UI changes, verify:

- Page entrypoint is correct.
- Component list matches current code.
- Buttons, inputs, icons, tabs, menus, dialogs, and empty states are documented.
- CSS selectors and class names are current.
- Interaction states are current:
  - default
  - hover
  - focus
  - active
  - loading
  - empty
  - error
  - disabled
- Keyboard and pointer behavior are documented when relevant.
- Surface-specific state transitions match current implementation.
- Shared component docs are updated when a reusable UI primitive changes.

## 3. Data And Storage Accuracy

For data changes, verify:

- Storage keys are listed.
- Ownership is clear:
  - `chrome.bookmarks` for native bookmark structure
  - `chrome.storage.local` for extension metadata and UI state
- Migration or compatibility notes are present when keys are renamed or deprecated.
- Import/export behavior is described only if actually implemented.
- New Tab, Quick Save, popup, manager, and settings state ownership is current.

## 4. Chrome API Boundary Accuracy

For Chrome API changes, verify:

- Manifest permissions match documentation.
- Background, popup, quick-save, and New Tab environment boundary files are documented.
- UI components do not appear to own direct Chrome API responsibility unless intentionally documented.
- Optional permissions are not described as install-time permissions.
- Runtime message routes match the actual `src/background/` routing files.

## 5. Product Behavior Accuracy

For product-facing changes, verify:

- Requirements describe current behavior, not planned behavior.
- Paused or deprecated behavior is clearly marked.
- Default behavior is distinguished from optional settings.
- Popup, Manager, Quick Save, and New Tab entry behavior is current.
- UI copy and interaction docs match current product wording.

## 6. README Sync

Update root README files only when the change affects:

- project identity
- installation or build commands
- extension entrypoints
- major features
- browser support
- permissions
- project structure
- docs index links
- public roadmap

Do not update root README files for small internal component changes.

## 7. Link And Index Sync

After docs edits, verify:

- `docs/README.md` links to new or moved docs.
- Directory README files link to important child docs.
- Root README links still resolve.
- Cross-links use relative paths that work from the current file location.
- Image and GIF asset paths exist if referenced.
- `docs/frontend/surfaces/reference/` indexes reflect renamed UI elements or files.

## 8. Scope Control

When updating docs:

- Prefer targeted edits over broad rewrites.
- Do not update unrelated docs just because they are nearby.
- Do not remove useful historical context unless it is misleading.
- Mark known gaps explicitly when a doc cannot be fully synchronized in the current task.
