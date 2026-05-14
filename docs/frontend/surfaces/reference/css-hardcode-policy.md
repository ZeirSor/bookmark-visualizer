---
type: reference
status: active
scope: frontend
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# CSS Hardcode Policy

This policy defines the Phase 1 guardrail for new UI CSS. It applies to Manager, Popup, New Tab, shared components, and future `src/design-system/` primitives or patterns.

## Rule

New page-level CSS must not introduce raw visual values for:

- hex colors;
- raw `rgb()` / `rgba()` colors for borders, backgrounds, rings, or shadows;
- one-off `border-radius` values;
- one-off `box-shadow` recipes;
- raw `z-index` values;
- raw transition durations or easing values;
- custom focus-ring shadows.

Use existing tokens from `src/styles/tokens.css` first. If a token is missing, add it to the correct layer before using it.

## Token Selection

Use the narrowest stable token layer that describes the value:

| Need | Preferred layer | Examples |
|---|---|---|
| Stable base color, radius, shadow, motion, or z-index | Raw token | `--bv-color-*`, `--bv-radius-*`, `--bv-shadow-*`, `--bv-motion-*`, `--bv-z-*` |
| Shared UI meaning | Semantic token | `--bv-color-text`, `--bv-color-line`, `--bv-color-accent`, `--bv-focus-ring` |
| Reusable primitive or pattern visual contract | Component token | `--bv-button-*`, `--bv-input-*`, `--bv-card-*`, `--bv-dialog-*`, `--bv-menu-*` |
| Surface density or layout adaptation | Surface alias | `--popup-*`, `--nt-*`, `--app-*` |

Surface aliases may adapt spacing, density, dimensions, and page shell needs. They must not become a parallel button, input, menu, dialog, toast, or card styling system.

## Allowed Raw Values

Raw values are allowed when they are structural rather than visual-system ownership:

- layout sizes, such as grid tracks, fixed popup dimensions, max widths, safe-area spacing, or media-query breakpoints;
- type sizes and weights until typography tokens are introduced;
- icon dimensions and SVG geometry;
- transform distances when they are tied to layout mechanics;
- third-party or content-derived values, such as favicon fallback data or externally supplied images;
- values inside `src/styles/tokens.css` when defining raw tokens.

When a raw value is intentionally visual and cannot be tokenized yet, record it in [Token exceptions](token-exceptions.md).

## Not Allowed

Do not add new values like these in page CSS:

```css
.new-surface-button {
  color: #2563eb;
  border-radius: 13px;
  box-shadow: 0 12px 30px rgb(15 23 42 / 0.15);
  transition: all 180ms ease;
  z-index: 67;
}
```

Prefer tokenized values:

```css
.new-surface-button {
  color: var(--bv-button-text-accent);
  border-radius: var(--bv-radius-control);
  box-shadow: var(--bv-button-shadow-primary);
  transition: color var(--bv-motion-fast), background var(--bv-motion-fast);
  z-index: var(--bv-z-popover);
}
```

## Migration Rules

- Do not mechanically replace legacy raw values without checking hover, focus, selected, disabled, loading, empty, and error states.
- Keep legacy page selectors during staged primitive migration when needed for layout compatibility.
- Retire legacy selector recipes only after `rg` confirms no remaining usage.
- If a legacy value is page-specific and still needed, either promote it to a token or record it as an exception in task `1.6`.

## Review Checks

Before completing UI CSS work, run targeted scans on touched files:

```powershell
rg --line-number -- "#[0-9a-fA-F]{3,8}|rgba?\\(|box-shadow:|border-radius:|z-index:|transition:" src/app src/popup src/newtab src/components src/design-system
```

Then classify each match:

- existing legacy value not touched in the task;
- token source definition in `src/styles/tokens.css`;
- structural raw value allowed by this policy;
- value to replace with a token before completion;
- intentional exception to record in [Token exceptions](token-exceptions.md).

## Related Docs

- [Token ownership](token-ownership.md)
- [Token audit](token-audit.md)
- [Token exceptions](token-exceptions.md)
- [Component state matrix](component-state-matrix.md)
- [Design system](../../design-system.md)
