---
type: reference
status: active
scope: frontend
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Component State Matrix

This matrix records current state coverage across reusable UI categories. It is the Phase 0 baseline for later component contracts, stories, tests, and manual QA.

## Reading Rules

- "Present" means the current code has visible or semantic handling for the state.
- "Partial" means the state exists in one surface or as an ad hoc implementation, but is not reusable or complete.
- "Missing" means no reliable current implementation was found in the audited code.
- This matrix does not mark future shared primitives as implemented.

## P0 Primitive State Matrix

| Component category | Current implementations | Present states | Partial states | Missing / weak states | Priority |
|---|---|---|---|---|---|
| Button | Manager command/action buttons, popup footer/tab/action buttons, New Tab nav/ghost/action buttons; shared `Button` now used by Popup footer and New Tab main nav | default, hover, focus-visible, disabled in many selectors; shared variants/sizes/loading/selected contract in first primitive | danger, icon, active/selected, loading still mixed with legacy surface selectors | full migration, story coverage, tests, and old page selector retirement | P0 |
| IconButton | Manager folder/toolbar/icon buttons, popup topbar buttons, New Tab icon/search/tile buttons; shared `IconButton` now used by Popup topbar and New Tab header action | default, hover, focus-visible, disabled, labels on many icon-only buttons; required label API and shared size/tone/selected contract in first primitive | selected/open, active, tooltip/title consistency still mixed with legacy surface selectors | story coverage, accessibility tests, and broader migration | P0 |
| Input / Textarea | Manager inline edit and dialogs, popup save form, New Tab search/dialog fields; runtime `Input` / `Textarea` and contracts live in `src/design-system/primitives/FormControls/` | default, focus, readonly URL, long text truncation in some rows; Popup Save fields and New Tab shortcut dialog use shared runtime controls | disabled and saving remain partly page-owned | broader runtime migration, stories, tests, and old page selector retirement | P0 |
| Select | Manager native sort select, popup custom select, New Tab native engine/customize selects; runtime native `Select` and contract live in `src/design-system/primitives/FormControls/` | default, focus, option selection; New Tab customize native selects use shared runtime control | disabled and popup custom-select keyboard behavior remain page-owned | broader native-select migration; Popup custom select waits for Menu/Listbox primitives | P0 |
| Switch | Popup settings switch; shared switch contract lives in `src/design-system/primitives/FormControls/README.md` | on/off, focus, disabled prop support, keyboard Space/Enter; shared role/label/loading guidance is contract defined | async saving/error and `--bv-switch-*` tokens remain future work | runtime migration, persistence feedback, stories, and tests | P0 |
| Card / Panel | Manager bookmark/right-rail cards, popup preview/settings/manager cards, New Tab panels/cards | default, hover, focus-visible, selected for some items, empty panels | elevated, compact, loading | shared surface/elevation/interactive/selected variants | P0 |
| Dialog | Manager folder/shortcut dialogs, New Tab shortcut dialog | open/close, close button, overlay click | `role="dialog"` only on some dialogs, form submit, Esc through page-level listener | shared focus trap, consistent `aria-modal`, loading footer, error region | P0 |
| Drawer | Manager operation log drawer, New Tab customize drawer | open/close, close button | empty, scroll | focus trap, Esc contract, shared drawer shell, loading/error | P0 |
| Toast | Manager `Toast`, New Tab `nt-toast`, popup footer status line | success/info text, close/action in Manager, timeout in New Tab | error, warning, status tones through popup footer | shared toast viewport/item API, timeout/action contract, status variants | P0 |
| EmptyState | Manager `EmptyState`, popup empty copy, New Tab empty text | basic title/body/action in Manager, local empty copy elsewhere | compact/no-action | shared empty state variants, icon/action guidance | P0 |
| Skeleton / Spinner | Manager loading cards, popup page-preview skeleton/spinner, popup create spinner | loading skeleton/spinner in local flows | reduced-motion handling mostly in Popup | shared primitive names and state ownership | P0 |
| SiteIcon | `SiteFavicon` | favicon, fallback label, fixed box, lazy image | failed-image fallback via cache behavior | explicit loading state, custom shortcut icon story/test coverage | P0 |

## P1 Business Pattern State Matrix

| Pattern | Current implementations | Present states | Partial states | Missing / weak states | Priority |
|---|---|---|---|---|---|
| Folder picker | Manager `FolderPickerDialog`, popup `InlineFolderPicker`, popup `DefaultFolderMenu` | search, selected, empty, loading, disabled target in Manager, keyboard movement in inline picker | create folder, recent folders, active path, Esc | one shared core model, consistent disabled reasons, error state, long folder names, story coverage | P1 |
| Folder cascade menu | `FolderCascadeMenu`, `FolderMoveSubmenuContent` | hover/open path, selected/current folder, disabled target, overflow placement helpers, create-folder action hook | recent folders, search, blur-close | keyboard roving/navigation, state stories for deep nesting/long names/overflow | P1 |
| Save location picker | Popup `SaveLocationPicker`, `LocationPathRow`, `InlineFolderPicker`; popup `DefaultFolderMenu` | selected path, loading, search, create folder, recent folders, disabled main row | saving status through footer, default-folder persistence | error/saved feedback per setting, unified picker core, shared state model | P1 |
| Search box / suggestions | Manager `SearchBar`, folder search inputs, New Tab `SearchPanel` | clear action, focus, active suggestion in New Tab, empty result in folder searches | Escape handling, submit fallback | shared SearchInput/SearchBox contract, empty submit behavior, suggestion keyboard tests | P1 |
| Bookmark card / row | Manager `BookmarkCard`, popup recent bookmark rows, New Tab featured/preview/activity rows | favicon, title/url copy, open, hover/focus, selected in Manager | inline edit, drag, loading, long text | shared row/card pattern, edit error state, saving error, drag ghost/invalid target reason | P1 |
| Settings row | Popup settings rows, New Tab customize drawer rows | label/description/control layout, switch/select controls | disabled and keyboard handling | saving/saved/failed feedback, shared row spacing, error messaging | P1 |

## Surface State Coverage

| Surface | Strong current coverage | Main gaps |
|---|---|---|
| Manager workspace | Bookmark loading/empty/error, card selected/highlight/drop states, context menu roles, operation log drawer, toast action/busy state. | Dialog focus trap and consistent `role="dialog"`, menu keyboard navigation, field-level edit errors, shared confirm dialog, disabled reasons for future actions. |
| Toolbar popup | Save status line, preview loading/fallback/internal-page states, shared Save Tab form fields, inline folder picker keyboard movement, custom select keyboard handling, switch keyboard handling. | Per-setting saving/saved/failed feedback, unified folder picker core, popup-local card/custom-select/switch contracts, and broader form-control selector retirement. |
| Optional New Tab | Search suggestions, active category, shortcut/dialog/drawer shells, panel empty states, toast timeout. | Empty search submit, Esc behavior before clearing query, suggestion/content tab keyboard coverage, shared drawer/dialog/toast states. |
| Page Ctrl+S bridge | No UI state required. | Shortcut failure/fallback remains a behavior docs and verifier concern, not a component state concern. |

## State Gaps To Convert Into Contracts

1. Button and IconButton have first shared contracts, but still need stories/tests, broader migrations, and legacy selector retirement before they are stable.
2. Dialog and Drawer need a shared accessibility contract for `role`, `aria-modal`, labelled title, initial focus, focus trap, Esc, overlay click, footer loading, and error display.
3. FolderPicker and FolderCascadeMenu need one state model for loading, empty, search, selected, active path, disabled target, create-folder, recent folders, long names, overflow, and keyboard movement.
4. Form controls now have shared runtime primitives for `Input`, `Textarea`, and native `Select`, but broader migration, stories/tests, and page-local selector retirement remain pending; `Switch` is still contract-only.
5. SearchBox needs separate contracts for simple clearable input, folder search, and New Tab suggestions while sharing primitive states.
6. Toast needs consistent success/error/warning/info, timeout, close, action, and busy-state handling.
7. SettingsRow needs async persistence states before Popup settings feedback work begins.

## Story And Test Implications

| Component / pattern | Required story or documented case before calling stable |
|---|---|
| Button / IconButton | all variants, disabled, loading, danger, selected/open, icon-only label requirement |
| Form controls | default, focus, error, disabled, readonly, long content; first runtime migration landed for `Input`, `Textarea`, and native `Select`, with stories/tests still pending |
| Card / Panel | default, elevated, interactive, selected, compact, loading/empty |
| Dialog / Drawer | open, close, Esc, focus trap, loading footer, error, scroll |
| Toast | success, error, warning, info, timeout, action |
| Folder picker / cascade | deep nesting, long names, empty, selected, disabled target, search, create, overflow |
| Search suggestions | empty query, no results, active item, keyboard open, Esc close, submit fallback |

## Related Docs

- [Component inventory](component-inventory.md)
- [Token audit](token-audit.md)
- [Regression checklist](regression-checklist.md)
