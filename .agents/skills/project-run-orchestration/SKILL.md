---
name: project-run-orchestration
description: Use for complex or multi-step project work to create, resume, and maintain run folders with spec, plan, tasks, test-log, and handoff files using the repository's AI workflow profile.
metadata:
  stage: execution-state
  follows:
    - project-doc-routing
    - project-playbook-routing
  precedes:
    - project-validation-gate
---

# Project Run Orchestration

## Purpose

Use this skill to turn a broad request into resumable Markdown-controlled execution state.

It answers:

- Does this task need a run folder?
- Which run folder should be used?
- What should go in `spec.md`, `plan.md`, `tasks.md`, `test-log.md`, and `handoff.md`?
- What is the next executable sub-task?
- What must be updated before stopping?

This skill does not replace formal product docs, architecture docs, PageDocs, ADRs, worklogs, or changelogs.

## Required Inputs

Read:

1. `AGENTS.md`
2. `.agents/project-profile/ai-workflow.md` if present
3. `.ai/README.md` if present
4. `docs/workflow/run-folder-convention.md` if present
5. `docs/workflow/task-status-rules.md` if present
6. `docs/workflow/stop-and-handoff-rules.md` if present
7. `references/run-folder-template.md`
8. `references/task-breakdown-rules.md`
9. `references/handoff-rules.md`

## When To Use

Use this skill when a task:

- touches multiple files or documentation layers;
- changes product behavior, UI, data, storage, architecture, validation, workflow, or project skills;
- has more than three meaningful steps;
- may continue across sessions;
- needs task checkboxes or Agent handoff;
- explicitly mentions spec-driven, task-driven, playbook-driven, or Agent workflow.

Skip for tiny direct edits or pure explanation.

## Workflow

1. Decide whether the task needs a run folder.
2. If yes, create or resume the run folder path defined by the project profile or `references/run-folder-template.md`.
3. Ensure required files exist: `spec.md`, `plan.md`, `tasks.md`, `test-log.md`, `handoff.md`.
4. If starting a new run, populate files from the project template if present.
5. Identify the first unchecked executable sub-task.
6. After implementation and validation, update `tasks.md`, `test-log.md`, and `handoff.md`.
7. Stop when required by project stop rules.

## Output Format

```md
## Run Orchestration

Mode: <create | resume | direct-skip>
Run folder: `<path or none>`
Current task: `<task id and title>`
Required updates before stop:
- tasks.md
- test-log.md
- handoff.md
```

## Portability Rule

Keep this skill focused on the generic run-state shape. Repository-specific templates, naming, stop rules, and docs to sync belong in `.agents/project-profile/ai-workflow.md` or workflow docs.
