---
type: workflow
status: active
scope: ai-workflow
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Run Folder Convention

A run folder stores the active state for one complex AI-assisted task or workstream.

## Location

```text
.ai/runs/<yyyy-mm-dd__short-topic>/
```

Examples:

```text
.ai/runs/2026-05-08__manager-page-ui-refactor/
.ai/runs/2026-05-08__popup-save-location-picker-fix/
.ai/runs/2026-05-08__newtab-search-settings/
```

Use lowercase words separated by hyphens in the topic part.

## Required Files

```text
spec.md
plan.md
tasks.md
test-log.md
handoff.md
```

## File Responsibilities

| File | Responsibility | Should not contain |
|---|---|---|
| `spec.md` | Goal, scope, acceptance criteria, constraints | implementation transcript |
| `plan.md` | implementation approach, impacted files, validation strategy | final worklog |
| `tasks.md` | executable checklist and status | long reasoning or raw logs |
| `test-log.md` | commands, manual QA, results, failures | product requirements |
| `handoff.md` | current state, next task, blockers | full chat history |

## Creation Rules

Create a run folder when any of these are true:

- the task changes multiple files;
- the task has more than three meaningful steps;
- the task changes UI behavior, storage, architecture, or Chrome API boundaries;
- the task may continue in another session;
- the user asks for Agent-driven execution or task checklists.

Do not create a run folder for small one-off explanations or tiny obvious documentation edits.

## Completion Rules

A run is complete when:

- all required tasks are `[x]` or intentionally cancelled;
- validation results are recorded;
- affected formal docs are synchronized;
- `handoff.md` states that no next task remains;
- a historical worklog is written if triggered by project rules.

Completed run folders may remain in `.ai/runs/` for near-term reference or move to `.ai/archive/` later.
