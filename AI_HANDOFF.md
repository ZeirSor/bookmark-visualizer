# AI Handoff

This file is the short entry pointer for a new AI session. It should stay concise. Detailed task state belongs in `.ai/runs/<run-id>/handoff.md`.

## Read First

1. `AGENTS.md`
2. `.ai/README.md`
3. `docs/README.md`
4. `docs/workflow/README.md`
5. `docs/playbooks/README.md`
6. Active run folder under `.ai/runs/`, if any

## Active Runs

- None currently listed.
- When a long-running task exists, add its folder here, for example:
  - `.ai/runs/2026-05-08__manager-page-ui-refactor/`

## Stable Project Facts

- Bookmark Visualizer is a React / TypeScript / Vite Chrome / Edge Manifest V3 extension.
- Native browser bookmarks are the source of truth for bookmark and folder structure.
- Extension metadata, notes, settings, recent folders, New Tab state, usage data, and UI state live in `chrome.storage.local`.
- Main user-facing areas are Manager workspace, Toolbar popup, Quick Save overlay, and optional New Tab dashboard.
- Toolbar action opens `popup.html`.
- Full manager workspace uses `index.html`.
- Optional New Tab uses runtime redirect behavior rather than a static manifest `chrome_url_overrides.newtab` entry.

## Current Entry Points

```text
src/app/                         Full manager workspace entry
src/app/workspace/               Manager layout, state, and workspace components
src/popup/                       Toolbar popup UI
src/features/popup/              Popup current-page info, save requests, and view models
src/features/quick-save/         Quick Save content UI, page info, folder picker, and save requests
src/newtab/                      Optional New Tab UI
src/features/newtab/             New Tab state, search, shortcuts, and runtime redirect support
src/background/                  Service worker registration, commands, messages, workspace open, New Tab redirect
src/lib/chrome/                  Chrome bookmarks / storage / permissions adapters
src/components/                  Cross-surface UI components
src/styles/tokens.css            Global design tokens
```

## Do Not Reopen Without User Request

- Firefox support.
- Backend / cloud sync.
- AI summary fetching.
- Static manifest New Tab override.
- Replacing native bookmarks as source of truth.
- Writing notes or summaries back into native bookmark title / URL fields.
- Default global host permissions for webpage fetching.
- Direct integration back into the old CleanBook CLI project.

## Working Method

For complex tasks, do not rely on chat history alone.

Use:

```text
AGENTS.md
→ docs/workflow/
→ docs/playbooks/
→ .agents/skills/
→ .ai/runs/<run-id>/
```

Then execute one checked sub-task at a time, validate, update run files, synchronize formal docs, and leave a clear handoff.

## Validation Reminder

Common validation commands:

```bash
npm run typecheck
npm run test
npm run build
npm run verify:popup-entry
```

Use `docs/workflow/validation-gate.md` and `project-validation-gate` to choose the required validation set for each task.
