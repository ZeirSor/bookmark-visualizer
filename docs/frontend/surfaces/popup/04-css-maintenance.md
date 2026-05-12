# Popup CSS Maintenance

## Active CSS Chain

```text
popup.html
  → src/popup/main.tsx
  → src/styles/tokens.css
  → src/popup/styles.css
  → src/popup/PopupApp.tsx
```

The toolbar popup owns the save UI shell. Removed legacy save surfaces no longer provide CSS overrides.

## Token Boundaries

| Token group | Owner | Notes |
|---|---|---|
| `--bv-*` | `src/styles/tokens.css` | Shared global design tokens |
| `--bv-button-*`, `--bv-input-*`, `--bv-card-*`, `--bv-panel-*`, `--bv-dialog-*`, `--bv-drawer-*`, `--bv-menu-*`, `--bv-toast-*`, `--bv-chip-*` | `src/styles/tokens.css` | Shared component-token contracts for new primitives and low-risk migration |
| `--popup-*` | `src/styles/tokens.css` + `src/popup/styles.css` | Popup dimensions, spacing, shell, controls |
| `--app-*` | `src/styles/tokens.css` + `src/app/styles.css` | Manager workspace |
| `--nt-*` | `src/styles/tokens.css` + `src/newtab/styles.css` | Optional New Tab |

Do not reintroduce save-window-specific token aliases for current popup styling.

Popup currently has shared `Button` / `IconButton` migrations through `src/design-system/primitives/Button/` and shared `Input` / `Textarea` usage for Save Tab title, URL, and note fields through `src/design-system/primitives/FormControls/`. Keep legacy popup selector classes only for layout compatibility during migration; new visual recipes should use shared component tokens or be recorded in [Token exceptions](../reference/token-exceptions.md). Popup `CustomSelect`, folder search, folder-picker create rows, and settings `Switch` remain local for later tasks.

## Required Checks

- Popup body/root use full-bleed `--popup-page-bg`; do not reintroduce transparent outer padding.
- `.popup-shell` keeps stable 720 x 600 sizing as a full-viewport app shell with no outer radius, border, or shell shadow.
- Save Tab keeps `.save-layout` as a single-column vertical flow with the preview centered above the form.
- Save Tab inline folder picker uses a constrained internal scroll body so expanded folder browsing stays inside the popup content area.
- `.popup-content` keeps a bottom safe area and stable scrollbar gutter so Manage / Settings content can scroll cleanly above the footer.
- Settings rows use `.setting-row` with a label/helper column, a bounded control column, and hairline dividers.
- Settings custom selects use `.custom-select-trigger`, a down chevron, and a white popover menu with checkmarks.
- Settings default folder picker expands through `.default-folder-picker-expanded` as a full-width block inside the section.
- Page Ctrl+S bridge has no CSS because it renders no UI.
- New or changed page-level CSS follows [CSS hardcode policy](../reference/css-hardcode-policy.md): no new page-local raw colors, radius, shadows, z-index values, motion timings, or focus rings without a documented exception.
