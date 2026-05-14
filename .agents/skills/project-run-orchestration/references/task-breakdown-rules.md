# Generic Task Breakdown Rules

## Good Task Shape

A good sub-task is:

- specific;
- verifiable;
- small enough for one focused work round;
- tied to a file, component, behavior, doc update, validation step, or workflow rule;
- not a hidden bundle of unrelated cleanup.

## Checklist Rules

Use:

```text
[ ] not complete
[x] complete and validated
[!] blocked
[-] cancelled or no longer needed
```

Only mark `[x]` after validation passes or an exception is documented.

## Parent Task Rule

A parent task is complete only when all required child tasks are complete or cancelled.

## Scope Discovery Rule

If a new issue appears, append it as a new task. Do not silently expand the current task.
