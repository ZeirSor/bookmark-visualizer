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

## Cross-Surface Checks

When changing a primitive, check affected surfaces:

- Manager workspace;
- Toolbar popup;
- Quick Save overlay;
- Optional New Tab;
- shared folder cascade / move menu flows.

## Documentation Sync

If a primitive change alters layout, behavior, or required CSS constraints, update:

- this document;
- affected surface docs;
- `docs/frontend/surfaces/reference/02-ui-element-index.md` when the UI element index changes;
- `docs/frontend/surfaces/reference/03-regression-checklist.md` when regression coverage changes.
