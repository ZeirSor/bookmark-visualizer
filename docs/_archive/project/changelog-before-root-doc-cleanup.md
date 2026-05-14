---
type: archive
status: archived
scope: project
owner: project
last_verified: 2026-05-14
source_of_truth: false
archived_reason: "Previous changelog mixed current release notes with legacy Quick Save floating-panel history."
current_source: "CHANGELOG.md"
---

# Archived Changelog Snapshot

This snapshot preserves the previous root changelog before the project-level documentation cleanup. It is not the current release-facing changelog.

# Changelog

This file records user-facing and release-relevant changes only. Use `.ai/logs/` for AI worklogs, `.ai/dev-changelog/` for development summaries, and `.ai/runs/` for active task state.

## [Unreleased]

### Added

- Added clickable folder breadcrumbs so users can jump directly to any folder in the current path.
- Added a toolbar popup Save tab for saving the current webpage with title, read-only URL, note, preview, folder search, recent folders, and inline folder creation.
- Added a popup entry health-check script and documentation to verify `action.default_popup`, the popup bundle, service worker messages, and packaged artifacts.
- Added a shortcut settings entry that opens the browser's native extension shortcut management page.
- Added before / after insertion for bookmark rows in the left folder tree when tree bookmarks are visible.
- Added inline folder creation inside the quick-save folder picker.
- Added drag repositioning for the quick-save floating panel from its title or blank areas.

### Changed

- Changed the toolbar action to open `popup.html` instead of opening the full workspace directly.
- Paused the global `Ctrl+S` listener route and removed default global host permissions/content script registration from the popup save path.
- Restored quick-save to a single retained browser command and documented extension shortcut customization through Chrome / Edge native settings.
- Removed fixed shortcut text from the quick-save panel and improved folder menu spacing, dynamic scrolling, and row-connected submenu placement.
- Increased cascade submenu close buffering to make parent-to-child menu movement more forgiving.
- Restored the right-side bookmark move menu to its original nested cascade structure while keeping viewport-aware direction and scrolling.

### Fixed

- Fixed quick-save so closing the floating panel no longer prevents reopening it from the same page.
- Fixed left-tree drag scrolling so the mouse wheel can scroll long trees while dragging bookmarks or folders.
- Fixed move submenus so bottom-edge and right-edge menus can open upward or leftward, then scroll internally when neither direction has enough space.
- Fixed quick-save folder cascades so deeper nested folders can continue opening beyond the first submenu.