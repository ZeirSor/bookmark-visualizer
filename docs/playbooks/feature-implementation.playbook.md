---
type: playbook
status: active
scope: ai-workflow
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Playbook: Feature Implementation

## When To Use

Use this playbook when adding or materially changing a user-visible feature.

Examples:

- adding a New Tab search setting;
- adding a popup save option;
- adding a manager workspace action;
- changing storage-backed feature behavior.

## Required Inputs

Read:

- `AGENTS.md`
- `.ai/README.md`
- `docs/workflow/README.md`
- `docs/workflow/run-folder-convention.md`
- relevant product docs under `docs/product/`
- relevant architecture docs under `docs/architecture/`
- relevant data docs under `docs/data/` if storage is involved
- relevant surface docs under `docs/frontend/surfaces/`

## Required Run Files

Complex feature work should use:

```text
.ai/runs/<run-id>/
  spec.md
  plan.md
  tasks.md
  test-log.md
  handoff.md
```

## Steps

1. Define user goal and acceptance criteria in `spec.md`.
2. Identify the affected surface, data, runtime, and documentation areas.
3. Write `plan.md` with likely files, sequencing, validation, and risks.
4. Break implementation into small sub-tasks in `tasks.md`.
5. Implement one sub-task or one explicitly requested small batch.
6. Run the validation gate.
7. Update `tasks.md`, `test-log.md`, and `handoff.md`.
8. Run `project-doc-maintenance` for affected formal docs.

## Required Checks

- Does the feature align with `docs/product/requirements.md`?
- Does it respect native bookmarks as source of truth?
- Does it avoid unnecessary permissions?
- Are Chrome API calls kept at appropriate boundaries?
- Are storage keys documented if added or changed?
- Are affected PageDocs updated?

## Validation

Use `docs/workflow/validation-gate.md` and `project-validation-gate`.

Prefer:

```bash
npm run typecheck
npm run test
npm run build
```

Add manual QA for the affected surface.

## Stop Rules

Stop when the selected sub-task is complete and validated, or when scope, permission, storage, ADR, or product uncertainty appears.
