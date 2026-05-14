---
type: reference
status: active
scope: frontend
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Component Inventory

This inventory captures the current UI component reality for Bookmark Visualizer as of 2026-05-11. It is a reference baseline for the UI-system refactor run, not a list of completed future primitives.

## Active UI Surfaces

| Surface | Entry | Main shell | Primary style | Current component model |
|---|---|---|---|---|
| Manager workspace | `index.html` -> `src/main.tsx` -> `src/app/App.tsx` | `App` | `src/app/styles.css` | Large page controller with extracted workspace sections, shared folder tree, shared bookmark card, and local overlays. |
| Toolbar popup | `popup.html` -> `src/popup/main.tsx` -> `src/popup/PopupApp.tsx` | `PopupApp` | `src/popup/styles.css` | Save / Manage / Settings tabs with popup-local controls plus shared folder picker and site favicon. |
| Optional New Tab | `newtab.html` -> `src/newtab/main.tsx` -> `src/newtab/NewTabApp.tsx` | `NewTabApp` | `src/newtab/styles.css` | Search-first dashboard with New Tab-local panels, dialog, drawer, tabs, toast, and shared site favicon/icons. |
| Page Ctrl+S bridge | `src/features/page-shortcut/content.ts` + `src/background/pageShortcutHandlers.ts` | none | none | No rendered UI; requests the toolbar popup when the page shortcut is allowed. |

The old standalone Quick Save overlay is not an active UI surface. The `src/features/quick-save/` package remains as the save message and folder-helper layer used by popup/background code.

## Shared UI-System Ownership

| Area | Current files | Current callers | Notes |
|---|---|---|---|
| Design-system skeleton | `src/design-system/README.md`, `src/design-system/index.ts`, `src/design-system/tokens/index.ts`, `src/design-system/primitives/index.ts`, `src/design-system/patterns/index.ts` | Popup, New Tab first primitive users | Selected ownership path for new shared primitives and bookmark-specific patterns. Current page code still mainly uses `src/components/` and page-local components. |
| `Button` / `IconButton` primitives | `src/design-system/primitives/Button/*` | Popup footer/topbar, New Tab header/nav | First P0 primitive pair. Current migrations keep legacy surface selector classes for compatibility; later passes should retire unused page-local button selectors after broader adoption. |
| Form control primitives | `src/design-system/primitives/FormControls/*` | Popup Save tab, New Tab shortcut dialog, New Tab customize drawer | Runtime `Input`, `Textarea`, and native `Select` are exported from `src/design-system`; `Switch` remains contract-only until `--bv-switch-*` tokens and migration land. |
| Global CSS tokens | `src/styles/tokens.css` | Manager, popup, New Tab styles | Existing token source. Component-token ownership, first-pass component token groups, hardcode policy, and token exception ledger are now documented for Phase 1 migration. |
| Icons | `src/components/icons/AppIcons.tsx`, `src/components/icons/ManagerIcons.tsx`, `src/components/icons/MenuActionIcons.tsx`, `src/popup/components/PopupIcons.tsx` | all UI surfaces | Shared icon sets exist, but popup icons still act as a bridge for some shared folder-picker modules. |

## Shared Components In Use

| Component / pattern | Files | Used by | Current responsibility | Refactor note |
|---|---|---|---|---|
| `BookmarkCard` | `src/components/BookmarkCard.tsx` | Manager workspace | Bookmark card display, selection, drag/drop hooks, favicon, inline edit fields, note/tag/footer actions. | Rich business component; still owns local inline input behavior and card actions. |
| `SiteFavicon` | `src/components/SiteFavicon.tsx` | Manager, popup Manage tab, New Tab panels | Shared favicon with fallback label and cache-backed favicon lookup. | Strong reuse candidate already documented as a primitive-like shared component. |
| `FolderTree` | `src/components/FolderTree.tsx`, `src/components/folder-tree/*` | Manager workspace | Sidebar tree, recursive folder rows, bookmark rows, rename input, drag/drop and auto-scroll helpers. | Shared file location, but current usage is Manager-specific. |
| `BreadcrumbNav` | `src/components/BreadcrumbNav.tsx` | Manager top toolbar | Folder breadcrumb navigation. | Shared location, current caller is Manager. |
| `SearchBar` | `src/components/SearchBar.tsx` | Manager top toolbar | Manager bookmark search input with clear action. | Not the same contract as New Tab search or folder search. |
| `MenuActionContent` | `src/components/MenuActionContent.tsx` | Manager context menu, folder cascade layers | Standard icon + label + trailing layout for menu rows. | Useful base for a future menu primitive. |
| `FolderCascadeMenu` | `src/components/FolderCascadeMenu.tsx`, `src/components/folder-cascade/*` | Manager move menu through `FolderMoveSubmenuContent` | Recursive folder cascade, floating submenu layers, placement helpers, disabled target support, optional create-folder action. | Shared business pattern, but keyboard coverage and multi-surface adoption need hardening. |
| `FolderMoveSubmenuContent` | `src/components/FolderMoveSubmenuContent.tsx` | Manager bookmark context menu | Move-menu search, recent folders, cascade entry, and create-folder callback wiring. | Business-specific pattern for Manager move flow. |
| `InlineFolderPicker` | `src/components/folder-picker/*` | Popup Save tab, popup Settings default folder picker | Inline folder search/tree picker with keyboard movement, recent folders, create-folder row, and manage action. | Shared by popup flows, but imports popup-specific components/icons and must be disentangled in Phase 3. |

## Manager Workspace Inventory

| Area | Current components | Source files | Shared usage | Notes |
|---|---|---|---|---|
| App shell and controller | `App` | `src/app/App.tsx` | imports shared `FolderTree` and workspace sections | Still owns search/filter/sort, overlay state, drag/drop, CRUD, selection, toast, shortcut settings, and many command handlers. |
| Top toolbar | `TopToolbar`, `BreadcrumbNav`, `SearchBar`, `CardSizeControl` | `src/app/workspace/components/TopToolbar.tsx`, `src/components/BreadcrumbNav.tsx`, `src/components/SearchBar.tsx`, `src/app/workspace/WorkspaceComponents.tsx` | mixed shared and Manager-local | Uses local icon buttons and a Manager-local segmented size control. |
| Folder header and command area | `FolderHeader`, `SearchFilterSummary`, `BookmarkCommandBar`, `FolderStrip`, `SelectionActionBar` | `src/app/workspace/components/*` | shared icons only | Buttons, chips, selects, and disabled placeholders are page-local implementations. |
| Main content | `WorkspaceContent`, `BookmarkCard`, `NewBookmarkDraftCard`, `LoadingState`, `EmptyState` | `src/app/workspace/WorkspaceContent.tsx`, `src/components/BookmarkCard.tsx`, `src/app/workspace/WorkspaceComponents.tsx` | shared `BookmarkCard`; local empty/loading/draft | Loading cards and empty states are Manager-local. |
| Sidebar and right rail | `FolderTree`, `RightRail` | `src/components/FolderTree.tsx`, `src/app/workspace/components/RightRail.tsx` | shared tree; local rail cards | Right rail cards and quick actions are local panels. |
| Menus | `BookmarkContextMenu`, `FolderContextMenu`, `FolderMoveSubmenuContent`, `FolderCascadeMenu` | `src/app/workspace/WorkspaceComponents.tsx`, `src/components/FolderMoveSubmenuContent.tsx`, `src/components/FolderCascadeMenu.tsx` | mixed shared and Manager-local | Menu shell is local; cascade and menu row content are shared. |
| Overlays and feedback | `FolderPickerDialog`, `NewFolderDialog`, `ShortcutSettingsDialog`, `OperationLogDrawer`, `Toast` | `src/app/workspace/WorkspaceComponents.tsx` | none | Dialog, drawer, and toast shells are local and should become shared primitives later. |

## Toolbar Popup Inventory

| Area | Current components | Source files | Shared usage | Notes |
|---|---|---|---|---|
| Popup shell | `PopupApp`, `PopupTopBar`, `TabButton`, `PopupFooter`, `PopupUtilityFooter` | `src/popup/PopupApp.tsx`, `src/popup/components/*` | popup icons wrap shared app icons; `PopupTopBar` and save-tab `PopupFooter` now consume `IconButton` / `Button` | Tabs and utility footer buttons remain popup-local. |
| Save tab | `SaveTab`, `PagePreviewCard`, `SaveLocationPicker`, `LocationPathRow`, `InlineFolderPicker` | `src/popup/tabs/SaveTab.tsx`, `src/popup/components/*`, `src/components/folder-picker/*` | shared `Input` / `Textarea` and inline folder picker | Save fields now use shared form controls. Save location uses the shared folder-picker wrapper, but popup-specific create/recent rows still leak into shared code. |
| Manage tab | `ManageTab`, `ManagerActionCard` | `src/popup/tabs/ManageTab.tsx` | shared `SiteFavicon` and icons | Hero card, search command, filter button, folder cards, and action cards are local. |
| Settings tab | `SettingsTab`, `SettingsSection`, `SettingRow`, `Switch`, `CustomSelect`, `DefaultFolderMenu`, `Keycap` | `src/popup/tabs/SettingsTab.tsx`, `src/popup/tabs/settings/*` | shared inline folder picker for default folder | Local `Switch`, `CustomSelect`, and settings-row implementations remain in place. Switch runtime migration waits for switch tokens. |

## Optional New Tab Inventory

| Area | Current components | Source files | Shared usage | Notes |
|---|---|---|---|---|
| New Tab shell | `NewTabApp`, `NewTabSidebar`, `NewTabModeTabs` | `src/newtab/NewTabApp.tsx`, `src/newtab/components/*` | shared app icons; header manager action and main nav now consume `IconButton` / `Button` | Sidebar and content tabs remain New Tab-local. |
| Search | `SearchPanel`, `SuggestionGroup`, `CategoryIcon` | `src/newtab/components/SearchPanel.tsx` | shared app icons | Has combobox/listbox semantics and active suggestion state, but empty submit and Esc behavior are tracked as later tasks. |
| Main panels | `PinnedShortcutGrid`, `BookmarkGroupStrip`, `FeaturedBookmarkRow`, `FolderPreviewPanel` | `src/newtab/components/NewTabSections.tsx` | shared `SiteFavicon` and icons | Panels, tiles, chips, rows, and ghost buttons are New Tab-local. |
| Side panels | `RecentActivityPanel`, `QuickActionsPanel`, `StorageUsageMiniCard` | `src/newtab/components/NewTabSections.tsx` | shared icons and `SiteFavicon` | Right-rail panels are New Tab-local and have their own visual hierarchy. |
| Overlays and feedback | `CustomizeLayoutPanel`, `ShortcutDialog`, `nt-toast` | `src/newtab/components/CustomizeLayoutPanel.tsx`, `src/newtab/components/ShortcutDialog.tsx`, `src/newtab/NewTabApp.tsx` | shared close icon, shared `Input` / native `Select` fields | Drawer, dialog, checkbox rows, and toast are local shells; low-risk dialog/customize fields now use shared form controls. |

## Page-Local Primitive Duplication Baseline

| Primitive category | Current local implementations | Main selectors / files |
|---|---|---|
| Buttons and icon buttons | Manager command buttons/chips/icon buttons, popup topbar/footer/tab/action buttons, New Tab nav/ghost/icon/action buttons; first shared `Button` / `IconButton` migrations in Popup and New Tab | `.command-button`, `.command-chip`, `.command-icon-button`, `.folder-icon-button`, `.section-action-button`, `.bv-button`, `.bv-icon-button`, `.topbar-tool-button`, `.primary-action`, `.secondary-action`, `.nt-icon-button`, `.nt-ghost-button` |
| Form controls | Manager inline edit inputs/dialog fields, popup title/URL/note fields, popup custom select/switch, New Tab search engine select/search input/dialog/customize inputs; shared `Input`, `Textarea`, and native `Select` are runtime primitives, while `Switch` remains contract-only | `BookmarkCard.tsx`, `WorkspaceComponents.tsx`, `SaveTab.tsx`, `SettingsRows.tsx`, `SearchPanel.tsx`, `ShortcutDialog.tsx`, `CustomizeLayoutPanel.tsx`, `src/design-system/primitives/FormControls/*` |
| Cards and panels | Manager bookmark/right-rail/loading cards, popup preview/settings/manager cards, New Tab shortcut/folder/featured/side panels | `.bookmark-card`, `.right-rail-card`, `.page-preview`, `.settings-card`, `.manager-hero-card`, `.nt-panel`, `.nt-side-panel`, `.nt-preview-card` |
| Menus and pickers | Manager context menu/move submenu/folder picker dialog, popup inline folder picker/default folder menu, shared cascade menu | `WorkspaceComponents.tsx`, `FolderMoveSubmenuContent.tsx`, `FolderCascadeMenu.tsx`, `InlineFolderPicker.tsx`, `DefaultFolderMenu.tsx` |
| Dialogs, drawers, toasts | Manager folder/shortcut dialogs, operation log drawer, toast; New Tab shortcut dialog, customize drawer, toast | `.dialog-layer`, `.bookmark-edit-dialog`, `.operation-log-drawer`, `.toast`, `.nt-drawer-backdrop`, `.nt-customize-drawer`, `.nt-shortcut-dialog`, `.nt-toast` |
| Empty/loading states | Manager empty/loading cards, popup Manage empty copy, inline folder picker empty, New Tab empty panel copy/loading/error text | `WorkspaceContent.tsx`, `WorkspaceComponents.tsx`, `ManageTab.tsx`, `InlineFolderPicker.tsx`, `NewTabSections.tsx`, `NewTabApp.tsx` |
| Search boxes | Manager global search, Manager move-folder search, Manager folder picker search, popup folder search, New Tab mixed web/bookmark search | `SearchBar.tsx`, `FolderMoveSubmenuContent.tsx`, `WorkspaceComponents.tsx`, `FolderSearchInput.tsx`, `SearchPanel.tsx` |

## CSS Duplication Details

This section satisfies task `0.6`: list the duplicated UI primitives currently implemented in page CSS.

| Primitive category | Manager selectors in `src/app/styles.css` | Popup selectors in `src/popup/styles.css` | New Tab selectors in `src/newtab/styles.css` | Shared risk |
|---|---|---|---|---|
| Buttons | `.section-action-button`, `.empty-state-action`, `.command-button`, `.command-chip`, `.selection-actions button`, `.selection-cancel-button`, `.link-button`, `.storage-action` | `.primary-action`, `.secondary-action`, `.manager-hero-action`, `.manager-search-command`, `.manager-filter-button`, `.manager-action-card`, `.advanced-settings-button`, `.picker-create-toggle` | `.nt-main-nav button`, `.nt-panel-link`, `.nt-ghost-button`, `.nt-text-button`, `.nt-action-list button`, `.nt-dialog-actions button` | First shared `Button` exists, but most button color, radius, height, focus, disabled, danger, loading, and icon spacing remain page-owned until broader migration. |
| Icon buttons | `.folder-icon-button`, `.command-icon-button`, `.summary-icon-button`, `.log-button`, `.shortcut-button`, `.theme-button`, `.drawer-close` | `.topbar-tool-button`, `.icon-button`, `.location-arrow-button`, `.recent-expand-button`, `.folder-search-input button` | `.nt-icon-button`, `.nt-search-submit`, `.nt-tile-dismiss`, `.nt-folder-open`, `.nt-drawer-header button` | First shared `IconButton` centralizes label, size, tone, selected, loading, and focus treatment for migrated usages; most legacy icon buttons still need migration. |
| Form controls | `.bookmark-edit-dialog input`, `.bookmark-edit-dialog textarea`, `.inline-edit-title`, `.inline-edit-url`, `.inline-edit-note`, `.command-select-control select`, `.folder-picker-search input` | `.field-stack .bv-input-control`, `.url-input .bv-input-control`, `.note-field .bv-textarea`, `.folder-search-input input`, `.custom-select-trigger`, `.custom-select-menu`, `.switch-control` | `.nt-search-box input`, `.nt-engine-select select`, `.nt-shortcut-dialog .bv-input-control`, `.nt-customize-drawer .bv-input-control`, `.nt-customize-drawer .bv-select` | First runtime migration landed for Popup SaveTab and New Tab dialog/customize fields. Page-owned selectors remain for Manager fields, popup folder search/create rows, Popup `CustomSelect`/`Switch`, and New Tab search combobox controls. |
| Cards / panels | `.bookmark-card`, `.new-bookmark-card`, `.loading-card`, `.right-rail-card`, `.operation-log-item`, `.empty-state` | `.page-preview`, `.settings-card`, `.manager-hero-card`, `.manager-action-card`, `.recent-bookmark-list button`, `.folder-card-grid button` | `.nt-panel`, `.nt-side-panel`, `.nt-shortcut-tile`, `.nt-preview-card`, `.nt-storage-card` | Surface, elevation, compact, interactive, selected, loading, and empty variants are selector-owned. |
| Menus / popovers | `.context-menu-panel`, `.context-submenu`, `.move-submenu`, `.move-menu-list`, `.folder-picker-list` | `.inline-folder-picker`, `.location-picker-shell`, `.folder-tree`, `.custom-select-menu`, `.recent-chips`, `.settings-mini-chips` | `.nt-suggestion-panel`, `.nt-suggestion-list`, `.nt-content-tabs` | Menu row, cascade, listbox, selected, hover, disabled, overflow, and keyboard state styling is fragmented. |
| Dialogs / drawers | `.dialog-layer`, `.bookmark-edit-dialog`, `.shortcut-settings-dialog`, `.operation-log-drawer` | none as a full popup dialog shell; uses inline panels and custom select popovers | `.nt-drawer-backdrop`, `.nt-customize-drawer`, `.nt-shortcut-dialog` | Overlay, drawer, dialog, close button, footer, scroll, focus, and motion contracts are local. |
| Toast / status | `.toast` | `.status-line`, `.popup-footer`, `.button-spinner` | `.nt-toast`, `.nt-loading`, `.nt-error` | Toast/status tones, timeout, actions, and busy state are not shared. |
| Search | `.search-bar`, `.search-clear-button`, `.move-submenu-search`, `.folder-picker-search`, `.search-filter-summary` | `.folder-search-input`, `.manager-search-row`, `.manager-search-command` | `.nt-search-hero`, `.nt-search-box`, `.nt-suggestion-panel`, `.nt-category-chips` | Search input, clear, suggestions, active result, empty query, and Esc/Enter behavior need shared contracts. |

## Business Patterns To Unify Later

These are current patterns with overlap across surfaces. This section satisfies task `0.7`; later tasks should unify the patterns rather than silently folding them into this inventory task.

| Pattern | Current implementations | Why it matters |
|---|---|---|
| Folder picker | Manager `FolderPickerDialog`; popup `SaveLocationPicker`; popup `DefaultFolderMenu`; shared `InlineFolderPicker` | Search, disabled targets, active path, recent folders, create-folder, and keyboard behavior should share one core model. |
| Folder cascade / move menu | `FolderCascadeMenu`; `FolderMoveSubmenuContent`; popup inline tree picker | Cascade placement and folder selection constraints need shared behavior and state coverage. |
| Save location picker | Popup save location panel and settings default folder menu | Both use inline folder picking, but persistence/status feedback and create-folder behavior are still surface-owned. |
| Search box / suggestions | Manager `SearchBar`; folder search inputs; New Tab `SearchPanel` | Search semantics differ, but primitive input, clear action, active item, empty submit, and Esc behavior need consistent contracts. |
| Bookmark card / bookmark row | Manager `BookmarkCard`; New Tab featured/preview/activity rows; popup recent bookmark rows | Favicon, title/url truncation, open behavior, selected/edit states, and long-content handling should converge. |
| Settings row | Popup settings rows and New Tab customize drawer fields | Switch/select/row layout and async saving/error feedback should become reusable. |

## Business Pattern Details

| Pattern | Existing code paths | Current overlap | First likely unification target |
|---|---|---|---|
| Folder picker | `src/app/workspace/WorkspaceComponents.tsx`, `src/popup/components/SaveLocationPicker.tsx`, `src/popup/tabs/settings/DefaultFolderMenu.tsx`, `src/components/folder-picker/*` | Folder flattening/search/selection, current path display, create-folder entry, recent folders, keyboard handling. | Create `FolderPickerCore` helpers before changing visible UI. |
| Folder cascade | `src/components/FolderCascadeMenu.tsx`, `src/components/folder-cascade/*`, `src/components/FolderMoveSubmenuContent.tsx` | Menu row layout, disabled targets, selected/current target, overflow placement, create-folder hook. | Normalize state model and keyboard behavior around the existing cascade placement helpers. |
| Save location picker | `src/popup/components/SaveLocationPicker.tsx`, `src/popup/components/save-location/*`, `src/popup/tabs/settings/DefaultFolderMenu.tsx` | Current/default path, inline folder picker, recent folders, create folder, footer/status feedback. | Remove popup-owned row/chip dependencies from `src/components/folder-picker/*`. |
| Search box | `src/components/SearchBar.tsx`, `src/components/FolderMoveSubmenuContent.tsx`, `src/components/folder-picker/FolderSearchInput.tsx`, `src/newtab/components/SearchPanel.tsx` | Text input with clear/submit/search results; New Tab adds suggestions and engine/category state. | Define shared `SearchInput` primitives first; keep business-specific suggestion models separate. |
| Bookmark card | `src/components/BookmarkCard.tsx`, `src/popup/tabs/ManageTab.tsx`, `src/newtab/components/NewTabSections.tsx` | Site favicon, title/url display, open actions, hover/focus row/card states, empty/long text handling. | Split reusable display row/card tokens before moving edit/drag logic. |
| Settings row | `src/popup/tabs/settings/SettingsRows.tsx`, `src/newtab/components/CustomizeLayoutPanel.tsx` | Label/description/control layout, switch/select controls, preferences update calls; New Tab native select and numeric input fields now use shared form controls. | Add async persistence states and shared row/control primitives; keep Popup `CustomSelect` and Switch work separate. |

## Dependency Risks

- `src/components/folder-picker/InlineFolderPicker.tsx` imports `InlineCreateFolderRow` and `RecentFolderChips` from `src/popup/components/save-location/`.
- `src/components/folder-picker/FolderSearchInput.tsx` and `FolderTreeItem.tsx` import icons through `src/popup/components/PopupIcons.tsx`.
- `src/app/workspace/WorkspaceComponents.tsx` still combines controls, menus, dialogs, drawer, toast, empty state, and draft-card logic in one file.
- `src/design-system/` now exports runtime `Button`, `IconButton`, `Input`, `Textarea`, and native `Select`; most page-local controls still remain outside the shared primitive layer, and `Switch` remains contract-only.

## Validation Notes For This Inventory

This document was built from targeted reads of:

- active shell files: `src/app/App.tsx`, `src/popup/PopupApp.tsx`, `src/newtab/NewTabApp.tsx`;
- shared component files under `src/components/`;
- popup and New Tab component directories;
- the design-system skeleton under `src/design-system/`;
- the current UI audit stored in `.ai/runs/2026-05-10__ui-system-component-refactor-plan/references/current-ui-component-audit.md`.

Use [token-audit.md](token-audit.md) for raw CSS value analysis and [component-state-matrix.md](component-state-matrix.md) for detailed state coverage.
