---
name: project-validation-gate
description: Use before marking tasks complete to select required validation commands, manual QA checks, and test-log updates for Bookmark Visualizer changes.
---

# Project Validation Gate

## Purpose

Use this skill before marking any task complete.

It answers:

- Which validation commands should run?
- Which manual QA checks are needed?
- Can the task be marked `[x]`?
- What should be recorded in `test-log.md`?

## Required Inputs

Read:

- `AGENTS.md`
- `docs/workflow/validation-gate.md`
- `references/validation-command-map.md`
- `references/manual-qa-checklist-map.md`
- current run `tasks.md` and `test-log.md` if a run folder exists

## Workflow

1. Identify change type.
2. Select command checks.
3. Select manual QA checks.
4. Run or request the relevant validation.
5. Decide whether the task may be marked complete.
6. Record results in `test-log.md` when a run folder exists.

## Documentation Path Validation Rule

For documentation-only, AI workflow, local skill, or validation-command changes that touch path references, include `npm run docs:check`.

The docs path check validates active source-of-truth docs and skills. It must exclude historical/generated records:

- `.ai/logs/`
- `.ai/dev-changelog/`
- `.ai/archive/`
- concrete `.ai/runs/*` folders except `.ai/runs/_TEMPLATE/`
- `node_modules/`
- `dist/`
- `docs/tmp/`

Do not require mass-editing historical AI logs to satisfy current path validation. Future or proposed paths are acceptable only when nearby text clearly marks them as future, proposed, planned, or not current implementation.

## Output Format

```md
## Validation Gate

Change type: <type>
Required commands:
- `<command>` — <why>

Manual QA:
- <check>

Completion decision: <pass | blocked | exception-documented>
Test log update: <path or none>
```

## Completion Rule

Do not mark tasks complete unless validation passed or a documented exception explains why the failure is unrelated, pre-existing, or impossible to run in the current environment.
