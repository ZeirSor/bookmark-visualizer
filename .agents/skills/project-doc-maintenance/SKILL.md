---
name: project-doc-maintenance
description: Use after implementation and validation to keep docs/ plus root README.md and README.zh-CN.md aligned with the current repository. This skill does not write AI logs, dev changelogs, release changelogs, or ADRs unless separately routed.
---

# Project Doc Maintenance

## Purpose

Use this skill near the end of a work round to keep the formal documentation layer aligned with the actual codebase.

This skill maintains:

- `docs/`
- `README.md`
- `README.zh-CN.md`

This skill does not maintain:

- `.ai/logs/`
- `.ai/dev-changelog/`
- `CHANGELOG.md`
- release notes
- ADR files, unless the user explicitly asks and the ADR workflow is separately triggered

## Relationship To Other Skills

- Use `project-doc-routing` before implementation to find the relevant docs to read.
- Use `project-doc-maintenance` after implementation to update docs that became stale.
- Use global repo-record skills after documentation maintenance when worklogs, dev changelogs, release changelogs, or ADR records are needed.

Do not duplicate global repo-record skill responsibilities here.

## Trigger Conditions

Run this skill after any task that changed one or more of these areas:

- Page entrypoints: `index.html`, `popup.html`, `newtab.html`
- Manager surface: `src/app/`, `src/app/workspace/`
- Popup surface: `src/popup/`, `src/features/popup/`
- New Tab surface: `src/newtab/`, `src/features/newtab/`
- Quick Save surface: `src/features/quick-save/`, content script, background quick-save handlers
- Shared UI: `src/components/`, `src/styles/`
- Chrome API boundaries: `src/lib/chrome/`, `src/background/`
- Settings, metadata, storage, import/export, bookmark adapters
- Manifest or permissions: `public/manifest.json`
- Product-visible behavior, UI copy, workflow, validation commands, or repo structure
- Existing docs paths, filenames, or documentation architecture

Do not run this skill for purely internal refactors that do not change public behavior, code paths mentioned in docs, API boundaries, selectors, storage keys, or maintainable knowledge.

## Maintenance Workflow

1. Identify changed files and classify the change:
   - product behavior
   - UI surface
   - component / styling
   - data / storage
   - Chrome API / background
   - architecture boundary
   - validation / test
   - documentation structure
   - README-facing change

2. Use `project-doc-routing` or its routing matrix to locate affected docs.

3. Compare the docs against the current code:
   - referenced file paths exist
   - component names match actual exports / files
   - CSS selectors match current styles
   - storage keys match current constants / usage
   - Chrome API paths match current adapters and environment boundary files
   - UI descriptions match actual buttons, inputs, icons, tabs, menus, dialogs, and states
   - README claims match current extension behavior

4. Update only the smallest necessary documentation set.

5. Preserve the documentation architecture:
   - product intent belongs in `docs/product/`
   - architecture and boundaries belong in `docs/architecture/`
   - data and storage belong in `docs/data/`
   - page-level UI and code-chain docs belong in `docs/frontend/surfaces/`
   - validation steps belong in `docs/guides/`
   - documentation rules belong in `docs/standards/`
   - AI execution workflow belongs in `docs/workflow/`
   - reusable task methods belong in `docs/playbooks/`
   - durable decisions belong in ADRs through the ADR workflow, not through this skill by default

6. Check documentation links and code paths after edits.

7. Summarize:
   - docs updated
   - README files updated or not needed
   - link / path check result
   - any follow-up routed to a separate record skill

## Required Checks

Use these reference files:

- `references/doc-maintenance-checklist.md`
- `references/readme-sync-rules.md`
- `references/surface-doc-sync-map.md`

At minimum, check:

- affected PageDocs
- affected product / architecture / data docs
- docs indexes and cross-links
- root README files, only if the change meets README update rules

## Output Rules

At the end of this skill, report only:

- Changed documentation files
- README sync decision
- Link / path check result
- Any follow-up routed to a separate record skill

Do not write `.ai/logs/`, `.ai/dev-changelog/`, `CHANGELOG.md`, or ADR files from this skill.

## Non-Goals

This skill must not:

- rewrite the whole docs tree without need
- invent features not present in code
- claim future files exist
- update README for small implementation details
- record the task process in `.ai/`
- treat `.ai/runs/` task state as permanent documentation
- replace `project-doc-routing`
