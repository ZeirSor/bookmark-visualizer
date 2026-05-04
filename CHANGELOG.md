# Changelog

## [Unreleased]

### Added

- Added clickable folder breadcrumbs so users can jump directly to any folder in the current path.
- Added quick-save support for saving the current webpage with the default extension shortcut `Ctrl+Shift+S` / `Command+Shift+S`, including title, URL, note, preview image URL, and folder selection.
- Added a shortcut settings entry that opens the browser's native extension shortcut management page.
- Added before / after insertion for bookmark rows in the left folder tree when tree bookmarks are visible.
- Added inline folder creation inside the quick-save folder picker.
- Added drag repositioning for the quick-save floating panel from its title or blank areas.

### Changed

- Kept `Ctrl+S` available to the browser and documented extension shortcut customization through Chrome / Edge native settings.
- Removed fixed shortcut text from the quick-save panel and improved folder menu spacing, dynamic scrolling, and row-connected submenu placement.
- Increased cascade submenu close buffering to make parent-to-child menu movement more forgiving.
- Restored the right-side bookmark move menu to its original nested cascade structure while keeping viewport-aware direction and scrolling.

### Fixed

- Fixed quick-save so closing the floating panel no longer prevents reopening it from the same page.
- Fixed left-tree drag scrolling so the mouse wheel can scroll long trees while dragging bookmarks or folders.
- Fixed move submenus so bottom-edge and right-edge menus can open upward or leftward, then scroll internally when neither direction has enough space.
- Fixed quick-save folder cascades so deeper nested folders can continue opening beyond the first submenu.
