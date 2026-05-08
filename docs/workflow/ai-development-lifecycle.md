# AI Development Lifecycle

This lifecycle converts a broad user request into a controlled, resumable, and verifiable development process.

## Lifecycle Overview

```text
1. Classify work
2. Route docs
3. Select playbook
4. Create or resume run folder
5. Write or update spec
6. Write or update plan
7. Break tasks into executable sub-tasks
8. Implement one sub-task or a small requested batch
9. Validate
10. Update task state, test log, and handoff
11. Synchronize formal docs
12. Write historical worklog when triggered
```

## 1. Classify Work

Choose one of three modes:

- Direct Mode: small, obvious, low-risk work.
- Spec-run Mode: complex work that needs `.ai/runs/<run-id>/` state.
- Playbook Mode: repeatable workflow such as feature implementation, UI refactor, bugfix, docs sync, or review.

Many real tasks use both Spec-run Mode and Playbook Mode.

## 2. Route Docs

Use `project-doc-routing` to find the smallest relevant reading set.

The goal is to avoid two failure modes:

- not reading the docs that define current facts;
- loading the entire docs tree and wasting context.

## 3. Select Playbook

Use `project-playbook-routing` when the task matches a repeatable workflow.

Examples:

- New feature → `docs/playbooks/feature-implementation.playbook.md`
- UI surface refactor → `docs/playbooks/ui-surface-refactor.playbook.md`
- Bug fix → `docs/playbooks/bugfix.playbook.md`
- Docs sync → `docs/playbooks/docs-sync.playbook.md`
- Review / audit → `docs/playbooks/review.playbook.md`

## 4. Create Or Resume Run Folder

For complex work, create or resume:

```text
.ai/runs/<yyyy-mm-dd__short-topic>/
```

Use `.ai/runs/_TEMPLATE/` as the template.

## 5. Write Or Update Spec

`spec.md` should define:

- user-visible goal;
- in-scope and out-of-scope boundaries;
- affected surfaces / modules;
- acceptance criteria;
- constraints.

The spec should not describe every code change. That belongs in `plan.md` and `tasks.md`.

## 6. Write Or Update Plan

`plan.md` should define:

- current understanding;
- relevant docs read;
- selected playbook;
- likely files to touch;
- implementation strategy;
- validation strategy;
- risks and rollback notes.

## 7. Break Tasks

`tasks.md` should contain small executable sub-tasks.

Good sub-task:

```md
- [ ] 1.2 Extract the Popup save-location field into a reusable component without changing behavior.
```

Bad sub-task:

```md
- [ ] Refactor the whole popup.
```

## 8. Implement One Sub-task

Do not implement the whole task list unless the user explicitly asks and the list is small.

Default behavior:

- pick the first unchecked sub-task;
- implement only that sub-task;
- avoid unrelated cleanup;
- add newly discovered work to `tasks.md` instead of expanding scope silently.

## 9. Validate

Use `project-validation-gate` and `docs/workflow/validation-gate.md`.

Do not mark a task complete until validation passes or the failure is clearly documented as unrelated / pre-existing.

## 10. Update Run State

After each sub-task:

- update `tasks.md`;
- update `test-log.md`;
- update `handoff.md`.

## 11. Synchronize Formal Docs

Use `project-doc-maintenance` after implementation and validation.

Update formal docs only when the change affects durable facts:

- product behavior;
- UI surface structure;
- architecture boundaries;
- data and storage;
- validation commands;
- public README-level understanding.

Do not copy temporary task progress into `docs/`.

## 12. Write Historical Worklog

After a non-lightweight work round, global repo-record skills may write `.ai/logs/` or `.ai/dev-changelog/` records.

Local docs skills do not own those records.
