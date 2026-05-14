# Generic Run Folder Template Reference

A run folder should contain:

```text
<run-root>/<yyyy-mm-dd__short-topic>/
  spec.md
  plan.md
  tasks.md
  test-log.md
  handoff.md
```

Use the repository's project profile or `.ai/README.md` to identify `<run-root>`. If no project rule exists, recommend `.ai/runs/`.

## Naming

Use:

```text
YYYY-MM-DD__short-kebab-topic
```

Examples:

- `2026-05-14__popup-save-location-picker`
- `2026-05-14__ui-refactor`
- `2026-05-14__validation-rule-update`

## Required First Pass

Before implementation begins, ensure:

- `spec.md` states user request, goal, scope, affected areas, acceptance criteria, and constraints;
- `plan.md` names relevant docs, selected workflow, likely files, implementation strategy, validation strategy, risks, and rollback notes;
- `tasks.md` has small executable sub-tasks;
- `test-log.md` is ready to record validation;
- `handoff.md` identifies current state and next task.
