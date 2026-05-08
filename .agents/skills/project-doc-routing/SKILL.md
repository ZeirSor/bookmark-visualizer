---
name: project-doc-routing
description: Use before implementation or analysis to route a task to the smallest relevant set of formal project docs. This skill identifies docs to read and docs likely affected; it does not update documentation or write logs.
---

# Project Doc Routing

## Purpose

Use this skill before implementation, investigation, or documentation editing to find the formal project documents that provide the right context.

This skill is a context router. It answers:

- What type of change is this?
- Which docs should be read before implementation?
- Which docs are likely to require updates after implementation?
- Which docs are intentionally not needed?

This skill does **not** perform documentation maintenance. Use `project-doc-maintenance` after implementation and validation to synchronize docs with the current code.

## Owned Scope

This skill routes formal project documentation:

- `docs/product/`
- `docs/architecture/`
- `docs/data/`
- `docs/frontend/surfaces/`
- `docs/guides/`
- `docs/standards/`
- `docs/workflow/`
- `docs/playbooks/`
- `docs/adr/`
- `README.md`
- `README.zh-CN.md`

## Out Of Scope

This skill does not maintain or write:

- `.ai/logs/`
- `.ai/dev-changelog/`
- `.ai/runs/` task state, except to identify whether workflow docs should be read
- `CHANGELOG.md`
- release notes
- ADRs, except to identify when an ADR workflow may be needed
- test reports

Global repo-record skills own transient work records and changelog-style records.

## When To Use

Use this skill before starting work when a task involves any of the following:

- product behavior
- Manager workspace
- toolbar popup
- Quick Save
- optional New Tab
- shared UI components
- settings
- storage keys
- metadata
- Chrome API boundaries
- background service worker routing
- manifest permissions
- docs structure
- AI workflow docs
- playbook docs
- README content
- architecture boundaries
- testing or acceptance instructions

Skip this skill only for very small edits where the target doc or file is explicitly named and no surrounding context is needed.

## Workflow

1. Classify the task.
2. Look up the task in `references/doc-routing-matrix.md`.
3. Return the smallest useful reading set.
4. Identify likely post-change docs for `project-doc-maintenance`.
5. Note docs that are not needed to avoid broad context loading.

## Output Format

Return a short routing note in this structure:

```md
## Doc Routing

Task type: <type>

Read before work:
- <doc path> — <why>

Likely affected after work:
- <doc path> — <why>

Probably not needed:
- <doc path or area> — <why>
```

Keep the routing narrow. Do not list every doc in the repository.

## Routing Principles

- Prefer page-level PageDocs for UI tasks.
- Prefer `docs/data/storage.md` for storage key and metadata changes.
- Prefer `docs/architecture/module-boundaries.md` for ownership / dependency changes.
- Prefer root README files only for public onboarding, entrypoint, feature, browser support, permission, command, or docs-index changes.
- Prefer `docs/workflow/` and `docs/playbooks/` for Agent execution rules, not product facts.
- Prefer ADR only for durable decisions, not ordinary implementation changes.
- When unsure whether a doc is affected, mark it as "likely affected" for the maintenance skill to verify later.
