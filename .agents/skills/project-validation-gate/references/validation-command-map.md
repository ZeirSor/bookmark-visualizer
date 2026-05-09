# Validation Command Map

| Change type | Commands |
|---|---|
| TypeScript logic | `npm run typecheck`, relevant tests, `npm run build` |
| UI surface | `npm run typecheck`, `npm run build` |
| Storage / metadata | `npm run test`, `npm run typecheck`, `npm run build` |
| Chrome API / manifest | `npm run typecheck`, `npm run build`, affected verification script if present |
| Save window entry | `npm run build`, `npm run verify:save-window-entry` |
| Quick Save shortcut / injection | `npm run typecheck`, `npm run build`, shortcut manual QA |
| New Tab redirect | `npm run typecheck`, `npm run build`, New Tab enable / disable manual QA |
| Documentation-only | `npm run docs:check`, Markdown link / path check |
| AI workflow / validation docs | `npm run docs:check`, targeted stale-path `rg` checks, `npm run typecheck` if scripts or package commands changed |

If a command is unavailable, record that explicitly and do not claim it passed.
