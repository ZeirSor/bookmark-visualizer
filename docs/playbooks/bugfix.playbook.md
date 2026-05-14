---
type: playbook
status: active
scope: ai-workflow
owner: project
last_verified: 2026-05-14
source_of_truth: true
---

# Playbook: Bugfix

## When To Use

Use this playbook when fixing a specific defect, mismatch, regression, or UI behavior problem.

Examples:

- folder icon alignment breaks when names are long;
- cascade menu is clipped by a popup container;
- Quick Save cannot reopen;
- New Tab redirect state is inconsistent;
- storage-backed UI shows stale state.

## Required Inputs

Read:

- `AGENTS.md`
- relevant product / surface docs;
- relevant code paths;
- relevant regression checklist;
- existing ADRs if the fix touches architecture or runtime behavior.

## Bugfix Rules

- Reproduce or clearly describe the bug before changing code.
- Identify likely root cause.
- Prefer the smallest maintainable fix.
- Do not perform unrelated refactors.
- Do not delete code just to hide the issue.
- Add a regression check where reasonable.
- Update docs only if durable behavior, selectors, flows, or known constraints changed.

## Steps

1. Capture symptom, expected behavior, and actual behavior.
2. Locate affected files and ownership boundaries.
3. Identify root cause or best-supported hypothesis.
4. Plan minimal maintainable fix.
5. Implement the fix.
6. Run validation and focused regression checks.
7. Update `test-log.md`, `tasks.md`, and `handoff.md` when a run folder exists.
8. Update formal docs if behavior or maintainable knowledge changed.

## Validation

Use the narrowest test that proves the bug is fixed, plus broader checks when the code path is shared.

Common set:

```bash
npm run typecheck
npm run test
npm run build
```

Manual QA should recreate the original bug condition.

## Stop Rules

Stop when:

- root cause is unclear after two reasonable attempts;
- the fix requires architecture or product changes beyond the task;
- validation fails in a way that cannot be confidently tied to the current change.
