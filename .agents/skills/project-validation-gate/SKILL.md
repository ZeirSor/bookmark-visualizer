---
name: project-validation-gate
description: Use before marking project tasks complete to select required validation commands, manual checks, and test-log updates from generic rules plus the repository validation profile.
stage: validation
follows:
  - project-run-orchestration
precedes:
  - project-doc-maintenance
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

1. `AGENTS.md`
2. `.agents/project-profile/docs-system.md` if present
3. `.agents/project-profile/validation.md` if present
4. `docs/workflow/validation-gate.md` if present
5. `references/validation-command-map.md`
6. `references/manual-qa-checklist-map.md`
7. current run `tasks.md` and `test-log.md` if a run folder exists

If the profile is missing or a command is unavailable, inspect `package.json` and test configuration, then record the limitation.

## Workflow

1. Identify change type and affected areas.
2. Select command checks from the project validation profile, falling back to generic command families.
3. Select manual checks from the project profile, falling back to generic scenario categories.
4. Run or request the relevant validation.
5. Decide whether the task may be marked complete.
6. Record results in `test-log.md` when a run folder exists.

## Completion Rule

Do not mark a task `[x]` until relevant validation passes or an exception is documented as unavailable, unrelated, or pre-existing.

## Output Format

```md
## Validation Gate

Change type: <type>
Required commands:
- `<command>` - <why>

Manual checks:
- <check or none>

Can mark complete: <yes | no>
Test-log update:
- <entry to record>

Profile notes:
- <missing/stale/assumed profile details, or none>
```

## Portability Rule

Do not hard-code project commands, platform-specific manual QA, source paths, or product surfaces in this skill. Put those details in `.agents/project-profile/validation.md`.
