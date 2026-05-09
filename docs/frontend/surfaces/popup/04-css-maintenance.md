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
| `--popup-*` | `src/styles/tokens.css` + `src/popup/styles.css` | Popup dimensions, spacing, shell, controls |
| `--app-*` | `src/styles/tokens.css` + `src/app/styles.css` | Manager workspace |
| `--nt-*` | `src/styles/tokens.css` + `src/newtab/styles.css` | Optional New Tab |

Do not reintroduce save-window-specific token aliases for current popup styling.

## Required Checks

- Popup body remains transparent around the inner shell.
- `.popup-shell` keeps stable 800 x 600 sizing, rounded shell, border, and shadow.
- Settings custom selects and inline folder picker stay inside the popup bounds.
- Page Ctrl+S bridge has no CSS because it renders no UI.
