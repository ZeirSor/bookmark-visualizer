# Project Profile

This directory is the Bookmark Visualizer adapter layer for the portable local skills in `.agents/skills/`.

The local skills should not hard-code Bookmark Visualizer source paths, docs paths, UI surfaces, package commands, or manual QA details. Put those facts here instead.

## Files

| File | Purpose |
|---|---|
| `docs-map.md` | Maps project knowledge areas to active documentation locations. |
| `surfaces.md` | Maps UI surfaces, runtime helpers, source paths, and likely affected docs. |
| `validation.md` | Maps change types to package commands and manual QA checks. |
| `playbooks.md` | Maps repeatable work types to `docs/playbooks/*.playbook.md`. |
| `ai-workflow.md` | Defines run-folder, handoff, and workflow conventions for this repository. |
| `portability.md` | Explains how to copy these skills into a different repository. |

## Current Architecture Facts

- `popup.html` is the primary current-page save entry.
- `index.html` is the full manager workspace.
- `newtab.html` is the optional New Tab portal.
- `src/features/page-shortcut/content.ts` is an optional listener that asks the background to open the popup; it is not a UI surface.
- `src/features/quick-save/` contains save helpers and view-model logic used by popup/background flows; it is not a content-script overlay surface.
- Historical `save.html`, Save Overlay, and Shadow DOM Quick Save dialog docs belong in `docs/_archive/` and must not be treated as current facts.

## Maintenance Rule

When active docs move, source paths change, package scripts change, or UI entry behavior changes, update this profile in the same work round as the docs/code change.
