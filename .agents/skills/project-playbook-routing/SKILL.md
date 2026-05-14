---
name: project-playbook-routing
description: Use before planning or implementation to select the relevant project playbook for feature work, UI refactors, bugfixes, docs sync, reviews, validation investigations, or AI workflow changes.
---

# Project Playbook Routing

## Purpose

Use this skill to select a reusable execution manual for the current task.

It answers:

- What repeatable workflow does this task match?
- Which playbook should constrain execution?
- Should multiple playbooks be combined?
- Is a run folder recommended?

This skill does not implement code, update docs, run validation, or write logs.

## Required Inputs

Read:

1. `AGENTS.md`
2. `.agents/project-profile/ai-workflow.md` if present
3. `docs/playbooks/README.md` if present
4. `references/playbook-routing-matrix.md`

If the repository has no playbook docs, use the generic matrix to recommend the nearest workflow and note that a project playbook should be added before repeated work.

## Workflow

1. Classify the request by work type.
2. Choose one primary playbook or nearest workflow.
3. Add secondary playbooks only when they materially constrain the work.
4. Recommend a run folder when the work is multi-file, multi-step, validation-heavy, or likely to continue across sessions.
5. Return only the routing decision and rationale.

## Output Format

```md
## Playbook Routing

Primary playbook:
- `<path or workflow>` - <why>

Secondary playbooks:
- `<path or workflow>` - <why or none>

Run folder recommended: <yes | no>

Profile notes:
- <missing/stale/assumed profile details, or none>
```

## Portability Rule

Keep the matrix generic. Project-specific playbook names, workflow docs, or run-folder policies belong in `.agents/project-profile/ai-workflow.md`.
