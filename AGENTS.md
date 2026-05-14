# AGENTS.md

This file defines the project-level working rules for AI agents working on Bookmark Visualizer.

Bookmark Visualizer is a Manifest V3 Chrome / Edge extension with multiple UI surfaces, formal project documentation, local Agent skills, and an AI-assisted development workflow. Agents must keep code, UI behavior, documentation, AI run state, and validation records aligned.

## Project Scope

Bookmark Visualizer contains these user-facing surfaces:

- Manager workspace: full bookmark management surface, entered from `index.html`.
- Toolbar popup: compact extension popup, entered from `popup.html`.
- Quick Save overlay: content-script / background-assisted save flow for the current page.
- Optional New Tab: search-first bookmark dashboard, entered from `newtab.html` when enabled.

The extension uses browser-native bookmarks as the source of truth:

- Native bookmark structure belongs to `chrome.bookmarks`.
- Extension-owned metadata, notes, settings, recent folders, New Tab state, usage data, and UI state belong to `chrome.storage.local`.

## Key Code Areas

Use the current repository structure as the source of truth. Do not rely on stale paths from older docs.

```text
src/
  app/                 Full manager workspace app shell and workspace state
  app/workspace/       Manager workspace layout and page-level components
  background/          MV3 service worker, command handlers, message routing, quick-save, new-tab redirect
  components/          Shared UI primitives and reusable components
  domain/              Bookmark, folder, activity, table-view, and related domain models
  features/            Feature modules: bookmarks, popup, quick-save, newtab, settings, metadata, search
  lib/chrome/          Chrome API adapters and mockable browser integration layer
  newtab/              Optional New Tab surface
  popup/               Toolbar popup surface
  styles/              Shared design tokens and surface-level styles
public/
  manifest.json        Manifest V3 extension manifest
  icons/               Extension icons
index.html             Full manager workspace entry
popup.html             Toolbar popup entry
newtab.html            Optional New Tab entry
docs/                  Formal project docs, workflow docs, playbooks, standards, and ADRs
.ai/                   AI run state, worklogs, and development changelog records
.agents/skills/        Local Agent skills for routing, orchestration, validation, and docs maintenance
.agents/project-profile/
                        Bookmark Visualizer-specific profile consumed by portable local skills
```

## Documentation And AI State System

Project knowledge is split by durability and purpose.

- `docs/` is the long-lived project knowledge base.
- `docs/workflow/` defines the AI-assisted development lifecycle.
- `docs/playbooks/` defines reusable task execution playbooks.
- `docs/adr/` records durable architectural decisions.
- `.ai/runs/` stores active or resumable task state.
- `.ai/logs/` stores per-round historical worklogs.
- `.ai/dev-changelog/` stores phase-level development summaries.
- Root README files are public onboarding and project overview documents.

Do not mix these layers:

- Do not use `.ai/logs/` as an active task tracker.
- Do not use `docs/` as a scratchpad for temporary task progress.
- Do not leave durable product, architecture, or data rules only in `.ai/` records.
- Do not claim planned files, features, or commands exist unless they are present in code or explicitly marked as planned.
- Active documentation path validation excludes historical/generated records such as `.ai/logs/`, `.ai/dev-changelog/`, `.ai/archive/`, concrete `.ai/runs/*` folders except `.ai/runs/_TEMPLATE/`, `docs/tmp/`, `dist/`, and `node_modules/`.

## Work Mode Decision

Before starting, classify the task into one of these modes.

### Direct Mode

Use only for small, obvious, low-risk work.

Examples:

- one-line documentation typo
- explicitly named single-file edit
- simple explanation without repository changes
- small markdown link correction

Direct Mode does not require a run folder unless the user asks for one.

### Spec-run Mode

Use when the task changes product behavior, UI, data, storage, architecture, Chrome API boundaries, validation, or multiple files.

Required:

- create or reuse `.ai/runs/<run-id>/`
- maintain `spec.md`, `plan.md`, `tasks.md`, `test-log.md`, and `handoff.md`
- implement one unchecked sub-task or one explicitly requested small batch at a time
- validate before marking a task complete

### Playbook Mode

Use when the task matches a repeatable workflow.

Examples:

- feature implementation
- UI surface refactor
- bugfix
- documentation sync
- review / audit

Required:

- use `project-playbook-routing`
- read the matching `docs/playbooks/*.playbook.md`
- create or reuse a run folder when the work is complex or multi-step
- follow playbook stop rules and validation requirements

## Local Skill Responsibilities

This repository defines local skills. They complement global repo-record skills.

The local skills are designed as portable workflow skills. Generic process belongs in `.agents/skills/`; Bookmark Visualizer-specific surfaces, source paths, validation commands, README rules, and AI workflow conventions belong in `.agents/project-profile/`. When changing local skill behavior, update the profile when the fact is project-specific instead of hard-coding it into `SKILL.md`.

### `project-doc-routing`

Use before implementation, investigation, or documentation editing.

Purpose: identify the smallest relevant set of formal docs to read for the task.

It answers:

- Which docs should be read before implementation?
- Which docs are likely to be affected after implementation?
- Which docs are intentionally out of scope?

It does not update docs or write logs. It reads `.agents/project-profile/docs-map.md` and `.agents/project-profile/surfaces.md` for this repository's current docs and surface mappings.

### `project-playbook-routing`

Use after task classification and before planning when the task matches a repeatable workflow.

Purpose: select the relevant playbook under `docs/playbooks/`.

It answers:

- Is this a feature, UI refactor, bugfix, docs sync, review, or mixed workflow?
- Which playbook should constrain the work?
- Which workflow docs should also be read?

It does not implement code. It reads `.agents/project-profile/ai-workflow.md` when repository-specific workflow conventions are needed.

### `project-run-orchestration`

Use for any complex task that needs a resumable state file set.

Purpose: create or resume `.ai/runs/<run-id>/` and keep `spec.md`, `plan.md`, `tasks.md`, `test-log.md`, and `handoff.md` coherent.

It answers:

- Does this task need a run folder?
- What is the current executable sub-task?
- What must be updated before stopping?

It does not replace product, architecture, data, or PageDocs. It reads `.agents/project-profile/ai-workflow.md` for repository-specific run-folder and workflow conventions.

### `project-validation-gate`

Use before marking any task complete.

Purpose: select validation commands and manual QA checks for the change type.

It answers:

- Which commands should be run?
- Which surface-specific manual checks are required?
- Can the task be marked complete?
- What must be written to `test-log.md`?

It reads `.agents/project-profile/validation.md` for this repository's command map and manual QA checks.

### `project-doc-maintenance`

Use after implementation and validation, before global repo-record logging.

Purpose: keep `docs/`, `README.md`, and `README.zh-CN.md` aligned with the current codebase.

It answers:

- Which formal docs became stale because of this change?
- Which README files need updating, if any?
- Are code paths, CSS selectors, UI elements, storage keys, and Chrome API boundaries still accurate?

It does not write `.ai/logs/`, `.ai/dev-changelog/`, `CHANGELOG.md`, or ADRs. It reads `.agents/project-profile/docs-map.md` and `.agents/project-profile/surfaces.md` for repository-specific documentation routing and README rules.

## Required Workflows

### Standard Code / UI / Behavior Change

For any task that changes product behavior, UI surfaces, storage, settings, Chrome API boundaries, manifest entries, validation commands, or durable architecture:

1. Read this `AGENTS.md`.
2. Classify the work mode: Direct, Spec-run, Playbook, or a combination.
3. Use `project-doc-routing` to identify relevant formal docs.
4. Use `project-playbook-routing` if the task matches a repeatable workflow.
5. For complex work, use `project-run-orchestration` to create or resume `.ai/runs/<run-id>/`.
6. Write or update `spec.md`, `plan.md`, and `tasks.md` before broad implementation.
7. Execute only one unchecked sub-task or one explicitly requested small batch.
8. Use `project-validation-gate` before marking a task complete.
9. Only mark a task as `[x]` after validation passes or an acceptable documented exception exists.
10. Update `test-log.md` and `handoff.md`.
11. Use `project-doc-maintenance` to update affected formal docs and root README files if needed.
12. Use global repo-record skills after docs are synchronized, when their triggers apply.
13. Report changed code files, changed docs, validation result, current task status, and next recommended task.

### Documentation-Only Change

For documentation-only tasks:

1. Read this `AGENTS.md`.
2. Use `project-doc-routing` if the target docs are not obvious.
3. Use `project-playbook-routing` if the work is a docs sync, review, or workflow update.
4. Use `.ai/runs/` only if the documentation task is multi-step or expected to continue across sessions.
5. Update the requested docs.
6. Use `project-doc-maintenance` to check links, code paths, and README impact.
7. Do not modify code unless the user explicitly asks.
8. Do not write `.ai/logs/` or `.ai/dev-changelog/` from local docs skills.

### AI Run State Workflow

For complex work, use:

```text
.ai/runs/<yyyy-mm-dd__short-topic>/
  spec.md
  plan.md
  tasks.md
  test-log.md
  handoff.md
```

Rules:

- `spec.md` states what should change and what is out of scope.
- `plan.md` states how the change will be implemented.
- `tasks.md` is the executable checklist.
- `test-log.md` records commands, manual QA, results, and failures.
- `handoff.md` records current state, blockers, next step, and scope notes.
- Do not use `.ai/logs/` as the active task tracker.
- Do not mark a task complete unless validation passed or the exception is documented.
- If new work is discovered, append it to `tasks.md`; do not silently expand the current sub-task.

### README Update Rule

Update root README files only when a change affects public onboarding or high-level project understanding, including:

- top-level surfaces or entry behavior
- extension launch behavior
- optional New Tab behavior
- browser support
- permissions
- installation / build / test commands
- project structure
- major user-facing features
- documentation entry links

Small UI polish, internal refactors, and PageDocs-only corrections usually do not require README updates.

When either README is updated, update both `README.md` and `README.zh-CN.md` in the same work round unless the task explicitly targets one language only.

## Chrome API Boundary Rules

Prefer keeping Chrome API access at clear environment or adapter boundaries.

Recommended ownership:

- `chrome.bookmarks`, `chrome.storage`, and persistent extension data access should usually go through `src/lib/chrome/` adapters or dedicated feature services.
- `chrome.runtime`, `chrome.tabs`, `chrome.scripting`, commands, and message dispatch can appear in environment boundary files such as `src/background/`, popup clients, quick-save clients, and New Tab navigation / redirect files.
- Pure UI components should not introduce new direct `chrome.*` calls.

If a task requires a new Chrome API permission or changes host permissions, update:

- `public/manifest.json`
- `docs/architecture/overview.md`
- `docs/architecture/module-boundaries.md`
- `docs/product/requirements.md`
- `README.md` and `README.zh-CN.md` if the permission affects onboarding or public behavior

## UI Surface Documentation Rules

When changing UI, update the matching PageDocs under `docs/frontend/surfaces/` if the change affects maintainable knowledge.

Maintain these details when relevant:

- page entrypoint
- involved components and files
- buttons, inputs, icons, tabs, menus, dialogs, empty states
- CSS classes / selectors
- interaction states: default, hover, focus, active, loading, empty, error, disabled
- keyboard behavior
- message / storage / Chrome API chain
- reusable component boundaries

Surface mapping:

- Manager workspace → `docs/frontend/surfaces/manager/`
- Toolbar popup → `docs/frontend/surfaces/popup/`
- Quick Save overlay → `docs/frontend/surfaces/quick-save/`
- Optional New Tab → `docs/frontend/surfaces/newtab/`
- Shared UI and cross-surface behavior → `docs/frontend/surfaces/shared/`
- UI and code indexes → `docs/frontend/surfaces/reference/`

## Stop Rules

Stop and update `.ai/runs/<run-id>/handoff.md` when a run folder exists and any of these conditions apply:

- the selected sub-task is complete and validated;
- validation fails twice and the cause is unclear;
- implementation requires files outside the planned scope;
- the task conflicts with an accepted ADR;
- product behavior requires user judgment;
- a new permission, entrypoint, storage model, or architecture decision is needed;
- context is becoming too large;
- docs and code disagree and the correct source of truth is unclear.

## Definition Of Done

A task is not complete until:

- the intended code or documentation change is made;
- relevant validation has passed or the failure is clearly documented;
- `tasks.md` is updated when a run folder exists;
- `test-log.md` records commands, manual checks, and results when a run folder exists;
- `handoff.md` records current state and next step when a run folder exists;
- affected formal docs are synchronized;
- README files are updated when public onboarding changed;
- ADR impact is checked for durable decisions;
- worklog / changelog records are delegated to global repo-record skills when triggered.

## Validation

Use validation commands appropriate for the change. Prefer at least:

```bash
npm run typecheck
npm run test
npm run build
```

If a command is unavailable or fails for a pre-existing reason, state that clearly and do not claim success.

For documentation changes, also check:

- internal Markdown links
- referenced code paths
- README links
- image / GIF asset paths, if modified

## Safety And Maintainability

- Do not use temporary hacks when a maintainable change is possible.
- Do not delete docs or code to silence inconsistencies unless the deleted material is truly obsolete.
- Mark future/planned files as planned, not existing.
- Keep docs concise but specific enough for future agents and developers to navigate code.
- Prefer small, targeted documentation edits over broad rewrites when the architecture is already valid.
