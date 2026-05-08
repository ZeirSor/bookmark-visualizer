---
name: project-run-orchestration
description: Use for complex or multi-step project work to create, resume, and maintain .ai/runs run folders with spec, plan, tasks, test-log, and handoff files.
---

# Project Run Orchestration

## Purpose

Use this skill to turn a broad request into a resumable Markdown-controlled execution state.

It answers:

- Does this task need a run folder?
- Which run folder should be used?
- What should go in `spec.md`, `plan.md`, `tasks.md`, `test-log.md`, and `handoff.md`?
- What is the next executable sub-task?
- What must be updated before stopping?

## When To Use

Use this skill when a task:

- touches multiple files;
- changes UI, product behavior, storage, architecture, validation, or Chrome API boundaries;
- has more than three meaningful steps;
- may continue across sessions;
- needs task checkboxes or Agent handoff;
- explicitly mentions Spec-driven, task-driven, playbook-driven, or Agent workflow.

Skip for tiny direct edits or pure explanation.

## Required Inputs

Read:

- `AGENTS.md`
- `.ai/README.md`
- `docs/workflow/run-folder-convention.md`
- `docs/workflow/task-status-rules.md`
- `docs/workflow/stop-and-handoff-rules.md`
- `references/run-folder-template.md`
- `references/task-breakdown-rules.md`
- `references/handoff-rules.md`

## Workflow

1. Decide whether the task needs a run folder.
2. If yes, create or resume `.ai/runs/<run-id>/`.
3. Ensure required files exist:
   - `spec.md`
   - `plan.md`
   - `tasks.md`
   - `test-log.md`
   - `handoff.md`
4. If starting a new run, populate files from `.ai/runs/_TEMPLATE/`.
5. Identify the first unchecked executable sub-task.
6. After implementation and validation, update:
   - `tasks.md`
   - `test-log.md`
   - `handoff.md`
7. Stop when required by the stop rules.

## Output Format

Return a short run note:

```md
## Run Orchestration

Mode: <create | resume | direct-skip>
Run folder: `.ai/runs/<run-id>/`
Current task: `<task id and title>`
Required updates before stop:
- tasks.md
- test-log.md
- handoff.md
```

## Non-Goals

This skill does not replace product docs, architecture docs, PageDocs, ADRs, worklogs, or changelogs.
