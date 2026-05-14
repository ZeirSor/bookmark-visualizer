---
type: workflow
status: active
scope: ai-workflow
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Validation Gate

The validation gate decides whether a task can be marked complete.

## General Rule

Do not mark a task `[x]` until relevant validation passes or a documented exception exists.

## Command Map

The current repository-specific command map lives in `.agents/project-profile/validation.md`. The table below summarizes the active Bookmark Visualizer validation expectations and should stay aligned with that profile.

| Change type | Required validation |
|---|---|
| TypeScript logic | `npm run typecheck`, relevant tests, `npm run build` |
| UI surface behavior | `npm run typecheck`, `npm run build`, surface manual QA |
| Storage / metadata | `npm run test`, `npm run typecheck`, `npm run build`, storage docs check |
| Chrome API / manifest | `npm run typecheck`, `npm run build`, manifest / entry verification, affected manual QA |
| Toolbar popup entry | `npm run typecheck`, `npm run build`, `npm run verify:popup-entry`, popup and shortcut manual QA |
| Removed legacy save surfaces | `npm run typecheck`, `npm run test`, `npm run build`, `npm run verify:popup-entry`, source / dist absence checks |
| Page Ctrl+S shortcut bridge | `npm run typecheck`, `npm run test`, `npm run build`, `npm run verify:popup-entry`, shortcut manual QA |
| New Tab redirect | `npm run typecheck`, `npm run build`, New Tab enable / disable manual QA |
| Documentation-only | `npm run docs:check`, Markdown links, referenced paths, README links if touched |
| AI workflow / validation docs | `npm run docs:check`, targeted stale-path `rg` checks, `npm run typecheck` if scripts or package commands changed |

## Manual QA By Surface

### Manager Workspace

- Open the manager workspace.
- Confirm folder tree renders.
- Select folders and breadcrumbs.
- Search bookmarks.
- Check card actions affected by the change.

### Toolbar Popup / Page Shortcut

- Open toolbar popup from the extension icon and `_execute_action` shortcut on a normal web page.
- Open toolbar popup from a restricted page such as `chrome://extensions/`.
- Confirm Save, Manage, and Settings tabs behave as expected.
- Check current page title / URL detection if affected.
- Check save location picker if affected.
- If page Ctrl+S is enabled, confirm ordinary page `Ctrl+S` opens the popup and editable fields are not intercepted.

### Optional New Tab

- Enable New Tab override in settings.
- Open a new tab and confirm redirect behavior.
- Disable override and confirm browser default behavior returns.
- Test search engine / category behavior if affected.

## Recording Results

Record every validation attempt in `.ai/runs/<run-id>/test-log.md` when a run folder exists.

At minimum include:

- command or manual check;
- result;
- relevant output summary;
- whether failure is new, pre-existing, or unrelated;
- what remains unverified.

## Active Documentation Path Validation

Use `npm run docs:check` when documentation work changes active path references, validation rules, local skills, or workflow docs.

This includes `.agents/project-profile/` changes because profile files are active sources for local skill routing and validation.

Historical AI records are not active source-of-truth documents. Documentation path validation must exclude:

- `.ai/logs/`
- `.ai/dev-changelog/`
- `.ai/archive/`
- concrete `.ai/runs/*` folders except `.ai/runs/_TEMPLATE/`
- `node_modules/`
- `dist/`
- `docs/_archive/tmp/`

Future or proposed paths are allowed only when the nearby text explicitly marks them as future, proposed, planned, or not current implementation.


Project-level validation details live in [Quality validation gate](../quality/validation-gate.md).
