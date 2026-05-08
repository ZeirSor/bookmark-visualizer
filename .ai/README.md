# .ai

`.ai/` stores AI collaboration state and historical records. It is not the formal product documentation source and does not replace `docs/` or ADRs.

## Directory Roles

```text
.ai/
  runs/             Active or resumable task state
  logs/             Per-round historical worklogs
  dev-changelog/    Same-day or phase-level development summaries
  archive/          Optional storage for obsolete or completed run folders
```

## Run Folder Contract

Each complex task should use:

```text
.ai/runs/<yyyy-mm-dd__short-topic>/
  spec.md
  plan.md
  tasks.md
  test-log.md
  handoff.md
```

File roles:

- `spec.md`: what should change, why it matters, acceptance criteria, and out-of-scope boundaries.
- `plan.md`: how the change will be implemented, impacted files, sequencing, risks, and rollback notes.
- `tasks.md`: executable checklist with `[ ]`, `[x]`, and `[!]` task states.
- `test-log.md`: validation commands, manual QA checks, results, failures, and exceptions.
- `handoff.md`: current state, blockers, next step, scope changes, and context needed by the next Agent.

Use `.ai/runs/_TEMPLATE/` when creating a new run folder.

## Important Distinction

- `.ai/runs/` records what the current or next Agent should do next.
- `.ai/logs/` records what already happened in a completed work round.
- `.ai/dev-changelog/` records broader development summaries.
- `docs/` records current system facts.
- `docs/adr/` records durable decisions and why they were made.

Do not use `.ai/logs/` as the active task tracker. Use `.ai/runs/<run-id>/tasks.md` for active execution.

Do not use `.ai/runs/` as a permanent product fact source. Once a run produces durable product, architecture, data, UI, validation, or documentation rules, synchronize those facts into `docs/` or `docs/adr/`.

## Worklog Trigger Conditions

Write a worklog under `.ai/logs/` after a non-lightweight work round when one or more of these happened:

- code changed;
- formal docs changed;
- architecture, UI, data, or product analysis was completed;
- tests, builds, acceptance checks, or troubleshooting were performed;
- meaningful follow-up work was left for a future Agent.

Lightweight Q&A, pure explanation, or short analysis with no repository state change does not require a worklog.

## Worklog Naming

Recommended format:

```text
.ai/logs/YYYY-MM-DD__vNNN__short-topic.md
```

If the day already has sequential records, increment `vNNN`. For manually added one-off records, this form is also acceptable:

```text
.ai/logs/YYYY-MM-DD__short-topic.md
```

## Worklog Template

```md
# <short topic>

## Context

- User request:
- Current code / docs baseline:

## Changes

- Files changed or analyzed:
- Key conclusions:

## Validation

- Commands run:
- Result:
- Not run reason:

## Docs Sync

- Docs synchronized:
- README impact:
- ADR impact:

## Follow-ups

- Suggested next steps:
- Risks:
```