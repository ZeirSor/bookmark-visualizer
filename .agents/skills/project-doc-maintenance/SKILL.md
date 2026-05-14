---
name: project-doc-maintenance
description: Use after implementation and validation to synchronize formal project docs and README files with the current repository, using the project profile for repository-specific paths and rules.
---

# Project Doc Maintenance

## Purpose

Use this skill near the end of a work round to keep formal documentation aligned with actual code, configuration, and workflow state.

This skill maintains:

- formal docs named by the project profile;
- README files named by the project profile;
- documentation indexes and cross-links affected by the change.

This skill does not write `.ai/logs/`, dev changelogs, release changelogs, or ADRs unless a separate workflow explicitly triggers those records.

## Required Inputs

Read in this order:

1. `AGENTS.md`
2. `.agents/project-profile/docs-map.md`
3. `.agents/project-profile/surfaces.md` for UI, data-flow, entrypoint, or runtime changes
4. `references/doc-maintenance-checklist.md`
5. `references/readme-sync-rules.md`
6. `references/surface-doc-sync-map.md`

If a run folder exists, also read its `plan.md`, `tasks.md`, `test-log.md`, and `handoff.md`.

## Workflow

1. Identify changed files and classify the durable facts affected.
2. Use the project profile to select candidate docs and README files.
3. Compare docs to current code or configuration; do not copy temporary run progress into formal docs.
4. Patch only stale or missing durable facts.
5. Update indexes and README files only when the profile rules require it.
6. Record what was synchronized in run state when a run folder exists.

## Output Format

```md
## Doc Maintenance

Change type: <type>

Docs checked:
- `<path>` - <result>

Docs updated:
- `<path>` - <what changed or none>

README decision:
- <updated | not needed> - <why>

Profile notes:
- <missing/stale/assumed profile details, or none>
```

## Portability Rule

Keep product-specific docs, source paths, surface names, platform APIs, README language variants, and manual QA details in `.agents/project-profile/`, not in this skill body.
