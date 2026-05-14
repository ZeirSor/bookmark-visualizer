---
type: reference
status: active
scope: frontend
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Icons And UI Primitives

This document tracks shared UI primitive conventions used across Bookmark Visualizer surfaces.

## Scope

Covers reusable visual primitives such as:

- icons and icon buttons;
- buttons;
- inputs;
- chips / pills;
- menus;
- cards;
- modals / dialogs;
- toasts;
- empty states;
- focus and hover states.

## Ownership

Shared primitives should live in `src/components/` or another clearly shared UI layer. Surface-specific wrappers may live in surface folders, but they should not redefine base behavior in incompatible ways.

## Rules

- Use shared design tokens from `src/styles/tokens.css` when possible.
- Keep icon and label spacing stable with long text.
- Use `min-width: 0` and explicit flex constraints in rows containing icons plus truncating text.
- Do not rely on fixed pixel hacks when intrinsic layout constraints solve the issue.
- Maintain focus-visible states for keyboard users.
- Keep destructive actions visually distinct and confirm where needed.
- Do not introduce direct `chrome.*` calls inside pure UI primitives.

## SiteFavicon

`src/components/SiteFavicon.tsx` is the shared website icon primitive for surfaces that render bookmark URLs.

Rules:

- Pass the bookmark/page URL and title; pass a letter or shortcut icon fallback when the caller already has one.
- The component is decorative (`aria-hidden`) because nearby link/card text already exposes the site title.
- Favicon lookup and IndexedDB cache policy must stay in `src/features/favicon/*`.
- UI surfaces must keep the image and fallback in the same fixed-size box to prevent layout shift.
- Do not add direct Google s2, DuckDuckGo, or other third-party favicon URL construction in individual components.

## Button And IconButton

`src/design-system/primitives/Button/` owns the first shared P0 button primitives.

Rules:

- Use `Button` for text actions with `variant`, `size`, `loading`, `selected`, and optional leading/trailing icons.
- Use `IconButton` for icon-only actions; `label` is required and becomes the accessible name.
- Shared button styling must consume `--bv-button-*`, `--bv-icon-button-*`, control-height, focus-ring, radius, and motion tokens.
- Surface selector classes may remain during first migration only for layout and compatibility. Retire them after `rg` confirms no remaining usage.
- Do not create new page-local button color, radius, shadow, focus, or loading recipes.

## Form Controls

`src/design-system/primitives/FormControls/` owns the P0 form-control layer. `Input`, `Textarea`, and native `Select` are runtime primitives exported from `src/design-system`; `Switch` is still documented as a contract only.

Rules:

- Use shared `Input`, `Textarea`, and native `Select` for generic low-risk fields where native browser behavior should be preserved.
- `Input`, `Textarea`, and native `Select` must consume `--bv-input-*`, control-height, focus-ring, radius, and motion tokens.
- `Switch` must use `button role="switch"` semantics with a required accessible `label`; it needs a future `--bv-switch-*` token group before broad runtime migration.
- Native select is the first shared select primitive. Popup `CustomSelect` remains page-local until Menu/Listbox primitives exist.
- Form controls preserve user input in error states; settings persistence feedback belongs to the caller or a future SettingsRow pattern.

## First-Pass Component Tokens

`src/styles/tokens.css` now owns first-pass component token groups for upcoming primitives:

- `--bv-input-*` for text input, textarea, and native select shells.
- `--bv-card-*` and `--bv-panel-*` for reusable content surfaces.
- `--bv-dialog-*` and `--bv-drawer-*` for overlay shells and layering.
- `--bv-menu-*` for menu/popover shells and rows.
- `--bv-toast-*` for status feedback.
- `--bv-chip-*` for compact selected/filter/recent-folder affordances.

`--bv-input-*` now backs the runtime `Input`, `Textarea`, and native `Select` primitives. Other token groups may remain contracts until the matching runtime primitives are introduced. Surface CSS may consume shared tokens during migration, but should not fork their color, radius, focus, z-index, motion, or shadow recipes.

## Cross-Surface Checks

When changing a primitive, check affected surfaces:

- Manager workspace;
- Toolbar popup;
- Popup save flow and Page Shortcut bridge;
- Optional New Tab;
- shared folder cascade / move menu flows.

## Documentation Sync

If a primitive change alters layout, behavior, or required CSS constraints, update:

- this document;
- affected surface docs;
- `docs/frontend/surfaces/reference/ui-element-index.md` when the UI element index changes;
- `docs/frontend/surfaces/reference/regression-checklist.md` when regression coverage changes.
