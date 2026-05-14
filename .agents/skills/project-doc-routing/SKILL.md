---
name: project-doc-routing
description: Use before implementation, investigation, review, or documentation editing to route a task to the smallest relevant set of project docs by combining generic routing heuristics with the repository profile.
---

# Project Doc Routing

## Purpose

Use this skill before work starts to find the smallest useful documentation context.

It answers:

- What kind of task is this?
- Which project docs should be read before work?
- Which docs are likely affected after work?
- Which docs are intentionally out of scope?

This skill does not update docs, run validation, write run state, or write logs.

## Required Inputs

Read in this order:

1. `AGENTS.md`
2. `.agents/project-profile/docs-map.md`
3. `.agents/project-profile/surfaces.md` when the task mentions a UI surface, source path, entrypoint, data flow, or runtime boundary
4. `references/doc-routing-matrix.md`

If the profile is missing or appears stale, run `.agents/skills/project-doc-routing/scripts/discover-project-profile.mjs` or inspect the repo structure, then state the uncertainty in the routing note.

## Workflow

1. Classify the task by intent: product, UI, data, architecture, validation, docs, AI workflow, review, or mixed.
2. Use the project profile to map user language and code paths to docs.
3. Keep the reading set narrow; prefer the most specific page or domain docs.
4. Identify likely post-change docs for `project-doc-maintenance`.
5. Explicitly list docs that are not needed when that prevents broad context loading.

## Output Format

```md
## Doc Routing

Task type: <type>

Read before work:
- `<doc path>` - <why>

Likely affected after work:
- `<doc path>` - <why>

Probably not needed:
- `<doc path or area>` - <why>

Profile notes:
- <missing/stale/assumed profile details, or none>
```

## Portability Rule

Do not hard-code product names, source paths, surface names, README language variants, or validation commands in this skill. Put repository-specific facts in `.agents/project-profile/`.
