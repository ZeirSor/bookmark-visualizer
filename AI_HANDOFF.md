# AI Handoff

This file is the short entry pointer for a new AI session. It should stay concise. Detailed task state belongs in `.ai/runs/<run-id>/handoff.md`.

## Placement

- Keep this file at the repository root. It is an AI session entry point, not a formal product or architecture document.
- Do not move it into `docs/`; stable facts discovered here must be synchronized back to the relevant `docs/` page instead.
- Archive only superseded snapshots, not the current `AI_HANDOFF.md`.

## Read First

1. `AGENTS.md`
2. `.ai/README.md`
3. `docs/README.md`
4. `docs/workflow/README.md`
5. `docs/playbooks/README.md`
6. `.agents/skills/README.md`
7. `.agents/project-profile/README.md`
8. Active run folder under `.ai/runs/`, if any

## Active Runs

- None currently listed.
- When a long-running task exists, add its folder here, for example:
  - `.ai/runs/2026-05-08__manager-page-ui-refactor/`

## Stable Project Facts

- Bookmark Visualizer is a React / TypeScript / Vite Chrome / Edge Manifest V3 extension.
- Native browser bookmarks are the source of truth for bookmark and folder structure.
- Extension metadata, notes, settings, recent folders, New Tab state, usage data, and UI state live in `chrome.storage.local`.
- Main user-facing surfaces are Manager workspace, Toolbar popup, and optional New Tab dashboard.
- Page Shortcut and Quick Save are runtime/helper flows, not standalone UI surfaces.
- Toolbar action and `Ctrl+Shift+S` open `popup.html`.
- Full manager workspace uses `index.html`.
- Optional New Tab uses runtime redirect behavior rather than a static manifest `chrome_url_overrides.newtab` entry.
- Legacy `save.html`, Save Overlay, and Shadow DOM Quick Save dialog paths are archived and must not be reopened without a new decision.

## Current Entry Points

```text
src/app/                         Full manager workspace entry
src/app/workspace/               Manager layout, state, and workspace components
src/popup/                       Toolbar popup UI
src/features/popup/              Popup current-page info, save requests, and view models
src/features/quick-save/         Save helper logic, folder helpers, UI state helpers, and payload types
src/features/page-shortcut/      Optional page shortcut listener that opens the toolbar popup
src/newtab/                      Optional New Tab UI
src/features/newtab/             New Tab state, search, shortcuts, and runtime redirect support
src/background/                  Service worker registration, commands, messages, popup save handlers, workspace open, New Tab redirect
src/lib/chrome/                  Chrome bookmarks / storage / permissions adapters
src/components/                  Cross-surface UI components
src/styles/tokens.css            Global design tokens
```

## Root Documentation Files

- `README.md` and `README.zh-CN.md` are external project entry documents and should mirror current code, docs, and manifest behavior.
- `CHANGELOG.md` remains at the repository root as the release-facing change log. Historical snapshots belong under `docs/_archive/project/`.
- `AI_HANDOFF.md` remains at the repository root as the current AI entry pointer.

## Do Not Reopen Without User Request

- Firefox support.
- Backend / cloud sync.
- AI summary fetching.
- Static manifest New Tab override.
- Replacing native bookmarks as source of truth.
- Writing notes or summaries back into native bookmark title / URL fields.
- Default global host permissions for webpage fetching.
- Direct integration back into the old CleanBook CLI project.
- Restoring legacy `save.html`, Save Overlay, or Shadow DOM Quick Save dialog surfaces.

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
npm run docs:root-check
npm run docs:check
npm run agents:check
npm run skills:audit
npm run verify:popup-entry
npm run typecheck
npm run test
npm run build
```

Use `docs/quality/validation-gate.md`, `docs/workflow/validation-gate.md`, and `project-validation-gate` to choose the required validation set for each task.
