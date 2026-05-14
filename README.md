<p align="center">
  <a href="README.md">English</a> | <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <img src="public/icons/icon-128.png" width="96" height="96" alt="Bookmark Visualizer icon" />
</p>

<h1 align="center">Bookmark Visualizer</h1>

<p align="center">
  A Chrome and Edge bookmark workspace for visually saving, browsing, searching, and organizing native browser bookmarks.
</p>

<p align="center">
  <img alt="Status: preview" src="https://img.shields.io/badge/status-preview-f59e0b" />
  <img alt="Chrome and Edge" src="https://img.shields.io/badge/browser-Chrome%20%7C%20Edge-2563eb" />
  <img alt="Manifest V3" src="https://img.shields.io/badge/manifest-v3-16a34a" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61dafb" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178c6" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646cff" />
</p>

## Overview

Bookmark Visualizer is a Manifest V3 browser extension for people with large bookmark collections. It provides three user-facing extension surfaces plus a toolbar popup save flow:

- a toolbar popup for saving the current page without leaving the browser chrome;
- an optional page-level `Ctrl+S` / `Command+S` bridge that opens the same popup after user-granted optional host access;
- a full bookmark manager workspace for browsing, searching, editing, moving, and reviewing bookmarks;
- an optional New Tab surface that can be enabled in settings for a search-first bookmark dashboard.

The extension uses `chrome.bookmarks` as the source of truth. Moves, edits, deletes, folder changes, and bookmark creation operate on the browser's native bookmark tree instead of a private bookmark copy. Extension-only data such as notes, summaries, recent folders, New Tab state, settings, and UI state belong in `chrome.storage.local`; website favicon images are cached separately in local IndexedDB as UI-only data.

The toolbar action and `Ctrl+Shift+S` open `popup.html`, with Save, Manage, and Settings tabs in the same compact surface. Restricted pages such as `chrome://extensions/`, extension pages, and file URLs can still be saved as URL references from the popup without metadata injection. Page-level `Ctrl+S` is off by default; enabling it requests optional `http://*/*` and `https://*/*` host access and registers a tiny listener that only opens the popup. The full manager workspace opens from `index.html`. By default, Bookmark Visualizer keeps the browser's native new tab page. Users can enable the optional New Tab override in settings; when enabled, new browser tabs redirect to `newtab.html`.

The manifest includes the MV3 `favicon` permission so extension pages can read browser-known site icons through Chrome / Edge's official `_favicon` URL and cache them locally. The extension does not add default third-party favicon service requests.

## Features

- Browse the native bookmark folder tree in a dedicated full-page workspace.
- Navigate folders from clickable breadcrumb paths.
- View bookmarks as readable cards with title, URL, favicon, note, and summary space.
- Search bookmarks by title and URL.
- Drag bookmark cards into folders or reorder them inside the current folder.
- Edit bookmark title, URL, note, and folder names inline.
- Create a bookmark before or after an existing card from the card context menu.
- Move or delete bookmarks from the card context menu.
- Create folders from the folder tree or while choosing a move destination.
- Drag folders in the tree to move them as children or siblings.
- Undo supported bookmark moves, edits, note changes, and deletions from toast/session history.
- Adjust theme, card size, sidebar width, and tree bookmark visibility.
- Use the toolbar action or `Ctrl+Shift+S` to open the popup and save the current webpage as a native browser bookmark.
- Optionally enable page-level `Ctrl+S` / `Command+S` to open the same popup on ordinary webpages without rendering an overlay.
- Search folders, choose an inline save location, create a folder, add a note, and save from the popup Save tab.
- Open the full workspace from the popup when deeper bookmark management is needed.
- Optionally replace the browser New Tab page with a search-first bookmark dashboard.
- Use locally cached website favicons in the New Tab dashboard and manager cards, with local letter fallback when unavailable.
- Configure New Tab search engine, search category, layout mode, shortcuts per row, recent activity, and storage usage visibility.

## Preview

A maintained screenshot or demo GIF should be committed before the first public release. Future demo assets should be placed under `docs/assets/` when that directory is added to the repository, then referenced from this section.

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/ZeirSor/bookmark-visualizer.git
cd bookmark-visualizer
npm install
```

Build the extension assets:

```bash
npm run build
```

After the build finishes, the unpacked extension files are available in `dist/`.

## Development

Start the Vite development server:

```bash
npm run dev
```

Run the common validation commands:

```bash
npm run docs:root-check
npm run docs:check
npm run agents:check
npm run skills:audit
npm run verify:popup-entry
npm run typecheck
npm run test
npm run build
```

## Loading The Extension

Load the generated `dist` folder in Chrome or Edge:

1. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
2. Enable Developer mode.
3. Choose **Load unpacked**.
4. Select the `bookmark-visualizer/dist` folder generated by `npm run build`.
5. Pin the extension if desired, then click the toolbar icon to open the Save / Manage / Settings popup.
6. Opening a normal browser new tab keeps the browser's default new tab page unless the optional New Tab override is enabled in the extension settings.

Use a test browser profile when trying destructive bookmark actions such as move, edit, or delete.

## Usage

### Toolbar Popup Save Flow

- Click the toolbar icon or press `Ctrl+Shift+S` to open the rounded toolbar popup.
- Review the detected title, URL, favicon, preview image, and save location.
- Search folders, expand the inline folder tree, or use recent folders to choose a save destination.
- Create a folder during location selection if needed.
- Add a note, then save the page as a native browser bookmark.
- Use the Manage tab to open the full workspace. Restricted browser pages can be saved as URL references without metadata injection.

### Manager Workspace

- Select a folder in the left tree to show its direct bookmarks.
- Click a breadcrumb segment to jump directly to that folder.
- Toggle tree bookmark visibility if you want bookmark items inside the folder tree.
- Drag visible tree bookmark rows above or below sibling bookmark rows to reorder them from the tree.
- Type in the search box to search all bookmarks by title or URL.
- Drag a bookmark card onto a writable folder to move it.
- Drag a bookmark card before or after another card in the current folder to reorder it.
- Right-click a bookmark card to edit, insert a new bookmark, move, or delete it.
- Right-click a writable folder to create a child folder or rename it inline.
- Use the undo toast or session operation log after supported operations.

### Optional New Tab

- Enable the New Tab override from the extension settings.
- Use the New Tab search box for web/search-category queries.
- Open pinned or frequently used bookmark shortcuts from the dashboard.
- Review recent activity and storage-related status when the corresponding settings are enabled.
- Disable the New Tab override to return to the browser's default new tab page.

## Project Structure

```text
src/
  app/                 Full manager workspace app shell, workspace state, and global app wiring
  app/workspace/       Manager workspace layout and page-level components
  background/          MV3 service worker, quick-save messages, page shortcut bridge, and new-tab redirect handling
  components/          Shared UI components used across surfaces
  domain/              Bookmark, folder, activity, and table-view domain models
  features/            Feature modules: bookmarks, page-shortcut, popup, quick-save, newtab, favicon, settings, metadata, search
  lib/chrome/          Chrome API adapters and mockable browser integration layer
  newtab/              Optional New Tab surface entry and app wiring
  popup/               Toolbar Save / Manage / Settings popup UI
  styles/              Shared design tokens and surface-level styles

public/
  manifest.json        Manifest V3 extension manifest
  icons/               Extension icons

docs/
  product/             Product requirements, UI design, interaction, and roadmap docs
  architecture/        Architecture overview and module boundary docs
  data/                Storage, domain model, and import/export docs
  frontend/            Surface-level PageDocs and UI maintenance docs
  quality/             Testing, validation, and acceptance docs
  operations/          Local environment and operational notes
  workflow/            AI-assisted development lifecycle and run-folder rules
  playbooks/           Reusable execution manuals for recurring Agent workflows
  standards/           Documentation and maintenance standards
  strategy/            Planned future architecture and product strategy
  _templates/          Reusable documentation templates
  _archive/            Historical and superseded documents
  adr/                 Current architecture decision records

.agents/
  skills/              Portable Agent skills
  project-profile/     Project-specific routing, validation, and playbook mappings

.ai/
  README.md            AI state directory guide
  runs/                Active or resumable task state

scripts/               Validation and maintenance scripts
AGENTS.md              Agent operating rules
AI_HANDOFF.md          Short AI session entry pointer
CHANGELOG.md           Release-facing change log
index.html             Full manager workspace entry
popup.html             Toolbar popup entry
newtab.html            Optional New Tab entry
```

## Documentation

- [Documentation index](docs/README.md)
- [Requirements](docs/product/requirements.md)
- [Architecture](docs/architecture/overview.md)
- [Runtime flows](docs/architecture/runtime-flows.md)
- [UI design](docs/product/ui-design.md)
- [Data and storage](docs/data/storage.md)
- [Import/export](docs/data/import-export.md)
- [Module boundaries](docs/architecture/module-boundaries.md)
- [Interactions](docs/product/interactions.md)
- [Testing and acceptance](docs/quality/testing-and-acceptance.md)
- [Validation gate](docs/quality/validation-gate.md)
- [Roadmap](docs/product/roadmap.md)
- [Right-click move menu](docs/product/right-click-move-menu.md)
- [Frontend PageDocs](docs/frontend/surfaces/README.md)
- [AI development workflow](docs/workflow/README.md)
- [Agent skills](.agents/skills/README.md)
- [Project profile](.agents/project-profile/README.md)
- [Agent playbooks](docs/playbooks/README.md)
- [Documentation maintenance standard](docs/standards/documentation-maintenance.md)
- [Architecture decision records](docs/adr/README.md)

## Roadmap

- Folder delete flows.
- Compact list view plus lightweight sort and filter controls.
- UI integration for metadata import/export flows.
- Stronger New Tab customization and shortcut management.
- On-demand summary fetching remains planned; optional `http://*/*` / `https://*/*` host access is currently used only for the user-enabled page `Ctrl+S` bridge.
- Component-level UI tests.
- First public release packaging and maintained screenshots.

## License

No license has been specified yet.
