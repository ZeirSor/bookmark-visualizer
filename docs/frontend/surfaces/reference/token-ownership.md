# Token Ownership

This reference defines the token hierarchy for the shared UI-system refactor. It complements the descriptive baseline in [Token audit](token-audit.md).

## Ownership Model

Use four layers, from stable values to local adaptation:

```text
Raw tokens
  -> Semantic tokens
  -> Component tokens
  -> Surface aliases
```

## Layer Rules

| Layer | Owner | Prefix / examples | May contain raw values? | Purpose |
|---|---|---|---|---|
| Raw tokens | `src/styles/tokens.css` | `--bv-color-*`, `--bv-radius-*`, `--bv-shadow-*`, `--bv-motion-*`, `--bv-z-*` | Yes | Stable project-wide design values. |
| Semantic tokens | `src/styles/tokens.css` | `--bv-color-text`, `--bv-color-line`, `--bv-color-accent`, `--bv-focus-ring` | No, except when defining the semantic mapping itself | User-interface meanings shared by every surface. |
| Component tokens | `src/styles/tokens.css`, consumed by `src/design-system/primitives/**` and `src/design-system/patterns/**` | `--bv-button-*`, `--bv-icon-button-*`, `--bv-input-*`, `--bv-card-*` | No | Visual contracts for reusable primitives and patterns. |
| Surface aliases | surface CSS files only when a surface has a real density or layout need | `--app-*`, `--popup-*`, `--nt-*` | Avoid; document exceptions | Surface adaptation, not a parallel design system. |

## Raw Tokens

Raw tokens are the only place where stable base values should be introduced.

Allowed examples:

- color primitives and state colors;
- base radius sizes;
- base shadow recipes;
- duration and easing values;
- z-index scale values;
- focus-ring measurements.

Raw tokens must be named by visual type, not by page or component. For example, prefer `--bv-radius-control` over `--popup-save-button-radius`.

## Semantic Tokens

Semantic tokens express meaning.

Examples:

- `--bv-color-text`
- `--bv-color-line`
- `--bv-color-accent`
- `--bv-color-danger`
- `--bv-focus-ring`
- `--bv-motion-fast`

Shared components should prefer semantic or component tokens. Page CSS may consume semantic tokens for layout-adjacent styling, but should not invent new color, shadow, radius, z-index, or motion semantics.

## Component Tokens

Component tokens belong to reusable contracts. A component token may map to a semantic token, but callers should not need to know the underlying visual recipe.

Current first-pass component token groups:

- Button: `--bv-button-*`
- IconButton: `--bv-icon-button-*`
- Input / Textarea / Select: `--bv-input-*`
- Card: `--bv-card-*`
- Panel: `--bv-panel-*`
- Dialog: `--bv-dialog-*`
- Drawer: `--bv-drawer-*`
- Menu / Popover: `--bv-menu-*`
- Toast: `--bv-toast-*`
- Chip: `--bv-chip-*`

Planned component token groups:

- Switch
- Tabs
- EmptyState / Skeleton / Spinner / SiteIcon

Component tokens should cover default, hover, active, focus-visible, disabled, loading, selected, danger, long-content, and density variants when those states apply.

## Surface Aliases

Surface aliases are allowed only for surface-specific density or context.

Allowed:

- popup width, height, compact row height, and footer safe area;
- New Tab layout scale and search-first panel sizing;
- Manager dark-mode aliases until they are formalized or documented as exceptions.

Not allowed:

- a new page-local button color system;
- raw per-selector hover colors for shared controls;
- one-off z-index values for overlays;
- new shadow recipes in page CSS without a token or exception.

## Hardcode Policy

The full guardrail is maintained in [CSS hardcode policy](css-hardcode-policy.md). In short, new page-level CSS must not add raw values in these categories:

- hex colors;
- raw `rgb()` / `rgba()` colors for borders, backgrounds, rings, or shadows;
- border radius values;
- z-index values;
- transition durations or easing values;
- focus-ring shadows.

Intentional exceptions belong in [Token exceptions](token-exceptions.md).

## Migration Notes

- Existing page CSS may keep legacy selector classes while a primitive is first adopted, but the shared primitive itself must use token-only styling.
- Retire old page selectors only after `rg` confirms no remaining usage.
- When component tokens are added incrementally, keep the parent task open until the full primitive set has coverage.
