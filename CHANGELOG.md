# Changelog

This file records user-facing and release-relevant changes only. Use `.ai/logs/` for AI worklogs, `.ai/dev-changelog/` for development summaries, `.ai/runs/` for active task state, and `docs/_archive/` for historical design notes.

## [Unreleased]

### Added

- Added the toolbar popup as the primary save entry, with Save, Manage, and Settings tabs in `popup.html`.
- Added popup save support for saving the current tab as a native browser bookmark with title, URL, note, favicon/preview handling, folder search, recent folders, and inline folder creation.
- Added an optional page-level `Ctrl+S` / `Command+S` bridge that opens the same toolbar popup after the user enables optional host access.
- Added the optional New Tab dashboard through runtime redirect behavior instead of a static `chrome_url_overrides.newtab` manifest entry.
- Added local favicon caching through the browser `_favicon` capability and local IndexedDB storage.
- Added project documentation, validation, and Agent workflow checks for long-term maintenance.

### Changed

- Changed the toolbar action and `Ctrl+Shift+S` command to open `popup.html` instead of the full manager workspace.
- Changed Quick Save from a standalone content-script UI surface into save protocol/helper logic used by the popup and background message handlers.
- Moved testing and validation guidance under `docs/quality/` and moved historical design material under `docs/_archive/`.

### Removed

- Removed the legacy independent `save.html` save window path from the current implementation.
- Removed the legacy content-script Save Overlay / Shadow DOM Quick Save dialog from the current implementation.
- Removed active documentation references that presented legacy save surfaces as current behavior.
