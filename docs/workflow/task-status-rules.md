# Task Status Rules

`tasks.md` is the execution state file for a run folder.

## Status Markers

Use a small status vocabulary:

```text
[ ] not complete
[x] complete and validated
[!] blocked
[-] cancelled or no longer needed
```

Avoid adding many intermediate statuses. If progress details are needed, write them below the task or in `handoff.md`.

## Completion Rule

A task can be marked `[x]` only when:

- the intended change is complete;
- relevant validation passed; or
- an exception is documented in `test-log.md` with cause and risk.

Do not mark a task complete just because code was edited.

## Parent / Child Rule

A parent task can be marked `[x]` only after all required child tasks are `[x]` or `[-]`.

Example:

```md
- [ ] 1.0 Popup Save Location Picker
  - [x] 1.1 Identify current component and CSS chain
  - [x] 1.2 Fix menu clipping
  - [ ] 1.3 Validate popup save flow
```

Here `1.0` must remain unchecked because `1.3` is still open.

## Scope Expansion Rule

If the Agent discovers new work:

- add it as a new unchecked task;
- do not silently include it in the current sub-task;
- mention it in `handoff.md`.

## Task Size Rule

A good sub-task should be small enough to implement, validate, and explain in one work round.

Prefer:

```md
- [ ] 2.1 Move shared folder cascade row layout styles into the shared component stylesheet.
```

Avoid:

```md
- [ ] 2.0 Rewrite all folder picker behavior.
```
