# AI Workflow Profile

This file defines repository-specific workflow conventions for local agent work.

## Run State

```yaml
run_root: .ai/runs
run_folder_pattern: YYYY-MM-DD__short-kebab-topic
required_files:
  - spec.md
  - plan.md
  - tasks.md
  - test-log.md
  - handoff.md
```

## Documentation System Work

Use `project-doc-system-builder` when the task is to create, migrate, extend, or audit the docs system. Use `project-doc-maintenance` for routine post-change documentation sync.

## Stop Rule

Before stopping a complex task, record:

- current state;
- completed tasks;
- validation results;
- docs sync status;
- next recommended task.
