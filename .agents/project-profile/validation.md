# Project Validation Profile

This profile file defines Bookmark Visualizer validation commands and manual QA checks. Portable skills should use this file instead of hard-coding project commands.

## Command Map

| Change type | Commands / checks |
|---|---|
| TypeScript logic | `npm run typecheck`, relevant tests, `npm run build` |
| UI surface behavior | `npm run typecheck`, `npm run build`, affected surface manual QA |
| Storage / metadata | `npm run test`, `npm run typecheck`, `npm run build`, storage docs check |
| Chrome API / manifest | `npm run typecheck`, `npm run build`, manifest / entry verification, affected manual QA |
| Toolbar popup entry | `npm run typecheck`, `npm run build`, `npm run verify:popup-entry`, popup and shortcut manual QA |
| Page Ctrl+S shortcut bridge | `npm run typecheck`, `npm run test`, `npm run build`, `npm run verify:popup-entry`, shortcut manual QA |
| Save protocol / Quick Save helpers | `npm run test`, `npm run typecheck`, `npm run build`, `npm run verify:popup-entry`, popup save flow manual QA if behavior changed |
| Removed legacy save surfaces | `npm run typecheck`, `npm run test`, `npm run build`, `npm run verify:popup-entry`, source / dist absence checks |
| New Tab redirect | `npm run typecheck`, `npm run build`, New Tab enable / disable manual QA |
| Documentation-only | `npm run docs:check`, Markdown links, referenced paths, README links if touched |
| AI workflow / validation docs | `npm run docs:check`, targeted stale-path `rg` checks, `npm run skills:audit`, `npm run typecheck` if scripts or package commands changed |
| Local skill portability | `npm run skills:audit`, `npm run docs:check`, profile path checks |

If a command is unavailable, record that explicitly and do not claim it passed.

## Manual QA By Surface Or Runtime Area

### Manager Workspace

- Open the manager workspace.
- Confirm folder tree renders.
- Select folders and breadcrumbs.
- Search bookmarks.
- Check affected card, folder, or command actions.

### Toolbar Popup / Page Shortcut

- Open toolbar popup from the extension icon and `_execute_action` shortcut on a normal web page.
- Open toolbar popup from a restricted page such as `chrome://extensions/`.
- Confirm Save, Manage, and Settings tabs behave as expected.
- Check current page title / URL detection if affected.
- Check save location picker and recent folders if affected.
- If page Ctrl+S is enabled, confirm ordinary page `Ctrl+S` opens the popup and editable fields are not intercepted.

### Save Protocol / Quick Save Helpers

- Trigger the normal popup save flow.
- Confirm folder loading, create-folder behavior, and recent-folder updates if affected.
- Confirm the background message handler still receives and returns the expected payload shape if message contracts changed.
- Confirm no legacy content-script overlay, Shadow DOM dialog, or `save.html` path is reintroduced.

### Optional New Tab

- Enable New Tab override in settings.
- Open a new tab and confirm redirect behavior.
- Disable override and confirm browser default behavior returns.
- Test search engine / category behavior if affected.

### Shared UI

- Test every surface that consumes the changed shared component.
- Check overflow, long text, focus, hover, and disabled states when relevant.

## Active Documentation Path Validation

Use `npm run docs:check` when documentation work changes active path references, validation rules, local skills, project profiles, or workflow docs.

Historical and generated records are not active source-of-truth documents. Documentation path validation must exclude:

- `.ai/logs/`
- `.ai/dev-changelog/`
- `.ai/archive/`
- concrete `.ai/runs/*` folders except `.ai/runs/_TEMPLATE/`
- `node_modules/`
- `dist/`
- `docs/_archive/`

Future or proposed paths are allowed only when the nearby text explicitly marks them as future, proposed, planned, or not current implementation.
