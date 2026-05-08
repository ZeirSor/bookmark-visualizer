# Run Folder Template Reference

A run folder should contain:

```text
.ai/runs/<yyyy-mm-dd__short-topic>/
  spec.md
  plan.md
  tasks.md
  test-log.md
  handoff.md
```

Use `.ai/runs/_TEMPLATE/` as the source template.

## Naming

Use:

```text
YYYY-MM-DD__short-kebab-topic
```

Examples:

- `2026-05-08__popup-save-location-picker`
- `2026-05-08__manager-page-ui-refactor`
- `2026-05-08__newtab-search-settings`

## Required First Pass

Before implementation begins, ensure:

- `spec.md` has a clear goal, scope, and acceptance criteria;
- `plan.md` names likely affected files and validation strategy;
- `tasks.md` has executable sub-tasks;
- `test-log.md` is ready to record validation;
- `handoff.md` identifies the current state and next task.
