# Token Audit

This audit records the current design-token and raw CSS value baseline for the UI-system refactor. It is descriptive, not a cleanup patch.

## Scope

Audited files:

- `src/styles/tokens.css`
- `src/app/styles.css`
- `src/popup/styles.css`
- `src/newtab/styles.css`
- `docs/frontend/design-system.md`
- `docs/frontend/component-patterns.md`
- `docs/frontend/accessibility-and-interaction.md`

## Current Token Layers

| Layer | Current owner | Current status | Notes |
|---|---|---|---|
| Base tokens | `src/styles/tokens.css` | Exists | Owns `--bv-color-*`, `--bv-radius-*`, `--bv-shadow-*`, font tokens, and surface aliases. |
| Semantic tokens | `src/styles/tokens.css` | Partial | Color semantics exist for text, surface, line, accent, success, danger, orange, and blue. Motion, z-index, focus-ring, and component semantics are not fully centralized. |
| Surface aliases | `src/styles/tokens.css`, plus surface CSS `:root` aliases | Mixed | `--nt-*`, `--popup-*`, and `--app-*` exist in global tokens, but Manager and Popup also define extra local alias layers in page CSS. |
| Component tokens | `src/styles/tokens.css`, partial first pass | Partial | Button, IconButton, Input, Card, Panel, Dialog, Drawer, Menu, Toast, and Chip component token groups now exist. Switch, tabs, empty/loading primitives, and search controls still need token contracts. |
| Token exceptions | none yet | Missing | Intentional raw values are not listed in a formal exceptions document. |

## Raw Value Summary

The counts below come from targeted regex scans on 2026-05-11. They are meant to guide cleanup priority, not to prove every value is wrong.

| File | Hex declarations | RGB/RGBA declarations | Unique radius values | Shadow declarations | Z-index declarations | Motion declarations | Focus/outline declarations |
|---|---:|---:|---:|---:|---:|---:|---:|
| `src/app/styles.css` | 33 | 15 | 15 | 24 | 1 | 17 | 65 |
| `src/popup/styles.css` | 35 | 53 | 16 | 16 | 1 | 20 | 48 |
| `src/newtab/styles.css` | 19 | 13 | 13 | 12 | 7 | 3 | 34 |
| `src/styles/tokens.css` | 37 | 15 | n/a | token source | n/a | none | none |

## Surface Findings

### Manager Workspace CSS

`src/app/styles.css` has the highest amount of local token-like ownership. It defines aliases such as `--surface-card-hover`, `--border-subtle`, `--text-secondary`, `--color-warning`, `--color-danger`, `--radius-*`, `--shadow-*`, `--motion-*`, and `--z-*` inside the page stylesheet.

Notable raw values:

- Hex values include `#fbfbff`, `#e8ebf3`, `#4b5568`, `#f59e0b`, `#dc2626`, `#fef2f2`, dark-mode values like `#1d2435`, `#202638`, `#252c3d`, `#a5a6ff`, and repeated `#ffffff`.
- Radius values include `2px`, `3px`, `6px`, `7px`, `8px`, `10px`, `999px`, and page-local `--radius-*` aliases.
- Shadow values include page-local card, hover, popover, dark, and focus shadows.
- Z-index values are mostly routed through local aliases such as `--z-popover`, `--z-drawer`, and `--z-toast`.

Risk:

- Manager CSS is effectively a second design system layered on top of `src/styles/tokens.css`.
- Dark-mode values are still local to Manager aliases and should either be formalized or documented as exceptions before broad primitive migration.

### Toolbar Popup CSS

`src/popup/styles.css` consumes many `--popup-*` aliases, but still contains raw values in component-specific selectors.

Notable raw values:

- Hex values include repeated `#ffffff`, `#fbfcff`, `#475569`, `#1d4ed8`, `#2563eb`, and gradient stops such as `#5b55f6`, `#392bd8`, `#4d46ea`, and `#3325c4`.
- RGB/RGBA values are concentrated in translucent borders, topbar backgrounds, focus rings, and shadows.
- Radius values include `3px`, `6px`, `7px`, `8px`, `9px`, `10px`, `12px`, `14px`, `16px`, `18px`, `99px`, and `999px`.
- Motion is more developed than other surfaces, with menu, submenu, tab-content, picker, row, skeleton, and spinner keyframes plus a `prefers-reduced-motion` block.

Risk:

- Popup has the most polished local system, but it is still selector-owned. Moving primitives later must preserve popup density while routing radius, focus, shadow, and motion through shared component tokens.

### Optional New Tab CSS

`src/newtab/styles.css` relies on `--nt-*` aliases and has fewer total raw values than Popup and Manager, but it still owns important visual behavior locally.

Notable raw values:

- Raw colors include `#8b8cff`, `#7c3aed`, `#4285f4`, `#2563eb`, `#ea580c`, `#b42318`, and repeated `#ffffff`.
- Z-index values include `10`, `25`, `30`, `40`, `50`, `60`, and `70`, all page-local.
- Radius values include `8px`, `9px`, `10px`, `11px`, `12px`, `14px`, `16px`, `18px`, and `999px`.
- Background decoration uses radial gradients in `.nt-page`; this is a visual-system exception candidate if retained.

Risk:

- New Tab has local panel, search, suggestion, drawer, dialog, and toast styling. It needs component tokens before shared primitives can replace those shells safely.

## Token Gaps By Category

| Category | Current status | Recommended Phase 1 action |
|---|---|---|
| Motion | Page-local `--motion-*` exists only in Manager; Popup has keyframes and transitions; New Tab has a smaller transition set. | Add shared `--bv-motion-*` duration/easing tokens and document animation exceptions. |
| Z-index | Manager has local aliases; Popup has `80` for custom select; New Tab uses raw layer values from `10` to `70`. | Add semantic z-index tokens for sticky header, dropdown/menu, popover, drawer/dialog, toast. |
| Focus ring | Rings are repeated through raw `rgb(...)` / `rgba(...)` values and local `--shadow-focus`. | Add `--bv-focus-ring-*` or component-level focus-ring tokens. |
| Control height | Popup has `--popup-control-height`, `--popup-row-height`, `--popup-tab-height`; Manager has local control heights; New Tab uses per-selector min-heights. | Add shared control height tokens for compact, default, large, icon, menu row, tab. |
| Radius | Base tokens exist, but surfaces still use many one-off values and extra aliases. | Define component radius tokens for button/input, card/panel, menu/popover, dialog/drawer, pill. |
| Shadow | Base shadows exist, but surfaces still use local raw shadows and page-specific shadow aliases. | Define component shadow tokens and list intentional decorative shadows as exceptions. |
| Component tokens | Partial. | Button, IconButton, Input, Card, Panel, Dialog, Drawer, Menu, Toast, and Chip groups exist as first-pass contracts; later phases should add Switch, Tabs, EmptyState, Skeleton, Spinner, SiteIcon, and search tokens as primitives/patterns are introduced. |
| Raw-value exceptions | Missing. | Task `1.6` should create the planned future reference doc `token-exceptions.md` under this directory. |

## Cleanup Priority

1. Define shared motion, z-index, focus-ring, control-height, radius, and shadow tokens before changing page CSS.
2. Consume the first-pass component-token groups when migrating Input, Card/Panel, Dialog, Drawer, Toast, Menu, and Chip primitives.
3. Treat Manager page aliases and Popup component selectors as migration inputs, not as final token contracts.
4. Keep New Tab search hero and radial page background as explicit exception candidates until a product/design decision is made.
5. Do not replace raw values mechanically without checking visual states; many values currently encode hover, focus, selected, loading, and overlay behavior.

## Related Docs

- [Component inventory](component-inventory.md)
- [Component state matrix](component-state-matrix.md)
- [Token ownership](token-ownership.md)
- [Design system](../../design-system.md)
- [Component patterns](../../component-patterns.md)
- [Accessibility and interaction](../../accessibility-and-interaction.md)
