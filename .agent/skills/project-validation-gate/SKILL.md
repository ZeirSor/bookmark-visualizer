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
