---
name: project-playbook-routing
description: Use before planning or implementation to select the relevant docs/playbooks execution manual for feature work, UI refactors, bugfixes, docs sync, or reviews.
---

# Project Playbook Routing

## Purpose

Use this skill to select a reusable playbook for the current task.

It answers:

- What kind of repeatable workflow is this?
- Which `docs/playbooks/*.playbook.md` file applies?
- Should multiple playbooks be combined?
- Which workflow docs should be read before execution?

## When To Use

Use this skill for tasks involving:

- feature implementation;
- UI surface refactor;
- bugfix;
- documentation synchronization;
- review / audit;
- AI workflow changes.

Skip this skill only for tiny direct edits where no repeatable workflow is needed.

## Required Inputs

Read:

- `AGENTS.md`
- `docs/playbooks/README.md`
- `references/playbook-routing-matrix.md`

## Workflow

1. Classify the task.
2. Choose a primary playbook.
3. Add secondary playbooks only if needed.
4. Return the chosen playbook path and why.
5. Note whether a run folder is recommended.

## Output Format

```md
## Playbook Routing

Primary playbook:
- `<path>` — <why>

Secondary playbooks:
- `<path>` — <why or none>

Run folder recommended: <yes | no>
```

## Non-Goals

This skill does not implement code, update docs, run validation, or write logs.
