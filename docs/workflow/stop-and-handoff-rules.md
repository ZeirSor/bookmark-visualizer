# Stop And Handoff Rules

Stop rules prevent long Agent runs from drifting, over-editing, or losing state.

## Required Stop Conditions

When a run folder exists, stop and update `handoff.md` when any of these happen:

- the selected sub-task is complete and validated;
- validation fails twice and the cause is unclear;
- implementation requires files outside the planned scope;
- a new Chrome permission, entrypoint, storage model, or architecture decision is needed;
- the task conflicts with an accepted ADR;
- product behavior requires user judgment;
- docs and code disagree and the correct source of truth is unclear;
- context is becoming too large for safe continuation.

## Handoff Must Include

`handoff.md` should state:

- current state;
- last completed task;
- next recommended task;
- blockers;
- validation state;
- docs sync state;
- newly discovered scope;
- context needed by the next Agent.

## Do Not Use Handoff For

- full chat transcript;
- raw terminal logs;
- permanent product requirements;
- durable architecture decisions.

Raw validation details belong in `test-log.md`. Durable facts belong in `docs/` or ADR.
